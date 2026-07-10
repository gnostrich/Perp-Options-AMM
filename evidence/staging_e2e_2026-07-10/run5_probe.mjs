import { chromium } from 'playwright-core';
const exe='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ctx = await chromium.launchPersistentContext('/tmp/run5_probe_profile', {
  headless:false,
  executablePath: exe,
  args:['--no-sandbox','--disable-dev-shm-usage','--proxy-server=http://127.0.0.1:37531','--proxy-bypass-list=<-loopback>','--ssl-version-max=tls1.2'],
  ignoreHTTPSErrors:false,
});
const page = await ctx.newPage();
const errs=[];
page.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
try{
  const r = await page.goto('https://app-staging.temporal.exchange/', {waitUntil:'domcontentloaded', timeout:45000});
  console.log('STATUS', r && r.status());
  console.log('TITLE', await page.title());
}catch(e){ console.log('GOTO_ERR', e.message); }
await page.waitForTimeout(2000);
await page.screenshot({path:'/tmp/run5_probe.png'});
console.log('NCONSOLE_ERR', errs.length);
console.log(errs.slice(0,5).join('\n'));
await ctx.close();
