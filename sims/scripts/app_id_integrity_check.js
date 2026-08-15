// Every id read via $('x') must be declared as id="x" in the markup, and vice versa.
// This exists because my render harness stubs getElementById to return a live element
// for ANY id, so three missing elements (orcbox/mdOrc/mdMan, builds 25-31) passed every
// check I ran. A stub that always succeeds cannot detect an element that never existed.
const fs=require('fs');
const h=fs.readFileSync('app/index.html','utf8');
const read=new Set([...h.matchAll(/\$\('([A-Za-z0-9_-]+)'\)/g)].map(m=>m[1]));
const decl=new Set([...h.matchAll(/id="([A-Za-z0-9_-]+)"/g)].map(m=>m[1]));
const missing=[...read].filter(x=>!decl.has(x));
const unused=[...decl].filter(x=>!read.has(x)&&!/^(grid|cv)/.test(x));
console.log('ids read from script :',read.size);
console.log('ids declared in markup:',decl.size);
console.log('READ BUT NEVER DECLARED (dead controls):',missing.length?missing.join(', '):'NONE');
console.log('declared but never read (informational):',unused.length?unused.join(', '):'none');
process.exit(missing.length?1:0);
