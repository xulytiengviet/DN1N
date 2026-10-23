// Deliberately bounded browser client. No stdio, OAuth discovery, sampling or async Tasks.
export function endpoint(value){let u;try{u=new URL(value)}catch{throw Error('Địa chỉ MCP không hợp lệ.')}
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error('MCP cần URL HTTPS, không chứa tài khoản, query token hoặc fragment.');return u.href}
export async function readRPC(response,id,onProgress=()=>{}){
 if(response.status===202){if(id===undefined)return null;throw Error('MCP chỉ xác nhận yêu cầu, chưa có kết quả.')}
 if(!response.ok)throw Error(`MCP HTTP ${response.status}. Kiểm tra quyền, phiên kết nối và cấu hình CORS.`);
 const match=m=>{if(m.method==='notifications/progress'){onProgress(m.params);return undefined}if(m.method&&m.id!==undefined)throw Error('Máy chủ yêu cầu tương tác MCP không được bản trình duyệt này hỗ trợ.');if(m.id===id){if(m.error)throw Error('MCP trả lỗi JSON-RPC '+m.error.code);if(m.result?.resultType==='task')throw Error('Máy chủ trả tác vụ bất đồng bộ; bản này chỉ hỗ trợ kết quả trực tiếp.');return {value:m.result}}};
 if(!response.headers.get('content-type')?.includes('text/event-stream')){const r=match(await response.json());if(!r)throw Error('MCP trả sai mã yêu cầu.');return r.value}
 const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',bytes=0;
 try{while(true){const {done,value}=await reader.read();buffer+=(done?decoder.decode():decoder.decode(value,{stream:true}));bytes+=value?.byteLength||0;if(bytes>2000000)throw Error('Đầu ra MCP vượt giới hạn 2 MB.');buffer=buffer.replace(/\r\n/g,'\n');let split;
 while((split=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,split);buffer=buffer.slice(split+2);const data=block.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');if(data){let m;try{m=JSON.parse(data)}catch{throw Error('MCP SSE không chứa JSON hợp lệ.')}const r=match(m);if(r)return r.value}}
 if(done)break;
 }throw Error('Luồng MCP kết thúc trước khi có kết quả.')}finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
}
export class MCP{
 constructor({url,token='',version='2025-11-25',fetchImpl=fetch,onProgress=()=>{}}){this.url=endpoint(url);this.token=token;this.version=version;this.fetchImpl=fetchImpl;this.onProgress=onProgress;this.seq=0;this.session='';this.tools=[];}
 async rpc(method,params={},signal,notification=false){
  const id=notification?undefined:++this.seq,modern=this.version==='2026-07-28';
  if(modern)params={...params,_meta:{...params._meta,'io.modelcontextprotocol/protocolVersion':this.version,'io.modelcontextprotocol/clientInfo':{name:'dn1n-browser',version:'2.0.0'},'io.modelcontextprotocol/clientCapabilities':{}}};
  const headers={'Content-Type':'application/json',Accept:'application/json, text/event-stream'};if(this.token)headers.Authorization='Bearer '+this.token;
  if(method!=='initialize')headers['MCP-Protocol-Version']=this.version;if(this.session)headers['Mcp-Session-Id']=this.session;
  if(modern){headers['Mcp-Method']=method;if(params.name)headers['Mcp-Name']=params.name}
  const ctrl=new AbortController(),cancel=()=>ctrl.abort();if(signal?.aborted)ctrl.abort();signal?.addEventListener('abort',cancel,{once:true});const timer=setTimeout(cancel,120000);
  try{const r=await this.fetchImpl(this.url,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',...(id===undefined?{}:{id}),method,params}),signal:ctrl.signal,credentials:'omit',redirect:'error'});
   if(method==='initialize'&&r.headers.get('Mcp-Session-Id'))this.session=r.headers.get('Mcp-Session-Id');
   if(notification){if(!r.ok)throw Error('MCP không xác nhận khởi tạo.');return null}
   return await readRPC(r,id,this.onProgress);
  }catch(e){if(e.name==='TypeError')throw Error('Không kết nối được MCP: kiểm tra mạng, HTTPS, Origin và CORS phía máy chủ.');throw e}finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel)}
 }
 async connect(signal){
  if(this.version!=='2026-07-28'){const r=await this.rpc('initialize',{protocolVersion:this.version,capabilities:{},clientInfo:{name:'dn1n-browser',version:'2.0.0'}},signal);if(!['2025-03-26','2025-06-18','2025-11-25'].includes(r.protocolVersion))throw Error('Phiên bản MCP không tương thích. Chọn đúng phiên bản của máy chủ.');this.version=r.protocolVersion;if(!r.capabilities?.tools)throw Error('Máy chủ chưa khai báo công cụ.');await this.rpc('notifications/initialized',{},signal,true)}
  let cursor,all=[],seen=new Set();for(let page=0;page<10;page++){const r=await this.rpc('tools/list',cursor?{cursor}:{},signal);if(!Array.isArray(r.tools))throw Error('MCP trả danh sách công cụ không hợp lệ.');for(const t of r.tools){if(!t||typeof t.name!=='string'||!t.inputSchema||t.inputSchema.type!=='object'||seen.has(t.name))continue;if(this.version==='2026-07-28'&&JSON.stringify(t.inputSchema).includes('x-mcp-header'))continue;seen.add(t.name);all.push(t)}if(all.length>100)throw Error('Hơn 100 công cụ: hãy dùng máy chủ có phạm vi hẹp hơn.');cursor=r.nextCursor;if(!cursor)break;if(page===9)throw Error('Danh sách MCP vượt giới hạn phân trang.')}
  this.tools=all;return all;
 }
 async call(name,args,signal){if(!this.tools.some(t=>t.name===name))throw Error('Công cụ không thuộc phiên MCP hiện tại.');const r=await this.rpc('tools/call',{name,arguments:args},signal);if(!r||(!Array.isArray(r.content)&&!r.structuredContent))throw Error('MCP chưa trả kết quả công cụ trực tiếp.');return r}
 clear(){this.token='';this.session='';this.tools=[];}
}
