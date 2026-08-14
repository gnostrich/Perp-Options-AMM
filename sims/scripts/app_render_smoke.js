const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('app/index.html','utf8');
const js=/<script>([\s\S]*?)<\/script>/.exec(h)[1];
const store={};
const el=(id)=>store[id]||(store[id]={id,style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},
  innerHTML:'',textContent:'',value:'0',
  querySelector:()=>el(id+'_q'),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300}),closest:()=>null});
const doc={getElementById:id=>el(id),querySelector:()=>el('_x'),querySelectorAll:()=>[],
  createElement:()=>el('_c'),addEventListener(){},body:el('_b')};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,
  requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,errs:[]};
ctx.window.document=doc; vm.createContext(ctx);
vm.runInContext(js,ctx);
vm.runInContext(`
for(const v of ['earn','transact','bands','portfolio']){
  for(const D of [0,0.3,1]){
    try{ ARBD=D; VIEW=v; render(); }catch(e){ errs.push(v+' D='+D+': '+e.message); }
  }
}
`,ctx);
console.log('views x divergence render errors:', ctx.errs.length?ctx.errs:'NONE');
