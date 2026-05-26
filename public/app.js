const connectionStatus = document.querySelector("#connectionStatus");
const quoteText = document.querySelector("#quoteText");
const timeText = document.querySelector("#timeText");
const browserText = document.querySelector("#browserText");
const refreshButton = document.querySelector("#refreshButton");

function setLoading() {
  connectionStatus.textContent = "正在连接公网";
  quoteText.textContent = "正在从 GitHub API 读取...";
  timeText.textContent = "正在从 WorldTime API 读取...";
  browserText.textContent = navigator.onLine ? "浏览器报告：在线" : "浏览器报告：离线";
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

async function loadOnlineData() {
  setLoading();

  const results = await Promise.allSettled([
    fetchText("https://api.github.com/zen"),
    fetchJson("https://worldtimeapi.org/api/ip")
  ]);

  if (results[0].status === "fulfilled") {
    quoteText.textContent = results[0].value;
  } else {
    quoteText.textContent = "GitHub API 暂时不可用，请稍后再试。";
  }

  if (results[1].status === "fulfilled") {
    const { datetime, timezone } = results[1].value;
    const date = new Date(datetime);
    timeText.textContent = `${timezone}：${date.toLocaleString("zh-CN")}`;
  } else {
    timeText.textContent = "WorldTime API 暂时不可用，请稍后再试。";
  }

  const hasOnlineData = results.some((result) => result.status === "fulfilled");
  connectionStatus.textContent = hasOnlineData ? "公网连接成功" : "公网连接失败";
  browserText.textContent = `${navigator.userAgent}`;
}

refreshButton.addEventListener("click", loadOnlineData);
window.addEventListener("online", loadOnlineData);
window.addEventListener("offline", () => {
  connectionStatus.textContent = "浏览器已离线";
  browserText.textContent = "浏览器报告：离线";
});

loadOnlineData();
