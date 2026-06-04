const pageType = document.body.dataset.featured;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function initDistortion() {
  document.querySelectorAll(".duality-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--split", `${clamp(x, 16, 84)}%`);
      card.style.setProperty("--x", `${x}%`);
      card.style.setProperty("--y", `${y}%`);
      card.style.setProperty("--tilt-y", `${(x - 50) * 0.14}deg`);
      card.style.setProperty("--tilt-x", `${(50 - y) * 0.1}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--split", "50%");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-x", "0deg");
    });
  });
}

function initScrollVars() {
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(window.scrollY / max, 0, 1);
    document.documentElement.style.setProperty("--cube-progress", progress.toFixed(4));
    document.documentElement.style.setProperty("--para-progress", progress.toFixed(4));
    document.querySelectorAll(".parallax-card").forEach((card, index) => {
      const local = (progress * 5 - index) * 60;
      card.style.setProperty("--shift", `${clamp(local, -90, 90)}px`);
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initGta() {
  const card = document.querySelector(".gta-card");
  if (!card) return;

  window.addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    card.style.setProperty("--gta-ry", `${x * 18}deg`);
    card.style.setProperty("--gta-rx", `${y * -12}deg`);
  });
}

function initDitherPhysics() {
  const canvas = document.querySelector(".dither-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let dots = [];
  let frame = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const step = width < 720 ? 18 : 14;
    dots = [];
    for (let y = -step; y < height + step; y += step) {
      for (let x = -step; x < width + step; x += step) {
        const ridge = Math.sin(x * 0.012) * 60 + Math.cos(y * 0.018) * 44;
        dots.push({
          x,
          y,
          ox: x,
          oy: y,
          vx: 0,
          vy: 0,
          tone: (x + y + ridge) % 255
        });
      }
    }
  }

  function draw() {
    frame += 1;
    ctx.fillStyle = "rgba(5,5,7,0.32)";
    ctx.fillRect(0, 0, width, height);

    dots.forEach((dot) => {
      const dx = pointer.x - dot.x;
      const dy = pointer.y - dot.y;
      const dist = Math.hypot(dx, dy) || 1;
      const force = Math.max(0, 1 - dist / 170);
      dot.vx += (dot.ox - dot.x) * 0.035 - (dx / dist) * force * 8;
      dot.vy += (dot.oy - dot.y) * 0.035 - (dy / dist) * force * 8;
      dot.vx *= 0.82;
      dot.vy *= 0.82;
      dot.x += reduced ? dot.vx * 0.18 : dot.vx;
      dot.y += reduced ? dot.vy * 0.18 : dot.vy;

      const wave = Math.sin(frame * 0.04 + dot.ox * 0.02 + dot.oy * 0.01);
      const size = clamp(1.8 + force * 8 + wave * 1.8, 1, 12);
      const light = dot.tone > 128 ? 72 : 38;
      ctx.fillStyle = `hsl(${32 + force * 180}, 90%, ${light + force * 20}%)`;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

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

if (pageType === "distortion") initDistortion();
if (pageType === "cubic" || pageType === "western") initScrollVars();
if (pageType === "gta") initGta();
if (pageType === "dither") initDitherPhysics();
