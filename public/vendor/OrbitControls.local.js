/* 本地 OrbitControls 兼容封装：以项目自带 three 0.180 实现常用轨道控制子集
   （拖拽旋转 / 滚轮与双指缩放 / 阻尼 / 自动环绕 / 距离与俯仰限制），
   供 GARGANTUA 等作品离线运行，替代 CDN 的 examples/jsm/controls/OrbitControls.js。
   关键语义与官方一致：update() 每次从相机当前位置重建球坐标，再叠加输入增量；
   外部代码（视角预设/电影运镜）直接改写 camera.position 不会被旧状态覆盖。 */
import * as THREE from './three.module.min.js';

export class OrbitControls {
  constructor(object, domElement) {
    this.object = object;
    this.domElement = domElement;
    this.target = new THREE.Vector3();
    this.enabled = true;
    this.enableDamping = false;
    this.dampingFactor = 0.05;
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0;
    this.enableZoom = true;
    this.enableRotate = true;
    this.enablePan = false;
    this.minDistance = 0.1;
    this.maxDistance = Infinity;
    this.minPolarAngle = 0.01;
    this.maxPolarAngle = Math.PI - 0.01;
    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.0;

    /* 输入增量：跨帧保留，按阻尼衰减（官方同款语义） */
    this._sphericalDelta = new THREE.Spherical(0, 0, 0);
    this._scale = 1;
    this._spherical = new THREE.Spherical();
    this._offset = new THREE.Vector3();
    this._pointers = new Map();
    this._pinchDist = 0;

    this._onDown = (e) => {
      if (!this.enabled) return;
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this._pointers.size === 2) {
        const [a, b] = [...this._pointers.values()];
        this._pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
      if (domElement.setPointerCapture) { try { domElement.setPointerCapture(e.pointerId); } catch (err) {} }
    };
    this._onMove = (e) => {
      if (!this.enabled || !this._pointers.has(e.pointerId)) return;
      const prev = this._pointers.get(e.pointerId);
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this._pointers.size === 1 && this.enableRotate) {
        const h = domElement.clientHeight || 1;
        this._sphericalDelta.theta -= 2 * Math.PI * dx / h * this.rotateSpeed;
        this._sphericalDelta.phi -= 2 * Math.PI * dy / h * this.rotateSpeed;
      } else if (this._pointers.size === 2 && this.enableZoom) {
        const [a, b] = [...this._pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (this._pinchDist > 0 && d > 0) this._scale *= Math.pow(this._pinchDist / d, this.zoomSpeed);
        this._pinchDist = d;
      }
    };
    this._onUp = (e) => {
      this._pointers.delete(e.pointerId);
      this._pinchDist = 0;
    };
    this._onWheel = (e) => {
      if (!this.enabled || !this.enableZoom) return;
      e.preventDefault();
      const f = Math.pow(0.95, this.zoomSpeed);
      this._scale *= e.deltaY > 0 ? 1 / f : f;
    };
    domElement.addEventListener('pointerdown', this._onDown);
    domElement.addEventListener('pointermove', this._onMove);
    domElement.addEventListener('pointerup', this._onUp);
    domElement.addEventListener('pointercancel', this._onUp);
    domElement.addEventListener('wheel', this._onWheel, { passive: false });
  }
  update() {
    /* 每次从相机实际位置重建球坐标：外部改写的机位立即生效 */
    this._offset.copy(this.object.position).sub(this.target);
    this._spherical.setFromVector3(this._offset);
    if (!this.enabled) {
      /* 禁用期间（预设动画/电影运镜）清空残余输入，避免恢复时跳变 */
      this._sphericalDelta.set(0, 0, 0);
      this._scale = 1;
      return false;
    }
    if (this.autoRotate && this._pointers.size === 0) {
      this._sphericalDelta.theta -= 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }
    const k = this.enableDamping ? this.dampingFactor : 1;
    this._spherical.theta += this._sphericalDelta.theta * k;
    this._spherical.phi += this._sphericalDelta.phi * k;
    this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi));
    this._spherical.makeSafe();
    this._spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this._spherical.radius * this._scale));
    this._sphericalDelta.theta *= (1 - k);
    this._sphericalDelta.phi *= (1 - k);
    this._scale = 1 + (this._scale - 1) * (1 - k);
    if (Math.abs(this._sphericalDelta.theta) < 1e-6) this._sphericalDelta.theta = 0;
    if (Math.abs(this._sphericalDelta.phi) < 1e-6) this._sphericalDelta.phi = 0;
    if (Math.abs(this._scale - 1) < 1e-6) this._scale = 1;
    this._offset.setFromSpherical(this._spherical);
    this.object.position.copy(this.target).add(this._offset);
    this.object.lookAt(this.target);
    return true;
  }
  dispose() {
    const d = this.domElement;
    d.removeEventListener('pointerdown', this._onDown);
    d.removeEventListener('pointermove', this._onMove);
    d.removeEventListener('pointerup', this._onUp);
    d.removeEventListener('pointercancel', this._onUp);
    d.removeEventListener('wheel', this._onWheel);
  }
}
