# 本地验证记录

## 个人主页改版（2026-10-13）

- `profile-verify.cjs`：个人主页、实验室和盲盒的浏览器验证。
- `profile-results.json`：本次检查结果；`profile-*.png` 为页面截图。
- 覆盖 1440、1920、390、320 像素宽度，导航、可见键盘焦点、减少动态效果、转盘切换与拖动、盲盒分类抽取与收藏/完成记录持久化、项目返回入口及现有 HTML 页面链接。
- 默认从本地文件打开，可设置 `PREVIEW_URL=http://127.0.0.1:3001/` 测试预览服务。
- 以下记录为先前实验室版本的验证，不代表本次重新进行性能对比。历史脚本中的转盘首页应使用 `visual-lab.html`。

- `results.json`：三种宽度、20 条路由、交互、动画生命周期与性能原始结果。
- `extra-results.json`：触摸、盘外滚动、取消、捕获丢失与静态可见性结果。
- `home-1440.png`、`home-1920.png`、`home-390.png`：首页截图。
- `reduced-*.png`：减少动态效果模式截图。
- `baseline.zip` / `baseline/`：版本 `8d32a2b` 的只读测试副本，不是运行时资源。

测试命令：`node qa/verify.cjs` 与 `node qa/extra.cjs`。脚本当前引用这台电脑的预装 Playwright 路径，并使用本机 Chrome；迁移电脑时需修改 require 路径并安装浏览器。主测试需要 baseline/public 中的旧文件。测试打开 file:// 页面，不依赖运行服务器。

性能为同环境短时对比；rAF 频率与 60 Hz 动画更新频率不同。具体解释见根目录的优化说明。
