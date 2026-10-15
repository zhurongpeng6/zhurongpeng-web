const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const assert=(value,label)=>{if(!value)throw Error(label)};
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const context=await browser.newContext();const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));const base=process.env.PREVIEW_URL||require('url').pathToFileURL(path.resolve('public')+path.sep).href;
 const checks=[];
 for(const width of [1440,1920,390,320]){
  await page.setViewportSize({width,height:width<600?844:1000});await page.goto(base+'index.html');await page.waitForTimeout(850);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
  assert((await page.locator('h1').textContent()).replace(/\s/g,'')==='你好，我是毛婆婆。','heading');
  await page.screenshot({path:`qa/profile-${width}.png`,fullPage:true});
 }
 await page.keyboard.press('Tab');assert(await page.locator('.skip-link').evaluate(e=>e===document.activeElement),'skip focus');
 assert(await page.locator('.skip-link').evaluate(e=>getComputedStyle(e).outlineStyle==='solid'),'visible focus');
 await page.locator('nav a[href="#projects"]').click();await page.waitForTimeout(500);assert(new URL(page.url()).hash==='#projects','anchor navigation');
 await page.emulateMedia({reducedMotion:'reduce'});assert(await page.locator('.hero-copy').evaluate(e=>getComputedStyle(e).animationName==='none'),'reduced motion');
 checks.push('1440/1920/390/320 layouts, keyboard focus, anchors, reduced motion');
 await page.setViewportSize({width:1440,height:1000});await page.locator('.project-card').first().click();
 assert(page.url().endsWith('/visual-lab.html'),'lab entry');
 const old=await page.locator('#previewNumber').innerText();await page.locator('#nextButton').click();await page.waitForTimeout(500);assert(await page.locator('#previewNumber').innerText()!==old,'dial button');
 const number=await page.locator('#previewNumber').innerText();await page.locator('#roulette').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(500);assert(await page.locator('#previewNumber').innerText()!==number,'dial keyboard');
 await page.emulateMedia({reducedMotion:'no-preference'});
 const d=await page.locator('#roulette').boundingBox();const before=await page.locator('#wheel').getAttribute('style');await page.mouse.move(d.x+30,d.y+d.height/2);await page.mouse.down();await page.mouse.move(d.x+d.width/2,d.y+30,{steps:12});await page.mouse.up();await page.waitForTimeout(1500);assert(await page.locator('#wheel').getAttribute('style')!==before,'dial drag');
 await page.locator('#previewLink').click();assert(await page.locator('a[href="./visual-lab.html"]').count()>0,'return to lab');await page.locator('a[href="./visual-lab.html"]').first().click();await page.getByRole('link',{name:'← 毛婆婆的主页'}).click();assert(page.url().endsWith('/index.html'),'return home');checks.push('lab buttons, keyboard, drag, experiment return, profile return');
 await page.locator('.project-card').last().click();
 for(const category of ['life','create','observe']){
  const filter=page.locator(`[data-category="${category}"]`);if(await filter.count()){await filter.click();await page.locator('#draw').click();await page.waitForTimeout(700);assert(await page.locator('#result').isVisible(),'draw');assert(await filter.getAttribute('aria-pressed')==='true','category');}
 }
 await page.locator('#save').click();await page.locator('#complete').click();const state=await page.evaluate(()=>localStorage.getItem('daily-spark-v1'));assert(JSON.parse(state).saved.length===1&&JSON.parse(state).done.length===1,'persist states');
 await page.reload();assert(await page.evaluate(()=>localStorage.getItem('daily-spark-v1'))===state,'reload persists');await page.locator('#shelfOpen').click();assert(await page.locator('.saved-item').count()===1,'shelf');assert((await page.locator('.saved-item').innerText()).includes('已完成'),'completed shelf');await page.keyboard.press('Escape');await page.locator('.portfolio-return a').click();assert(page.url().endsWith('/index.html#projects'),'spark return');checks.push('spark categories, draw, save, complete, reload persistence, shelf, return');
 for(const width of [390,320]){await page.setViewportSize({width,height:844});for(const route of ['visual-lab.html','projects/daily-spark/index.html']){await page.goto(base+route);await page.waitForTimeout(300);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`project overflow ${route} ${width}`);await page.screenshot({path:`qa/profile-${route.includes('daily')?'spark':'lab'}-${width}.png`,fullPage:true});}}
 const routes=fs.readdirSync('public').filter(x=>x.endsWith('.html'));
 for(const route of routes){const response=await page.goto(base+route);assert(!response || response.status()===200,route);await page.waitForTimeout(70);const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));for(const href of links){if(/^(https?:|#|mailto:|javascript:)/.test(href))continue;const url=new URL(href,base+route);const file=url.protocol==='file:'?require('url').fileURLToPath(url):path.join('public',decodeURIComponent(url.pathname));assert(fs.existsSync(file),`${route} broken ${href}`);}}
 assert(!errors.length,errors.join('\n'));checks.push(`${routes.length} HTML pages and local navigation links; no script errors`);
 fs.writeFileSync('qa/profile-results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
