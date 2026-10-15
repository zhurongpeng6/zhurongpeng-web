/* Homepage-only progressive enhancements. All factual content lives in HTML. */
(() => {
  const M = window.Motion;
  if (!M) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const enabled = () => fine.matches && innerWidth >= 720 && !reduce.matches && !document.hidden && document.hasFocus();
  const make = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; };
  document.documentElement.classList.add('profile-enhanced');

  const art = document.querySelector('.exploration');
  const original = art.querySelector('svg');
  const field = make('div', 'particle-field');
  original.before(field); field.append(original);
  const canvas = make('canvas', 'profile-particles'); canvas.setAttribute('aria-hidden', 'true'); field.append(canvas);
  const ctx = canvas.getContext('2d');
  let dots = [], w = 0, h = 0, pointer = null, stop = null, visible = false;
  function paint() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#79906a';
    for (const d of dots) { ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
  }
  function halt(reset = false) {
    if (stop) { const fn = stop; stop = null; fn(); }
    canvas.dataset.running = 'false';
    if (reset) { for (const d of dots) { d.x=d.ox;d.y=d.oy;d.vx=d.vy=0;d.r=.85; } paint(); }
  }
  function frame() {
    if (!enabled() || !visible) { halt(true); return; }
    let energy = 0;
    for (const d of dots) {
      const dx = pointer ? d.x-pointer.x : 0, dy = pointer ? d.y-pointer.y : 0;
      const distance = Math.hypot(dx,dy), force = pointer ? Math.max(0,1-distance/85) : 0;
      d.vx = (d.vx+(d.ox-d.x)*.065+dx/(distance||1)*force*1.5)*.78;
      d.vy = (d.vy+(d.oy-d.y)*.065+dy/(distance||1)*force*1.5)*.78;
      d.x+=d.vx;d.y+=d.vy;d.r=.85+force*1.8;
      energy+=Math.abs(d.vx)+Math.abs(d.vy);
    }
    paint();
    if (energy < .025) halt(false);
  }
  function wake() { if (ctx && !stop && enabled() && visible) { canvas.dataset.running='true';stop=M.loop(frame); } }
  function resize() {
    halt(); w=field.clientWidth;h=field.clientHeight;
    if (!ctx || !w || !h) return;
    const dpr=M.dpr;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    dots=[];const step=innerWidth<720?25:21;
    for(let y=10;y<h;y+=step)for(let x=10;x<w;x+=step)dots.push({x,y,ox:x,oy:y,vx:0,vy:0,r:.85});
    paint();
  }
  function resetArt() { pointer=null;art.style.setProperty('--rx','0deg');art.style.setProperty('--ry','0deg');wake(); }
  art.addEventListener('pointermove',M.batch(e=>{
    if (!enabled() || e.pointerType==='touch') return;
    const r=field.getBoundingClientRect();pointer={x:(e.clientX-r.left)*w/r.width,y:(e.clientY-r.top)*h/r.height};
    const a=art.getBoundingClientRect();art.style.setProperty('--rx',`${clamp((.5-(e.clientY-a.top)/a.height)*9,-4.5,4.5)}deg`);art.style.setProperty('--ry',`${clamp(((e.clientX-a.left)/a.width-.5)*11,-5.5,5.5)}deg`);wake();
  }));
  for(const ev of ['pointerleave','pointercancel'])art.addEventListener(ev,resetArt);
  new ResizeObserver(resize).observe(field);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){resetArt();halt(true);}}, {threshold:0}).observe(art);

  const cubeWrap=make('div','learning-device',`<div class="cube-scene" aria-hidden="true"><div class="topic-cube"><div class="cube-face face-front"><span>01 / LEARNING</span><b>STM32</b><i class="chip-symbol">＋</i><small>从软硬件的联系开始</small></div><div class="cube-face face-right"><span>02 / NEXT STEP</span><b>Linux</b><i class="terminal-symbol">&gt;_</i><small>下一步的探索</small></div><div class="cube-face face-back"><span>03 / EXPLORING</span><b>感知 · 运动</b><i class="orbit-symbol">◎</i><small>机器人与传感器</small></div><div class="cube-face face-left"></div><div class="cube-face face-top"></div><div class="cube-face face-bottom"></div></div></div><div class="cube-controls"><p class="eyebrow">转一个面，看一种可能。</p><p class="cube-description">从正在学习，到下一步的好奇。</p><div class="topic-buttons" role="group" aria-label="选择立方展示主题"><button type="button" aria-pressed="true">STM32</button><button type="button" aria-pressed="false">Linux</button><button type="button" aria-pressed="false">机器人与传感器</button></div><p class="cube-status" aria-live="polite">STM32 · 正在学习</p></div>`);
  document.querySelector('.learning-grid').before(cubeWrap);
  const cube=cubeWrap.querySelector('.topic-cube'), buttons=[...cubeWrap.querySelectorAll('button')];
  const labels=['STM32 · 正在学习','Linux · 计划学习','机器人与传感器 · 兴趣探索'];
  cube.dataset.face='0';
  buttons.forEach((b,i)=>b.addEventListener('click',()=>{
    buttons.forEach((x,j)=>x.setAttribute('aria-pressed',String(j===i)));
    cube.style.setProperty('--turn',`${-i*90}deg`);cube.dataset.face=String(i);cubeWrap.querySelector('.cube-status').textContent=labels[i];
  }));

  const covers=[...document.querySelectorAll('.project-art')];
  covers.forEach((cover,i)=>{
    const layer=make('div',`split-layer ${i===0?'lab-reveal':'spark-reveal'}`);
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML=i===0?'<div class="luminous-orbit"><span>视觉 · 无限可能</span><b>EXPLORE</b><i>✳</i></div>':'<div class="idea-ticket"><span>TODAY’S LITTLE SPARK</span><b>给日常<br>一点意外。</b><i>✳</i><small>一份灵感，一个小小的开始</small></div>';
    cover.append(layer);cover.append(make('div','split-shine'));
    cover.addEventListener('pointermove',M.batch(e=>{
      if(!enabled()||e.pointerType==='touch')return;
      const r=cover.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width*100,15,85);
      cover.style.setProperty('--split',`${x}%`);cover.style.setProperty('--light-x',`${x}%`);cover.classList.add('is-refracting');
    }));
    for(const ev of ['pointerleave','pointercancel'])cover.addEventListener(ev,()=>resetCover(cover));
  });
  function resetCover(e){e.style.removeProperty('--split');e.style.removeProperty('--light-x');e.classList.remove('is-refracting');}

  const life=document.querySelector('.life-section');
  const scenery=make('div','life-scenery',`<svg viewBox="0 0 620 150" preserveAspectRatio="xMidYMid slice"><g class="scenery-far" fill="none" stroke="currentColor"><path d="M-40 130Q90 5 210 84T440 45T680 88M-40 140Q90 15 210 94T440 55T680 98M-40 150Q90 25 210 104T440 65T680 108"/><path d="M45 120L125 55 198 90 310 18 450 80 580 38" stroke-dasharray="3 7"/></g><g class="scenery-near" fill="none" stroke="currentColor" stroke-width="2"><circle cx="386" cy="106" r="23"/><circle cx="470" cy="106" r="23"/><path d="M386 106L414 57 441 106H386M414 57H450L470 106M440 49H460M60 82H130M72 63V101M82 69V95M108 69V95M118 63V101"/></g></svg>`);
  scenery.setAttribute('aria-hidden','true');life.append(scenery);
  let lifeVisible=false;
  function parallax(){if(!lifeVisible||document.hidden)return;const r=life.getBoundingClientRect(),p=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1)-.5;life.style.setProperty('--travel',`${reduce.matches?0:p*(innerWidth<720?24:48)}px`);}
  new IntersectionObserver(([e])=>{lifeVisible=e.isIntersecting;if(lifeVisible)parallax();}).observe(life);
  window.addEventListener('scroll',M.batch(parallax),{passive:true});
  window.addEventListener('resize',M.batch(()=>{resetAll();resize();parallax();}));
  function resetAll(){resetArt();halt(true);covers.forEach(resetCover);}
  window.addEventListener('blur',resetAll);
  document.addEventListener('visibilitychange',()=>{resetAll();if(!document.hidden)parallax();});
  reduce.addEventListener('change',()=>{resetAll();parallax();});fine.addEventListener('change',resetAll);
})();
