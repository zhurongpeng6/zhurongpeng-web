/* 液态玻璃渲染器（原创实现）
 * 光学思路参考 MIT 开源项目：
 * - rdev/liquid-glass-react（Snell 曲面边缘折射、解析圆角法线、中性中心）
 * - 9und30/glassy-liquid（曲面 profile）
 * - shuding/liquid-glass（SVG 位移贴图路线）
 * 本文件为独立编写的 Canvas/SVG 实现，未复制上述项目源码。
 * 支持环境（Chromium 的 SVG backdrop 位移）默认启用真实边缘折射；
 * 其他浏览器保留相同表面与磨砂降级。尊重减少动态与减少透明度偏好。
 */
(() => {
'use strict';
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const lessTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---- 折射贴图：平坦中心 + 约 8–24px 曲面边带，极轻色散 ---- */
function buildDisplacement(w, h, r, band, strength) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  const img = cx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      /* 圆角矩形内距与外法线（解析） */
      const qx = Math.abs(x - w / 2) - (w / 2 - r);
      const qy = Math.abs(y - h / 2) - (h / 2 - r);
      const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
      const dist = Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
      const t = -dist; /* 距边缘的内侧距离 */
      let nx = 0, ny = 0;
      if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; nx = Math.sign(x - w / 2) * qx / l; ny = Math.sign(y - h / 2) * qy / l; }
      else if (qx > qy) nx = Math.sign(x - w / 2);
      else ny = Math.sign(y - h / 2);
      let m = 0;
      if (t > 0 && t < band) { const u = 1 - t / band; m = Math.pow(Math.sin(u * Math.PI / 2), 1.6); }
      const i = (y * w + x) * 4;
      /* 位移朝向中心；R/G 通道轻微差值形成克制色散 */
      d[i]     = clamp(Math.round(128 - nx * m * strength), 0, 255);
      d[i + 1] = clamp(Math.round(128 - ny * m * strength * 0.93), 0, 255);
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  cx.putImageData(img, 0, 0);
  return cv.toDataURL('image/png');
}

const svgNS = 'http://www.w3.org/2000/svg';
const defsHost = document.createElementNS(svgNS, 'svg');
defsHost.setAttribute('width', '0');
defsHost.setAttribute('height', '0');
defsHost.setAttribute('aria-hidden', 'true');
defsHost.style.position = 'absolute';
defsHost.style.pointerEvents = 'none';
const defs = document.createElementNS(svgNS, 'defs');
defsHost.appendChild(defs);
document.body.appendChild(defsHost);

/* 能力探测：仅 Chromium 的 backdrop-filter 支持 url() 滤镜引用 */
const probe = document.createElement('div');
probe.style.backdropFilter = 'url(#lg-probe)';
const refractSupported = probe.style.backdropFilter !== '';
let uid = 0;
const items = [];

function makeFilter(item) {
  const el = item.el;
  const w = Math.max(2, Math.round(el.offsetWidth));
  const h = Math.max(2, Math.round(el.offsetHeight));
  if (item.w === w && item.h === h) return;
  item.w = w; item.h = h;
  const r = Math.min(h / 2, w / 2);
  const band = clamp(Math.round(Math.min(w, h) * 0.3), 8, 24);
  const strength = clamp(Math.round(band * 1.1), 8, 26);
  if (item.filter) item.filter.remove();
  const f = document.createElementNS(svgNS, 'filter');
  f.id = 'lg-' + (++uid);
  f.setAttribute('x', '-20%'); f.setAttribute('y', '-20%');
  f.setAttribute('width', '140%'); f.setAttribute('height', '140%');
  f.setAttribute('color-interpolation-filters', 'sRGB');
  const img = document.createElementNS(svgNS, 'feImage');
  img.setAttribute('href', buildDisplacement(w, h, r, band, strength));
  img.setAttribute('x', '0'); img.setAttribute('y', '0');
  img.setAttribute('width', String(w)); img.setAttribute('height', String(h));
  img.setAttribute('preserveAspectRatio', 'none');
  img.setAttribute('result', 'map');
  const disp = document.createElementNS(svgNS, 'feDisplacementMap');
  disp.setAttribute('in', 'SourceGraphic');
  disp.setAttribute('in2', 'map');
  disp.setAttribute('scale', String(strength * 2));
  disp.setAttribute('xChannelSelector', 'R');
  disp.setAttribute('yChannelSelector', 'G');
  f.appendChild(img); f.appendChild(disp);
  defs.appendChild(f);
  item.filter = f;
  const bf = `url(#${f.id}) saturate(1.35)`;
  el.style.webkitBackdropFilter = bf;
  el.style.backdropFilter = bf;
}

function clearFilter(item) {
  if (item.filter) { item.filter.remove(); item.filter = null; }
  item.w = item.h = 0;
  item.el.style.webkitBackdropFilter = '';
  item.el.style.backdropFilter = '';
}

function sync() {
  const on = refractSupported && !reduce.matches && !lessTransparency.matches;
  root.classList.toggle('glass-refract', on);
  for (const item of items) {
    if (!on) { clearFilter(item); continue; }
    if (item.el.offsetParent === null) { clearFilter(item); continue; }
    makeFilter(item);
  }
}

for (const el of document.querySelectorAll('.glass')) {
  const item = { el, filter: null, w: 0, h: 0 };
  items.push(item);
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (root.classList.contains('glass-refract')) makeFilter(item); }).observe(el);
}
reduce.addEventListener('change', sync);
lessTransparency.addEventListener('change', sync);
sync();

/* ---- 悬浮底栏：选中片、按压、拖动伸展、420ms 回弹 ---- */
const dock = document.getElementById('glassDock');
if (dock) {
  const links = [...dock.querySelectorAll('nav a')];
  const indicator = dock.querySelector('.dock-indicator');
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let active = 0;
  let press = null;

  function place(i) {
    const a = links[i];
    indicator.style.setProperty('--ind-x', a.offsetLeft - 6 + 'px');
    indicator.style.setProperty('--ind-w', a.offsetWidth + 'px');
  }
  function setActive(i, syncHash) {
    if (i === active && links[i].classList.contains('is-active')) { place(i); return; }
    active = i;
    links.forEach((a, n) => {
      a.classList.toggle('is-active', n === i);
      if (n === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    place(i);
    if (syncHash && history.replaceState) history.replaceState(null, '', links[i].getAttribute('href'));
  }
  function sectionAt() {
    const line = innerHeight * 0.35;
    let idx = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) idx = i; });
    return idx;
  }
  /* 明暗场景切换：底栏中心落在深海作品区或首屏场景画布上时清透 + 白字，
     其余纸面区域用中性着色 + 墨色标签 */
  const scenes = [...document.querySelectorAll('.projects-section, .hero-scene')];
  function dockTheme() {
    const dr = dock.getBoundingClientRect();
    const y = dr.top + dr.height / 2, x = dr.left + dr.width / 2;
    const dark = scenes.some(s => { const r = s.getBoundingClientRect(); return y > r.top && y < r.bottom && x > r.left && x < r.right; });
    dock.classList.toggle('on-light', !dark);
    root.classList.toggle('on-dark', dark);
  }
  let scrollTick = 0;
  addEventListener('scroll', () => {
    if (scrollTick || press) return;
    scrollTick = requestAnimationFrame(() => { scrollTick = 0; dockTheme(); if (!press) setActive(sectionAt(), false); });
  }, { passive: true });
  dockTheme();
  addEventListener('resize', () => place(active));
  links.forEach((a, i) => a.addEventListener('click', () => setActive(i, true)));
  setActive(sectionAt(), false);

  /* 指针手势：短按压缩至 0.96；横向拖动时选中片跟手并轻微拉宽；释放约 420ms 弹性归位。
     不使用 setPointerCapture：部分 Chromium 版本会在“捕获 + 横向移动 + 背景滤镜合成层”
     组合下取消指针流；改为手势期间在 window 上监听 move/up。触摸分支保留 pan-y，
     纵向滚动仍交给浏览器（pointercancel 时复位）。 */
  function onMove(e) {
    if (!press || e.pointerId !== press.id) return;
    const dx = e.clientX - press.x;
    if (!press.moved && Math.abs(dx) > 8) { press.moved = true; dock.classList.remove('is-pressed'); dock.classList.add('is-dragging'); }
    if (!press.moved) return;
    const widths = links.map(a => a.offsetWidth);
    const total = widths.reduce((s, v) => s + v, 0);
    const step = total / links.length;
    const idx = clamp(Math.round(press.start + dx / step), 0, links.length - 1);
    setActive(idx, false);
    const base = links[idx].offsetLeft - 6;
    const residual = clamp(dx - (idx - press.start) * step, -step * 0.4, step * 0.4);
    indicator.style.setProperty('--ind-x', base + residual * 0.35 + 'px');
    indicator.style.setProperty('--ind-w', widths[idx] + Math.abs(residual) * 0.22 + 'px');
  }
  function endPress() {
    press = null;
    dock.classList.remove('is-pressed', 'is-dragging');
    place(active); /* 过渡恢复后约 420ms 弹回 */
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
  }
  function onUp(e) {
    if (!press || e.pointerId !== press.id) return;
    const wasDrag = press.moved;
    endPress();
    if (wasDrag) {
      links[active].click(); /* 拖动结束进入所选章节 */
      const swallow = ev => { ev.preventDefault(); ev.stopPropagation(); };
      dock.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => dock.removeEventListener('click', swallow, { capture: true }), 350);
    }
  }
  function onCancel(e) { if (press && e.pointerId === press.id) endPress(); }
  dock.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    /* 阻止鼠标/笔的原生选择/拖拽手势，否则 Chromium 会取消指针流；
       触摸不阻止，纵向滚动仍交给浏览器 */
    if (e.pointerType !== 'touch') e.preventDefault();
    /* 压缩以按下点为原点，指针下的链接不漂移，轻按不会误触相邻项 */
    const r = dock.getBoundingClientRect();
    dock.style.transformOrigin = `${e.clientX - r.left}px ${e.clientY - r.top}px`;
    press = { id: e.pointerId, x: e.clientX, start: active, moved: false };
    dock.classList.add('is-pressed');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  });
}

/* ---- 着色玻璃短菜单：键盘可达、Esc 关闭、点击外部关闭 ---- */
const trigger = document.getElementById('menuTrigger');
const menu = document.getElementById('siteMenu');
if (trigger && menu) {
  const rows = [...menu.querySelectorAll('a')];
  function open() {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => { sync(); rows[0].focus(); });
  }
  function close(refocus) {
    if (menu.hidden) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    sync();
    if (refocus) trigger.focus();
  }
  trigger.addEventListener('click', () => { menu.hidden ? open() : close(false); });
  menu.addEventListener('keydown', e => {
    const i = rows.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); rows[(i + 1) % rows.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); rows[(i - 1 + rows.length) % rows.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); rows[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); rows[rows.length - 1].focus(); }
    else if (e.key === 'Tab') { close(false); }
  });
  rows.forEach(a => a.addEventListener('click', () => close(false)));
  document.addEventListener('pointerdown', e => { if (!menu.hidden && !menu.contains(e.target) && !trigger.contains(e.target)) close(false); });
}
})();
