import test from 'node:test';import assert from 'node:assert/strict';
import {parsePlan,kpis,Router,schedule,safeError} from './engine.mjs';import {endpoint,readRPC,MCP} from './mcp.mjs';
const task=(id,agent='mai',deps=[])=>({id,agent,title:'Việc '+id,instruction:'Tạo đầu ra',weight:10,deps});
const plan=ts=>parsePlan(JSON.stringify({title:'Test',tasks:ts})).tasks;
test('reject cyclic, unknown and duplicated task references',()=>{
 for(const ts of [[task('T1','mai',['T2']),task('T2','lan',['T1'])],[task('T1','mai',['T3'])],[task('T1'),task('T1')],[task('T1','rogue')]])assert.throws(()=>plan(ts));
});
test('scheduler honors deps, limits concurrency, blocks failure descendants',async()=>{
 const tasks=plan([task('T1'),task('T2','lan'),task('T3','sen',['T1','T2']),task('T4','an',['T3'])]);let active=0,max=0;
 await schedule(tasks,async t=>{max=Math.max(max,++active);for(const id of t.deps)assert.equal(tasks.find(d=>d.id===id).status,'produced');await new Promise(r=>setTimeout(r,4));active--;if(t.id==='T3')throw Error('failed QA');return 'output'},{concurrency:2});assert.equal(max,2);assert.deepEqual(tasks.map(t=>t.status),['produced','produced','error','blocked']);assert.equal(kpis(tasks).produced,50);assert.equal(kpis(tasks).accepted,0);tasks[0].accepted=true;assert.equal(kpis(tasks).accepted,25);
});
test('cancel in-flight and queued jobs without producing false completion',async()=>{
 const tasks=plan([task('T1'),task('T2','lan',['T1'])]),c=new AbortController();await schedule(tasks,async()=>{c.abort();return 'late output'},{signal:c.signal});assert.deepEqual(tasks.map(t=>t.status),['cancelled','cancelled']);assert.equal(kpis(tasks).produced,0);
});
test('OpenRouter auth, tool loop, usage accounting and role model selection',async()=>{
 let calls=0,invoked=false;const api=new Router({key:'secret-value',model:'model/base',codeModel:'model/code',fetchImpl:async(url,o)=>{assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');assert.equal(o.headers.Authorization,'Bearer secret-value');const b=JSON.parse(o.body);assert.equal(b.model,'model/code');assert.equal(JSON.stringify(b).includes('secret-value'),false);calls++;return Response.json({usage:{total_tokens:20,cost:.001},choices:[{finish_reason:'stop',message:calls===1?{role:'assistant',content:null,tool_calls:[{id:'call1',type:'function',function:{name:'mcp_0',arguments:'{"query":"CRS"}'}}]}:{role:'assistant',content:'Nội dung có kết quả công cụ'}}]})}});
 const t={...task('T1','truc'),output:''};const out=await api.execute(t,'GIS',[t],{tools:[{type:'function',function:{name:'mcp_0',parameters:{type:'object'}}}],invoke:async(n,a)=>{invoked=true;assert.equal(a.query,'CRS');return {content:[{type:'text',text:'ok'}]}}});assert(invoked);assert(out.includes('kết quả'));assert.equal(api.cost,.002);assert.equal(api.tokens,40);
});
test('API limits and truncation are errors, unknown cost is not called free',async()=>{
 const r=new Router({key:'k',model:'m',maxCalls:1,fetchImpl:async()=>Response.json({choices:[{finish_reason:'length',message:{content:'partial'}}]})});await assert.rejects(()=>r.chat([]),/bị cắt/);assert.equal(r.unknownCost,1);await assert.rejects(()=>r.chat([]),/giới hạn/);
 const error=new Router({key:'k',model:'m',fetchImpl:async()=>new Response('',{status:402})});await assert.rejects(()=>error.chat([]),/tín dụng/);
});
test('SSE notification, fragmented response, JSON-RPC error and wrong id',async()=>{
 let progress=0;const stream=new ReadableStream({start(c){for(const s of ['event: message\r\ndata: {"method":"notifications/progress","params":{"progress":3}}\r\n\r\n','data: {"jsonrpc":"2.0","id":7,','"result":{"content":[]}}\n\n'])c.enqueue(new TextEncoder().encode(s));c.close()}});assert.deepEqual(await readRPC(new Response(stream,{headers:{'content-type':'text/event-stream'}}),7,()=>progress++),{content:[]});assert.equal(progress,1);await assert.rejects(()=>readRPC(Response.json({id:8,result:{}}),7),/sai mã/);await assert.rejects(()=>readRPC(Response.json({id:7,error:{code:-1}}),7),/JSON-RPC/);
});
test('MCP initialize, session headers, pagination and authorized calls',async()=>{
 const seen=[];const client=new MCP({url:'https://mcp.example/mcp',token:'mcp-secret',fetchImpl:async(url,o)=>{const b=JSON.parse(o.body);seen.push(b.method);assert.equal(o.headers.Authorization,'Bearer mcp-secret');assert.equal(o.redirect,'error');let result;
 if(b.method==='initialize'){result={protocolVersion:'2025-11-25',capabilities:{tools:{}}};return Response.json({id:b.id,result},{headers:{'Mcp-Session-Id':'session'}})}
 assert.equal(o.headers['Mcp-Session-Id'],'session');if(b.method==='notifications/initialized')return new Response(null,{status:202});if(b.method==='tools/list')result=b.params.cursor?{tools:[{name:'b',inputSchema:{type:'object'}}]}:{tools:[{name:'a',inputSchema:{type:'object'}}],nextCursor:'next'};else result={content:[{type:'text',text:'ok'}]};return Response.json({id:b.id,result})}});
 assert.equal((await client.connect()).length,2);assert.equal((await client.call('a',{})).content[0].text,'ok');await assert.rejects(()=>client.call('unknown',{}),/không thuộc/);assert.equal(seen.filter(x=>x==='tools/list').length,2);client.clear();assert.equal(client.token,'');
});
test('modern MCP uses metadata with no initialize and filters unsupported header schemas',async()=>{let calls=0;const c=new MCP({url:'https://mcp.example/mcp',version:'2026-07-28',fetchImpl:async(u,o)=>{calls++;let b=JSON.parse(o.body);assert.equal(b.method,'tools/list');assert.equal(o.headers['Mcp-Method'],'tools/list');assert.equal(b.params._meta['io.modelcontextprotocol/protocolVersion'],'2026-07-28');return Response.json({id:b.id,result:{tools:[{name:'safe',inputSchema:{type:'object'}},{name:'header',inputSchema:{type:'object',properties:{x:{type:'string','x-mcp-header':'X'}}}}]}})}});assert.equal((await c.connect()).length,1);assert.equal(calls,1)});
test('MCP rejects insecure URLs and errors redact OpenRouter key',()=>{for(const u of ['http://example.com/mcp','https://user:pass@example.com/mcp','https://example.com/mcp?token=secret'])assert.throws(()=>endpoint(u));assert(!safeError(Error('bad sk-or-v1-abcdef')).includes('abcdef'))});
