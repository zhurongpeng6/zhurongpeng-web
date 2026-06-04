const roulette = document.querySelector("#roulette");
const wheel = document.querySelector("#wheel");
const enterButton = document.querySelector("#enterButton");
const hubLabel = document.querySelector("#hubLabel");
const dragHint = document.querySelector("#dragHint");
const previewImage = document.querySelector("#previewImage");
const previewMeta = document.querySelector("#previewMeta");
const previewTitle = document.querySelector("#previewTitle");
const previewText = document.querySelector("#previewText");
const previewLink = document.querySelector("#previewLink");
const portalCanvas = document.querySelector("#portalCanvas");

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

const sectorAngle = 360 / entries.length;
let orderedEntries = [...entries];
let rotation = Math.random() * 360;
let activeIndex = 0;
let dragState = null;
let inertiaFrame = null;

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function getPointerAngle(event) {
  const rect = roulette.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI;
}

function shortestDelta(current, previous) {
  let delta = current - previous;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

function getSelectedIndex() {
  const pointerAngle = 0;
  let selected = 0;
  let smallestDistance = Infinity;

  orderedEntries.forEach((entry, index) => {
    const itemAngle = normalizeDegrees(index * sectorAngle + rotation);
    const distance = Math.abs(shortestDelta(itemAngle, pointerAngle));
    if (distance < smallestDistance) {
      smallestDistance = distance;
      selected = index;
    }
  });

  return selected;
}

function setRotation(value) {
  rotation = value;
  wheel.style.setProperty("--wheel-rotation", `${rotation}deg`);
  wheel.querySelectorAll(".wheel-item").forEach((item) => {
    const angle = Number(item.dataset.angle);
    item.style.setProperty("--counter-angle", `${-(angle + rotation)}deg`);
  });
  updateSelection();
}

function updateSelection() {
  activeIndex = getSelectedIndex();
  const entry = orderedEntries[activeIndex];
  hubLabel.textContent = entry.label;
  previewImage.src = entry.image;
  previewImage.alt = "";
  previewMeta.textContent = `当前入口：${entry.subtitle}`;
  previewTitle.textContent = entry.title;
  previewText.textContent = entry.text;
  previewLink.href = entry.href;
  previewLink.textContent = `进入${entry.label}`;
}

function renderWheel() {
  wheel.innerHTML = orderedEntries
    .map((entry, index) => {
      const angle = index * sectorAngle;
      return `
        <div class="wheel-item" style="--item-angle: ${angle}deg" data-angle="${angle}" data-key="${entry.key}">
          <span class="wheel-icon" aria-hidden="true">${index + 1}</span>
          <strong>${entry.label}</strong>
          <span>${entry.subtitle}</span>
        </div>
      `;
    })
    .join("");
  setRotation(rotation);
}

function stopInertia() {
  if (inertiaFrame) {
    cancelAnimationFrame(inertiaFrame);
    inertiaFrame = null;
  }
}

function spinWithInertia(velocity, travel) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    updateSelection();
    return;
  }

  let speed = velocity + Math.sign(velocity || travel || 1) * Math.min(Math.abs(travel) * 0.018, 4.4);
  let previousTime = performance.now();

  function tick(now) {
    const delta = Math.min((now - previousTime) / 16.67, 2);
    previousTime = now;
    speed *= Math.pow(0.92, delta);
    setRotation(rotation + speed * delta);

    if (Math.abs(speed) < 0.06) {
      inertiaFrame = null;
      updateSelection();
      return;
    }

    inertiaFrame = requestAnimationFrame(tick);
  }

  inertiaFrame = requestAnimationFrame(tick);
}

function enterActivePage() {
  const entry = orderedEntries[activeIndex];
  window.location.href = entry.href;
}

function initPortalLens() {
  if (!portalCanvas) return;

  const ctx = portalCanvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let nodes = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    portalCanvas.width = Math.floor(width * dpr);
    portalCanvas.height = Math.floor(height * dpr);
    portalCanvas.style.width = `${width}px`;
    portalCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = reducedMotion ? 70 : 180;
    nodes = Array.from({ length: count }, (_, index) => ({
      orbit: 90 + (index % 24) * 18 + Math.random() * 40,
      angle: Math.random() * Math.PI * 2,
      speed: (index % 2 ? 1 : -1) * (0.0016 + Math.random() * 0.004),
      hue: 170 + Math.random() * 170,
      size: 0.8 + Math.random() * 2.4
    }));
  }

  function draw() {
    frame += 1;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(5, 6, 14, 0.28)";
    ctx.fillRect(0, 0, width, height);

    const cx = width * 0.5 + (pointer.x - width * 0.5) * 0.035;
    const cy = height * 0.5 + (pointer.y - height * 0.5) * 0.035;
    const maxOrbit = Math.min(width, height) * 0.46;

    const core = ctx.createRadialGradient(cx, cy, 20, cx, cy, maxOrbit);
    core.addColorStop(0, "rgba(255,255,255,0.18)");
    core.addColorStop(0.18, "rgba(0,229,255,0.16)");
    core.addColorStop(0.46, "rgba(255,45,120,0.12)");
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, maxOrbit, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "lighter";
    for (let ring = 0; ring < 7; ring += 1) {
      const radius = maxOrbit * (0.24 + ring * 0.105);
      ctx.strokeStyle = `hsla(${190 + ring * 22}, 100%, 62%, ${0.18 - ring * 0.015})`;
      ctx.lineWidth = 1 + ring * 0.2;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        radius * (1.08 + Math.sin(frame * 0.01 + ring) * 0.06),
        radius * (0.36 + ring * 0.035),
        frame * 0.002 + ring * 0.42,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    nodes.forEach((node) => {
      node.angle += reducedMotion ? node.speed * 0.18 : node.speed;
      const radius = Math.min(node.orbit, maxOrbit * 0.96);
      const x = cx + Math.cos(node.angle) * radius * 1.12;
      const y = cy + Math.sin(node.angle) * radius * 0.48;
      const dx = pointer.x - x;
      const dy = pointer.y - y;
      const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 220);
      ctx.fillStyle = `hsla(${node.hue}, 100%, ${62 + pull * 18}%, ${0.46 + pull * 0.38})`;
      ctx.beginPath();
      ctx.arc(x - dx * pull * 0.08, y - dy * pull * 0.08, node.size + pull * 2.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  resize();
  draw();
}

roulette.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  stopInertia();
  roulette.setPointerCapture(event.pointerId);
  roulette.classList.add("is-dragging");

  dragState = {
    pointerId: event.pointerId,
    lastAngle: getPointerAngle(event),
    lastTime: performance.now(),
    velocity: 0,
    travel: 0
  };

  dragHint.textContent = "继续拖动，松手后转盘会按力度飞旋";
});

roulette.addEventListener("pointermove", (event) => {
  if (!dragState || dragState.pointerId !== event.pointerId) return;

  const currentAngle = getPointerAngle(event);
  const now = performance.now();
  const delta = shortestDelta(currentAngle, dragState.lastAngle);
  const elapsed = Math.max(now - dragState.lastTime, 16);

  dragState.velocity = delta / elapsed * 16.67;
  dragState.travel += delta;
  dragState.lastAngle = currentAngle;
  dragState.lastTime = now;

  setRotation(rotation + delta);
});

roulette.addEventListener("pointerup", (event) => {
  if (!dragState || dragState.pointerId !== event.pointerId) return;

  const finalVelocity = dragState.velocity;
  const finalTravel = dragState.travel;
  dragState = null;
  roulette.classList.remove("is-dragging");
  dragHint.textContent = "停下后点击中心进入当前炫技页";
  spinWithInertia(finalVelocity, finalTravel);
});

roulette.addEventListener("pointercancel", () => {
  dragState = null;
  roulette.classList.remove("is-dragging");
  updateSelection();
});

roulette.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stopInertia();
    setRotation(rotation - sectorAngle);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    stopInertia();
    setRotation(rotation + sectorAngle);
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    enterActivePage();
  }
});

enterButton.addEventListener("click", enterActivePage);
previewLink.addEventListener("click", () => stopInertia());

renderWheel();
initPortalLens();
