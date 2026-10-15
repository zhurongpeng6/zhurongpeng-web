# 毛婆婆 · 个人主页

纯白极简个人主页，包含原创银色精密装置、学习状态、真实项目画面与运动兴趣。公开内容仅使用昵称，不含真实姓名、学校、照片和私人联系方式。

## 页面入口

- `index.html`：个人主页，使用独立的 `profile.css` 与模块脚本 `profile-effects.js`。
- `visual-lab.html`：动态视觉实验室；现有互动子页仍返回此页。
- `projects/daily-spark/index.html`：今日灵感盲盒，保留分类、抽取、收藏与完成记录。记录保存在当前网站的浏览器存储，不自动迁移旧站记录。

## 三维场景与兼容

Three.js 固定为 0.180.0，本地运行文件位于 `public/vendor`，保留 MIT 许可证。原创装置使用程序化三层金属环、刻度、核心和 M 标记；RoomEnvironment 提供反射环境。浏览器运行时不访问 CDN。

桌面以原生滚动驱动装置缓慢转动和展开，手机取消粘性长镜头和指针倾斜。稳定、离屏或后台时停止持续绘制。减少动态效果、WebGL 不可用和禁用 JavaScript 时使用本地静态图。未添加后端或收集访客信息。

项目展示图来自项目本身。运行 `node qa/premium-capture.cjs` 可通过本地 3001 端口重新抓取项目截图与装置后备图。启动预览时使用 `npm start`（默认 3000），或在 PowerShell 中先设置 `$env:PORT='3001'`。

## 验证

`node qa/premium-verify.cjs` 使用本机 Chrome 和预装 Playwright，连接 `http://127.0.0.1:3001/`。结果为 `qa/premium-results.json`，截图为 `qa/premium-*.png`。

覆盖 1920/1440/768/390/320 布局、图像加载、滚动驱动和空闲停绘、减少动态效果、无 JavaScript / 无 WebGL 后备、键盘与触摸、原实验室和盲盒功能。后台行为使用可见性事件模拟，不等同于真实低端设备性能测量。

## Git 版本

- `v0.1-profile-effects`：改版前的个人主页与精选互动特效。
- `codex/premium-homepage`：纯白极简改版开发分支，按阶段保存本地提交。
- `v0.2-premium-homepage`：完成验证后的纯白极简版本。

仅本地版本管理，本轮未推送远程或发布公网。旧版验证记录保留供历史对照，旧首页脚本不作为当前版的验收依据。
