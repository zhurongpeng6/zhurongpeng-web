const shell = document.querySelector(".playroom-shell");
const room = document.querySelector(".interactive-room");
const pet = document.querySelector("#cssPet");
const petZone = document.querySelector("#petZone");
const statusText = document.querySelector("#petStatus");
const actionCount = document.querySelector("#actionCount");
const items = [...document.querySelectorAll(".play-item")];

const mode = shell?.dataset.mode || "eat";

const copy = {
  eat: {
    idle: "盯着远处的食物。",
    crave: "眼睛亮了，口水要掉下来了。",
    action: "抱住食物开始吧唧吧唧。",
    done: "吃完拍拍肚子，幸福打滚。",
    surprise: "吃撑了，圆滚滚地摆手拒绝。"
  },
  drink: {
    idle: "有点口渴，眼神委屈。",
    crave: "看到饮料后马上精神了一点。",
    action: "抱着杯子咕噜咕噜补水。",
    done: "甩掉水珠，发出清脆的哈。",
    surprise: "冰饮冻脑袋，原地僵住两秒。"
  },
  play: {
    idle: "叼着空气等你陪它玩。",
    crave: "尾巴摇得很快，准备冲出去。",
    action: "像小炮弹一样冲出去玩。",
    done: "玩开心了，伸爪求贴贴。",
    surprise: "电量耗尽，吧唧一下秒睡。"
  }
};

let count = 0;
let resetTimer = 0;
let activeDrag = null;

function setState(state, text) {
  pet.dataset.state = state;
  room.dataset.state = state;
  statusText.textContent = text || copy[mode][state] || copy[mode].idle;

  window.clearTimeout(resetTimer);
  if (state !== "idle" && state !== "surprise") {
    resetTimer = window.setTimeout(() => setState("idle"), 1800);
  }

  if (state === "surprise") {
    resetTimer = window.setTimeout(() => {
      count = 0;
      actionCount.textContent = count;
      setState("idle");
    }, mode === "drink" ? 2100 : 3200);
  }
}

function isOverPet(clientX, clientY) {
  const rect = petZone.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function burstAt(x, y, label) {
  const burst = document.createElement("span");
  burst.className = "drop-burst";
  burst.textContent = label;
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  room.appendChild(burst);
  window.setTimeout(() => burst.remove(), 900);
}

function finishAction(item, event) {
  count += 1;
  actionCount.textContent = count;

  if (mode === "drink" && item.textContent.includes("🧊") && Math.random() < 0.5) {
    setState("surprise", copy.drink.surprise);
    burstAt(event.clientX, event.clientY, "冰！");
    return;
  }

  if ((mode === "eat" && count >= 5) || (mode === "play" && count >= 6) || (mode === "drink" && count >= 5)) {
    setState("surprise", copy[mode].surprise);
    burstAt(event.clientX, event.clientY, mode === "play" ? "zzz" : "!");
    return;
  }

  setState("action", copy[mode].action);
  burstAt(event.clientX, event.clientY, item.textContent);
  window.setTimeout(() => {
    if (pet.dataset.state === "action") setState("done", copy[mode].done);
  }, 900);
}

function beginDrag(item, event) {
  const rect = item.getBoundingClientRect();
  const roomRect = room.getBoundingClientRect();
  activeDrag = {
    item,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    moved: false,
    roomLeft: roomRect.left,
    roomTop: roomRect.top
  };

  item.setPointerCapture(event.pointerId);
  item.classList.add("is-dragging");
  setState("crave", copy[mode].crave);
}

function moveDrag(event) {
  if (!activeDrag) return;

  const deltaX = event.clientX - activeDrag.startX;
  const deltaY = event.clientY - activeDrag.startY;
  if (Math.hypot(deltaX, deltaY) > 5) activeDrag.moved = true;

  const x = event.clientX - activeDrag.roomLeft - activeDrag.offsetX;
  const y = event.clientY - activeDrag.roomTop - activeDrag.offsetY;
  activeDrag.item.style.left = `${x}px`;
  activeDrag.item.style.top = `${y}px`;
  activeDrag.item.style.setProperty("--x", "0px");
  activeDrag.item.style.setProperty("--y", "0px");
}

function endDrag(event) {
  if (!activeDrag) return;

  const { item, moved } = activeDrag;
  item.classList.remove("is-dragging");

  if (!moved) {
    setState("crave", copy[mode].crave);
  } else if (isOverPet(event.clientX, event.clientY)) {
    finishAction(item, event);
  } else {
    setState("crave", copy[mode].crave);
  }

  activeDrag = null;
}

items.forEach((item) => {
  item.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    beginDrag(item, event);
  });
});

window.addEventListener("pointermove", moveDrag);
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", () => {
  if (activeDrag) activeDrag.item.classList.remove("is-dragging");
  activeDrag = null;
  setState("idle");
});

setState("idle");
