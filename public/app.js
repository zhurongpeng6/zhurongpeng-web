const entries = [
  {
    key: "particles",
    label: "粒子字",
    subtitle: "Particle Type",
    title: "粒子重组炫技",
    text: "几千个亮点会炸开、逃逸、旋回，再把炫技两个字拼回屏幕中央。",
    href: "./particles.html",
    image: "./assets/mascot-peek.png"
  },
  {
    key: "liquid",
    label: "液态屏",
    subtitle: "Liquid Glass",
    title: "液体扭曲炫技",
    text: "鼠标像一枚热针划过玻璃，整块画面被拉伸、融化、折射。",
    href: "./liquid.html",
    image: "./assets/mascot-original-cool.png"
  },
  {
    key: "gooey",
    label: "黏液场",
    subtitle: "Gooey Field",
    title: "黏连融合炫技",
    text: "发光形体互相吞并、拉丝、分裂，像一台失控的视觉反应炉。",
    href: "./gooey.html",
    image: "./assets/mascot-moon.png"
  },
  {
    key: "kinetic",
    label: "字爆场",
    subtitle: "Kinetic Type",
    title: "字形爆破炫技",
    text: "巨型文字切片旋转、错层推进，用字体直接砸出页面转场感。",
    href: "./kinetic.html",
    image: "./assets/mascot-hero.png"
  },
  {
    key: "glitch",
    label: "故障机",
    subtitle: "Glitch Core",
    title: "霓虹故障炫技",
    text: "RGB 撕裂、扫描线、噪声闪断和电流抖动把页面推到失真边缘。",
    href: "./glitch.html",
    image: "./assets/mascot-peek.png"
  },
  {
    key: "tunnel",
    label: "星云洞",
    subtitle: "Nebula Rush",
    title: "空间穿梭炫技",
    text: "粒子从深处冲向你，鼠标偏移会改变星云隧道的飞行方向。",
    href: "./tunnel.html",
    image: "./assets/mascot-original-cool.png"
  },
  {
    key: "trail",
    label: "流光尾",
    subtitle: "Plasma Trail",
    title: "拖尾流光炫技",
    text: "指针经过的地方会留下高亮尾焰，像等离子体在屏幕上结晶。",
    href: "./trail.html",
    image: "./assets/mascot-moon.png"
  },
  {
    key: "terrain",
    label: "波形地",
    subtitle: "Wave Terrain",
    title: "网格地形炫技",
    text: "整页变成起伏的发光地形，触碰会向外扩散冲击波。",
    href: "./terrain.html",
    image: "./assets/mascot-hero.png"
  },
  {
    key: "scroll",
    label: "分镜卷",
    subtitle: "Scroll Cinema",
    title: "滚动分镜炫技",
    text: "滚动触发一帧帧电影式爆改，背景、字形、镜头同步切换。",
    href: "./scroll-cinema.html",
    image: "./assets/mascot-peek.png"
  },
  {
    key: "draw",
    label: "描线路",
    subtitle: "SVG Drawing",
    title: "路径描线炫技",
    text: "线条像电路一样自动绘制、闭合、点亮，把文字拆成可见的运动轨迹。",
    href: "./draw.html",
    image: "./assets/mascot-original-cool.png"
  },
  {
    key: "prism",
    label: "折叠舱",
    subtitle: "CSS 3D",
    title: "三维折叠炫技",
    text: "一组透视面板绕着中心翻折，像把网页拆成正在旋转的舞台机械。",
    href: "./prism.html",
    image: "./assets/mascot-moon.png"
  },
  {
    key: "terminal",
    label: "终端雨",
    subtitle: "Typing System",
    title: "命令输入炫技",
    text: "终端字符逐字敲入，代码雨和光标脉冲把页面变成正在执行的命令。",
    href: "./terminal.html",
    image: "./assets/mascot-hero.png"
  },
  {
    key: "morph",
    label: "变字体",
    subtitle: "Variable Type",
    title: "字形变体炫技",
    text: "同一个词在重量、宽度、倾斜和描边之间持续变形，强调字体本身的力量。",
    href: "./morph.html",
    image: "./assets/mascot-peek.png"
  },
  {
    key: "reveal",
    label: "裁切幕",
    subtitle: "Clip Reveal",
    title: "裁切揭幕炫技",
    text: "多层色块像镜头快门一样切开画面，文字从不同窗口里被高速揭示。",
    href: "./reveal.html",
    image: "./assets/mascot-original-cool.png"
  },
  {
    key: "orbit",
    label: "轨道环",
    subtitle: "Motion Orbit",
    title: "轨道运动炫技",
    text: "发光节点沿着多条轨道运行，指针靠近时整套系统像磁场一样偏转。",
    href: "./orbit.html",
    image: "./assets/mascot-moon.png"
  }
];

const $ = (id) => document.getElementById(id);
const roulette = $('roulette'), wheel = $('wheel');
const sector = 360 / entries.length;
let rotation = 0, selected = -1, drag = null, animation = 0, pending = 0;
try { const key = sessionStorage.getItem('roulette-selection'); const i = entries.findIndex(e => e.key === key); if (i >= 0) rotation = -i * sector; } catch {}
wheel.innerHTML = entries.map((e,i) => `<div class="dial-item" style="--angle:${i*sector}deg"><span>${String(i+1).padStart(2,'0')}</span><strong>${e.label}</strong></div>`).join('');
const items = [...wheel.children];
function indexAt(angle) { return ((Math.round(-angle / sector) % entries.length) + entries.length) % entries.length; }
function paint() {
  wheel.style.setProperty('--rotation', `${rotation}deg`);
  const next = indexAt(rotation);
  if (next === selected) return;
  if (selected >= 0) items[selected].classList.remove('is-active');
  selected = next; items[selected].classList.add('is-active');
  const entry = entries[selected];
  $('hubLabel').textContent = entry.label;
  $('previewNumber').textContent = String(selected+1).padStart(2,'0');
  $('previewMeta').textContent = entry.subtitle;
  $('previewTitle').textContent = entry.title.replace('炫技','');
  $('previewText').textContent = entry.text;
  $('previewLink').href = entry.href;
  $('enterButton').setAttribute('aria-label',`进入${entry.label}`);
}
function settled() {
  rotation = ((rotation % 360) + 360) % 360; paint();
  $('selectionStatus').textContent = `已选中${entries[selected].label}，第 ${selected+1} 项，共 15 项。`;
  $('dragHint').textContent = '拖动探索 · 点击中心进入';
  try { sessionStorage.setItem('roulette-selection', entries[selected].key); } catch {}
}
function stop() { cancelAnimationFrame(animation); cancelAnimationFrame(pending); animation = pending = 0; }
function snap(target = Math.round(rotation / sector) * sector) {
  stop(); const from = rotation; let start;
  if (Motion.reduced || document.hidden) { rotation = target; paint(); settled(); return; }
  function tick(now) {
    start ??= now; const t = Math.min((now-start)/340,1);
    rotation = from + (target-from)*(1-Math.pow(1-t,4)); paint();
    if (t<1) animation=requestAnimationFrame(tick); else { animation=0; settled(); }
  }
  animation=requestAnimationFrame(tick);
}
function inertia(velocity) {
  if (Motion.reduced || Math.abs(velocity)<0.025) { snap(); return; }
  let last=performance.now();
  function tick(now) {
    const dt=Math.min(now-last,32); last=now;
    velocity *= Math.exp(-dt/230); rotation += velocity*dt; paint();
    if (Math.abs(velocity)>0.018) animation=requestAnimationFrame(tick); else snap();
  }
  animation=requestAnimationFrame(tick);
}
function angle(e) { return Math.atan2(e.clientY-drag.cy,e.clientX-drag.cx)*180/Math.PI; }
function delta(a,b) { return ((a-b+540)%360)-180; }
roulette.addEventListener('pointerdown', e => {
  if (e.target.closest('button') || e.button!==0 || !e.isPrimary || drag) return;
  stop(); const rect=roulette.getBoundingClientRect();
  drag={id:e.pointerId,cx:rect.left+rect.width/2,cy:rect.top+rect.height/2,time:performance.now(),velocity:0};
  drag.angle=angle(e); roulette.setPointerCapture(e.pointerId); roulette.classList.add('is-dragging');
  $('dragHint').textContent='松手，让灵感继续旋转';
});
roulette.addEventListener('pointermove',e=>{
  if (!drag || drag.id!==e.pointerId) return;
  const now=performance.now(), a=angle(e), d=delta(a,drag.angle), dt=Math.max(1,now-drag.time);
  drag.velocity=drag.velocity*.35+Math.max(-1.6,Math.min(1.6,d/dt))*.65;
  drag.angle=a; drag.time=now; rotation+=d;
  if (!pending) pending=requestAnimationFrame(()=>{pending=0;paint();});
});
function release(e,cancelled=false) {
  if (!drag || drag.id!==e.pointerId) return;
  const velocity=performance.now()-drag.time>90?0:drag.velocity;
  drag=null; roulette.classList.remove('is-dragging'); stop(); paint();
  if(roulette.hasPointerCapture(e.pointerId)) roulette.releasePointerCapture(e.pointerId);
  if(cancelled) snap(); else inertia(velocity);
}
roulette.addEventListener('pointerup',e=>release(e));
roulette.addEventListener('pointercancel',e=>release(e,true));
roulette.addEventListener('lostpointercapture',e=>release(e,true));
function step(direction) { if(drag) return; snap(Math.round(rotation/sector)*sector+direction*sector); }
function enter() { if(drag) return; stop(); paint(); settled(); location.href=entries[selected].href; }
roulette.addEventListener('keydown',e=>{
  if(e.target.closest('button')) return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?1:-1);}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();enter();}
});
$('previousButton').addEventListener('click',()=>step(1));
$('nextButton').addEventListener('click',()=>step(-1));
$('enterButton').addEventListener('click',enter);
$('previewLink').addEventListener('click',()=>{stop();settled();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();drag=null;roulette.classList.remove('is-dragging');snap();}});
window.addEventListener('resize',Motion.batch(()=>{if(drag){drag=null;roulette.classList.remove('is-dragging');snap();}}));
paint(); settled();
// A quiet orbital field. No gradients or full-screen blur are rebuilt per frame.
const canvas=$('portalCanvas'),ctx=canvas.getContext('2d');
if(ctx){
 let w=0,h=0,t=0;
 function size(){w=innerWidth;h=innerHeight;canvas.width=w*Motion.dpr;canvas.height=h*Motion.dpr;ctx.setTransform(Motion.dpr,0,0,Motion.dpr,0,0);draw(0);}
 function draw(dt){t+=dt*.000045;ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(145,209,226,.075)';ctx.lineWidth=1;
 for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(w*.57,h*.48,Math.min(w*.38,650)+i*50,140+i*36,-.38+i*.16,0,Math.PI*2);ctx.stroke();}
 for(let i=0;i<(Motion.compact?16:36);i++){const a=i*2.399+t*(i%2?1:-1),r=160+(i%9)*42;ctx.fillStyle=`rgba(163,225,241,${.12+(i%4)*.05})`;ctx.beginPath();ctx.arc(w*.57+Math.cos(a)*r,h*.48+Math.sin(a)*r*.47,1,0,Math.PI*2);ctx.fill();}}
 size();window.addEventListener('resize',Motion.batch(size));Motion.loop(draw);
}
