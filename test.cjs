const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements=new Map();function element(){return {textContent:'',innerHTML:'',style:{},classList:{contains:()=>true,toggle(){}},addEventListener(){},getBoundingClientRect:()=>({width:900,height:520}),getContext:()=>({setTransform(){}})}}
const context={console,document:{getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},devicePixelRatio:1,requestAnimationFrame(){},setTimeout,Blob,URL};vm.createContext(context);vm.runInContext(code,context);
vm.runInContext(`
if(agents.length!==12)throw Error('Roster');
for(let i=0;i<2400;i++)tick(.25);
if(!agents.some(a=>a.mode==='wait'))throw Error('Approval gate');
let a=agents.find(a=>a.mode==='wait'),id=a.id,job=a.job;for(let i=0;i<400;i++)tick(.25);if(a.job!==job||a.mode!=='wait')throw Error('Gate bypass');
approve(id,true);for(let i=0;i<1600;i++)tick(.25);if(a.done===0)throw Error('Approved job did not finish');
let b=agents.find(a=>a.mode==='wait');if(b){approve(b.id,false);if(b.step!==1||b.mode!=='work')throw Error('Rework failed')}
for(let i=0;i<12000;i++){tick(.25);if(i%200===0)agents.filter(a=>a.mode==='wait').forEach(a=>approve(a.id,true));if(totalCost()>budget)throw Error('Budget exceeded')}
if(simDay<3)throw Error('Day rollover');if(finished===0)throw Error('No completed handoffs');
console.log('PASS: 12 agents, approval blocking, approval delivery, rework, daily rollover, budget limit; completed='+finished);
`,context);
