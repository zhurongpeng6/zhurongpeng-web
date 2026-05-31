const connectionStatus = document.querySelector("#connectionStatus");
const quoteText = document.querySelector("#quoteText");
const timeText = document.querySelector("#timeText");
const browserText = document.querySelector("#browserText");
const refreshButton = document.querySelector("#refreshButton");

const moods = [
  {
    status: "高冷营业中",
    quote: "有点拽，但会陪你上线"
  },
  {
    status: "耳朵已竖起",
    quote: "今天适合发布一点新东西"
  },
  {
    status: "酷酷巡逻中",
    quote: "页面正常，气场也正常"
  },
  {
    status: "冰蓝眼待机",
    quote: "看起来很淡定，其实在认真工作"
  }
];

let moodIndex = 0;

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function getBrowserLabel() {
  const agent = navigator.userAgent;

  if (agent.includes("Edg/")) return "Edge 浏览器在线";
  if (agent.includes("Chrome/")) return "Chrome 浏览器在线";
  if (agent.includes("Firefox/")) return "Firefox 浏览器在线";
  if (agent.includes("Safari/")) return "Safari 浏览器在线";
  return navigator.onLine ? "浏览器在线" : "浏览器离线";
}

function renderMood() {
  const mood = moods[moodIndex % moods.length];
  connectionStatus.textContent = mood.status;
  quoteText.textContent = mood.quote;
  timeText.textContent = `本地时间 · ${formatTime(new Date())}`;
  browserText.textContent = getBrowserLabel();
  moodIndex += 1;
}

refreshButton.addEventListener("click", renderMood);
window.addEventListener("online", renderMood);
window.addEventListener("offline", () => {
  connectionStatus.textContent = "离线趴窝中";
  quoteText.textContent = "网络暂时不在，但萌宠还在";
  browserText.textContent = "当前设备离线";
});

renderMood();
