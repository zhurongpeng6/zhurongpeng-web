const body = document.body;
const effect = body.dataset.effect;
const stage = document.querySelector(".showcase-stage");
const canvas = document.querySelector(".showcase-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  px: window.innerWidth / 2,
  py: window.innerHeight / 2,
  down: false
};

let width = 0;
let height = 0;
let dpr = 1;
let ctx = null;
let frame = 0;
let particles = [];
let blobs = [];
let stars = [];
let trails = [];
let ripples = [];
let codeDrops = [];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function setPointerVars(x, y) {
  document.documentElement.style.setProperty("--mx", `${x}px`);
  document.documentElement.style.setProperty("--my", `${y}px`);
}

function resizeCanvas() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function clear(alpha = 1) {
  ctx.fillStyle = `rgba(3, 4, 9, ${alpha})`;
  ctx.fillRect(0, 0, width, height);
}

function makeTextParticles() {
  const sample = document.createElement("canvas");
  const sctx = sample.getContext("2d");
  const scale = 0.46;
  sample.width = Math.floor(width * scale);
  sample.height = Math.floor(height * scale);
  sctx.fillStyle = "#fff";
  sctx.textAlign = "center";
  sctx.textBaseline = "middle";
  sctx.font = `950 ${Math.floor(Math.min(sample.width * 0.42, sample.height * 0.46))}px Microsoft YaHei, sans-serif`;
  sctx.fillText("炫技", sample.width / 2, sample.height / 2);

  const data = sctx.getImageData(0, 0, sample.width, sample.height).data;
  const step = width < 700 || reducedMotion ? 6 : 4;
  const next = [];

  for (let y = 0; y < sample.height; y += step) {
    for (let x = 0; x < sample.width; x += step) {
      const alpha = data[(y * sample.width + x) * 4 + 3];
      if (alpha > 80 && Math.random() > 0.18) {
        const tx = x / scale;
        const ty = y / scale;
        next.push({
          x: rand(0, width),
          y: rand(0, height),
          tx,
          ty,
          vx: rand(-2, 2),
          vy: rand(-2, 2),
          hue: rand(175, 345),
          size: rand(1.1, 2.4)
        });
      }
    }
  }

  const cap = reducedMotion ? 900 : width < 700 ? 1400 : 2800;
  particles = next.slice(0, cap);
}

function initLiquid() {
  particles = Array.from({ length: reducedMotion ? 28 : 90 }, () => ({
    x: rand(0, width),
    y: rand(0, height),
    vx: rand(-0.8, 0.8),
    vy: rand(-0.8, 0.8),
    r: rand(28, 120),
    hue: rand(175, 330)
  }));
}

function initGooey() {
  blobs = Array.from({ length: reducedMotion ? 7 : 18 }, (_, index) => ({
    x: rand(width * 0.15, width * 0.85),
    y: rand(height * 0.18, height * 0.82),
    vx: rand(-1.4, 1.4),
    vy: rand(-1.2, 1.2),
    r: rand(44, 132),
    hue: index % 3 === 0 ? 330 : index % 3 === 1 ? 185 : 130
  }));
}

function initTunnel() {
  stars = Array.from({ length: reducedMotion ? 240 : 760 }, () => ({
    x: rand(-1, 1),
    y: rand(-1, 1),
    z: rand(0.1, 1),
    hue: rand(185, 330)
  }));
}

function initTrail() {
  trails = [];
  for (let i = 0; i < 120; i += 1) {
    trails.push({
      x: pointer.x,
      y: pointer.y,
      vx: rand(-1, 1),
      vy: rand(-1, 1),
      life: 0,
      hue: rand(170, 340)
    });
  }
}

function initTerrain() {
  ripples = [];
}

function initTerminalRain() {
  const columns = Math.ceil(width / 18);
  codeDrops = Array.from({ length: columns }, (_, index) => ({
    x: index * 18,
    y: rand(-height, height),
    speed: rand(2, 7),
    glyph: Math.floor(rand(0, 8))
  }));
}

function initEffect() {
  resizeCanvas();
  if (effect === "particles") makeTextParticles();
  if (effect === "liquid") initLiquid();
  if (effect === "gooey") initGooey();
  if (effect === "tunnel") initTunnel();
  if (effect === "trail") initTrail();
  if (effect === "terrain") initTerrain();
  if (effect === "terminal") initTerminalRain();
  if (effect === "kinetic" || effect === "glitch") initLiquid();
}

function drawParticles() {
  clear(0.24);
  const repelRadius = reducedMotion ? 70 : 132;
  particles.forEach((p) => {
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    const repel = dist < repelRadius ? (1 - dist / repelRadius) * 8 : 0;
    const swirl = Math.sin(frame * 0.018 + p.tx * 0.01) * 0.9;

    p.vx += (p.tx - p.x) * 0.012 - (dx / dist) * repel + swirl * 0.04;
    p.vy += (p.ty - p.y) * 0.012 - (dy / dist) * repel - swirl * 0.04;
    p.vx *= 0.84;
    p.vy *= 0.84;
    p.x += p.vx;
    p.y += p.vy;

    ctx.fillStyle = `hsla(${p.hue}, 100%, 68%, 0.92)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLiquid() {
  clear(0.16);
  ctx.globalCompositeOperation = "lighter";
  particles.forEach((p, index) => {
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = clamp(120 / dist, 0, 0.06);

    p.vx += dx * pull * 0.03 + Math.sin(frame * 0.01 + index) * 0.018;
    p.vy += dy * pull * 0.03 + Math.cos(frame * 0.012 + index) * 0.018;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -p.r) p.x = width + p.r;
    if (p.x > width + p.r) p.x = -p.r;
    if (p.y < -p.r) p.y = height + p.r;
    if (p.y > height + p.r) p.y = -p.r;

    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    gradient.addColorStop(0, `hsla(${p.hue}, 100%, 64%, 0.42)`);
    gradient.addColorStop(0.45, `hsla(${p.hue + 38}, 100%, 58%, 0.2)`);
    gradient.addColorStop(1, `hsla(${p.hue}, 100%, 55%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  for (let y = -40; y < height + 40; y += 28) {
    ctx.beginPath();
    for (let x = -20; x < width + 20; x += 16) {
      const wave = Math.sin(x * 0.012 + frame * 0.03 + y * 0.02) * 12;
      const warp = Math.sin((x - pointer.x) * 0.018 + (y - pointer.y) * 0.014) * 10;
      if (x === -20) ctx.moveTo(x, y + wave + warp);
      else ctx.lineTo(x, y + wave + warp);
    }
    ctx.stroke();
  }
}

function drawGooey() {
  clear(0.22);
  ctx.globalCompositeOperation = "lighter";
  blobs.forEach((b, index) => {
    const dx = pointer.x - b.x;
    const dy = pointer.y - b.y;
    const dist = Math.hypot(dx, dy) || 1;
    b.vx += dx / dist * 0.045 + Math.sin(frame * 0.018 + index) * 0.035;
    b.vy += dy / dist * 0.045 + Math.cos(frame * 0.016 + index) * 0.035;
    b.vx *= 0.97;
    b.vy *= 0.97;
    b.x += b.vx;
    b.y += b.vy;

    if (b.x < b.r || b.x > width - b.r) b.vx *= -1;
    if (b.y < b.r || b.y > height - b.r) b.vy *= -1;

    const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
    gradient.addColorStop(0, `hsla(${b.hue}, 100%, 64%, 0.9)`);
    gradient.addColorStop(0.72, `hsla(${b.hue}, 100%, 50%, 0.2)`);
    gradient.addColorStop(1, `hsla(${b.hue}, 100%, 50%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";
}

function drawKinetic() {
  clear(0.34);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  for (let i = 0; i < 34; i += 1) {
    const a = frame * 0.018 + i * 0.28;
    const radius = 80 + i * 14;
    ctx.rotate(0.035);
    ctx.strokeStyle = `hsla(${180 + i * 7}, 100%, 62%, ${0.72 - i * 0.014})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(
      Math.cos(a) * radius - width * 0.28,
      Math.sin(a) * radius - 38,
      width * 0.56,
      76
    );
  }
  ctx.restore();
}

function drawGlitch() {
  clear(0.32);
  const bars = reducedMotion ? 16 : 56;
  for (let i = 0; i < bars; i += 1) {
    const y = Math.random() * height;
    const h = rand(2, 18);
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,229,255,0.28)" : "rgba(255,45,120,0.28)";
    ctx.fillRect(rand(-80, width), y, rand(80, width * 0.46), h);
  }

  for (let i = 0; i < 120; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.16})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, rand(1, 4), rand(1, 4));
  }
}

function drawTunnel() {
  clear(0.22);
  const cx = width / 2 + (pointer.x - width / 2) * 0.22;
  const cy = height / 2 + (pointer.y - height / 2) * 0.22;
  ctx.globalCompositeOperation = "lighter";

  stars.forEach((s) => {
    const prevZ = s.z;
    s.z -= reducedMotion ? 0.002 : 0.01;
    if (s.z <= 0.02) {
      s.x = rand(-1, 1);
      s.y = rand(-1, 1);
      s.z = 1;
    }
    const scale = 1 / s.z;
    const prevScale = 1 / prevZ;
    const x = cx + s.x * width * 0.42 * scale;
    const y = cy + s.y * height * 0.42 * scale;
    const px = cx + s.x * width * 0.42 * prevScale;
    const py = cy + s.y * height * 0.42 * prevScale;
    const alpha = clamp(1 - s.z, 0.08, 0.94);

    ctx.strokeStyle = `hsla(${s.hue}, 100%, 70%, ${alpha})`;
    ctx.lineWidth = clamp((1 - s.z) * 5, 0.5, 4);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  ctx.globalCompositeOperation = "source-over";
}

function drawTrail() {
  clear(0.1);
  const speed = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py);
  const spawn = reducedMotion ? 3 : clamp(Math.floor(speed / 3), 8, 26);
  for (let i = 0; i < spawn; i += 1) {
    trails.push({
      x: pointer.x + rand(-14, 14),
      y: pointer.y + rand(-14, 14),
      vx: rand(-3.4, 3.4),
      vy: rand(-3.4, 3.4),
      life: rand(34, 78),
      hue: rand(170, 340)
    });
  }

  trails = trails.slice(-900);
  ctx.globalCompositeOperation = "lighter";
  trails.forEach((p) => {
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.y += p.vy;
    p.x += p.vx;
    p.life -= 1;
    const alpha = clamp(p.life / 78, 0, 1);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 66%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2 + alpha * 8, 0, Math.PI * 2);
    ctx.fill();
  });
  trails = trails.filter((p) => p.life > 0);
  ctx.globalCompositeOperation = "source-over";
}

function addRipple(x, y) {
  ripples.push({ x, y, r: 0, life: 1 });
  ripples = ripples.slice(-8);
}

function drawTerrain() {
  clear(0.28);
  ctx.save();
  ctx.translate(width / 2, height * 0.62);
  ctx.strokeStyle = "rgba(0,229,255,0.42)";
  ctx.lineWidth = 1.4;
  const rows = 30;
  const cols = 42;
  const spacingX = width / (cols - 1);
  const spacingY = 22;
  const horizon = -height * 0.32;

  for (let row = 0; row < rows; row += 1) {
    ctx.beginPath();
    for (let col = 0; col < cols; col += 1) {
      const x = (col - cols / 2) * spacingX;
      const z = row / rows;
      const y = horizon + row * spacingY + z * z * height * 0.42;
      const wave =
        Math.sin(col * 0.42 + frame * 0.05) * 18 * z +
        Math.cos(row * 0.4 + frame * 0.035) * 24 * z;
      const sx = x * (0.4 + z * 1.2);
      const sy = y + wave;
      if (col === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  for (let col = 0; col < cols; col += 1) {
    ctx.beginPath();
    for (let row = 0; row < rows; row += 1) {
      const z = row / rows;
      const x = (col - cols / 2) * spacingX * (0.4 + z * 1.2);
      const y = horizon + row * spacingY + z * z * height * 0.42;
      const wave = Math.sin(col * 0.42 + frame * 0.05) * 18 * z;
      if (row === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }
  ctx.restore();

  ripples.forEach((r) => {
    r.r += reducedMotion ? 0.8 : 4.6;
    r.life *= 0.94;
    ctx.strokeStyle = `rgba(255,45,120,${r.life})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ripples = ripples.filter((r) => r.life > 0.04);
}

function drawTerminalRain() {
  clear(0.18);
  ctx.font = "16px Consolas, monospace";
  ctx.textAlign = "center";
  const chars = ["炫", "技", "0", "1", ">", "/", "{", "}"];

  codeDrops.forEach((drop, index) => {
    drop.y += reducedMotion ? drop.speed * 0.22 : drop.speed;
    if (drop.y > height + 80) {
      drop.y = rand(-240, -20);
      drop.speed = rand(2, 7);
    }

    for (let i = 0; i < 12; i += 1) {
      const y = drop.y - i * 18;
      if (y < -20 || y > height + 20) continue;
      const alpha = Math.max(0, 1 - i / 12);
      const char = chars[(drop.glyph + i + index) % chars.length];
      ctx.fillStyle = `rgba(103, 255, 150, ${alpha * 0.62})`;
      ctx.fillText(char, drop.x, y);
    }
  });
}

function draw() {
  if (!ctx) return;
  frame += 1;
  pointer.px += (pointer.x - pointer.px) * 0.32;
  pointer.py += (pointer.y - pointer.py) * 0.32;

  if (effect === "particles") drawParticles();
  else if (effect === "liquid") drawLiquid();
  else if (effect === "gooey") drawGooey();
  else if (effect === "kinetic") drawKinetic();
  else if (effect === "glitch") drawGlitch();
  else if (effect === "tunnel") drawTunnel();
  else if (effect === "trail") drawTrail();
  else if (effect === "terrain") drawTerrain();
  else if (effect === "terminal") drawTerminalRain();

  requestAnimationFrame(draw);
}

function updateScrollCinema() {
  if (effect !== "scroll-cinema") return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(3));
}

function initTerminal() {
  if (effect !== "terminal") return;
  const typed = document.querySelector("#typedCommand");
  const output = document.querySelector("#typedOutput");
  if (!typed || !output) return;

  const command = "run --effect 炫技 --mode overload --frames infinite";
  const lines = [
    "boot: visual engine online",
    "load: kinetic type / clip masks / orbit fields",
    "render: 炫技 炫技 炫技",
    "status: impossible-looking page stabilized"
  ];
  let index = 0;
  let lineIndex = 0;

  function typeTick() {
    typed.textContent = command.slice(0, index);
    index += 1;

    if (index <= command.length) {
      setTimeout(typeTick, reducedMotion ? 42 : 24);
      return;
    }

    const next = lines[lineIndex % lines.length];
    output.textContent = `> ${next}`;
    lineIndex += 1;
    setTimeout(() => {
      index = 0;
      typeTick();
    }, reducedMotion ? 1400 : 760);
  }

  typeTick();
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  setPointerVars(pointer.x, pointer.y);
  if (effect === "orbit") {
    const x = (event.clientX / window.innerWidth - 0.5) * 22;
    const y = (event.clientY / window.innerHeight - 0.5) * -18;
    document.documentElement.style.setProperty("--orbit-tilt-x", `${y}deg`);
    document.documentElement.style.setProperty("--orbit-tilt-y", `${x}deg`);
  }
});

window.addEventListener("pointerdown", (event) => {
  pointer.down = true;
  if (effect === "terrain") addRipple(event.clientX, event.clientY);
});

window.addEventListener("pointerup", () => {
  pointer.down = false;
});

window.addEventListener("resize", () => {
  initEffect();
});

window.addEventListener("scroll", updateScrollCinema, { passive: true });

setPointerVars(pointer.x, pointer.y);
if (canvas) {
  initEffect();
  draw();
}
initTerminal();
updateScrollCinema();
