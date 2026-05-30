const connectionStatus = document.querySelector("#connectionStatus");
const quoteText = document.querySelector("#quoteText");
const timeText = document.querySelector("#timeText");
const browserText = document.querySelector("#browserText");
const refreshButton = document.querySelector("#refreshButton");

function setLoading() {
  connectionStatus.textContent = "连接中";
  quoteText.textContent = "正在读取 GitHub API...";
  timeText.textContent = "正在同步网络时间...";
  browserText.textContent = navigator.onLine ? "浏览器在线" : "浏览器离线";
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

async function loadOnlineData() {
  setLoading();

  const results = await Promise.allSettled([
    fetchText("https://api.github.com/zen"),
    fetchJson("https://worldtimeapi.org/api/ip")
  ]);

  if (results[0].status === "fulfilled") {
    quoteText.textContent = results[0].value;
  } else {
    quoteText.textContent = "公网 API 暂时没有响应，页面仍可正常访问。";
  }

  if (results[1].status === "fulfilled") {
    const { datetime, timezone } = results[1].value;
    timeText.textContent = `${timezone} · ${formatTime(datetime)}`;
  } else {
    timeText.textContent = `本地时间 · ${formatTime(Date.now())}`;
  }

  const hasOnlineData = results.some((result) => result.status === "fulfilled");
  connectionStatus.textContent = hasOnlineData ? "在线运行" : "等待网络";
  browserText.textContent = navigator.userAgent.replace(/\s+/g, " ");
}

refreshButton.addEventListener("click", loadOnlineData);
window.addEventListener("online", loadOnlineData);
window.addEventListener("offline", () => {
  connectionStatus.textContent = "浏览器离线";
  browserText.textContent = "当前设备暂时离线";
});

loadOnlineData();
