/* Original homepage scene. No user information is fetched or transmitted. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 767px)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const story = document.querySelector('.hero-story');
const stage = document.querySelector('.device-stage');
const canvas = document.querySelector('#metal-device');
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
let renderer, scene, camera, assembly, rings, frame=0, progress=0, target=0, mx=0, my=0, visible=true, lost=false;
let sceneReady=false;
function layoutMode(){document.documentElement.classList.toggle('motion-ready',sceneReady&&!reduce.matches&&!compact.matches);}
function progressAtScroll(){const r=story.getBoundingClientRect();return compact.matches||reduce.matches?0:clamp(-r.top/Math.max(1,story.offsetHeight-innerHeight+68),0,1);}
function paint(){
 frame=0;
 if(!sceneReady||lost||reduce.matches||document.hidden||!visible)return;
 progress += (target-progress)*.13;
 if(Math.abs(target-progress)<.0002)progress=target;
 assembly.rotation.set(.4+progress*.32+my*.035,-.27+progress*.55+mx*.055,-.22+progress*.1);
 rings[0].rotation.y=progress*.36;rings[1].rotation.x=-.13-progress*.62;rings[2].rotation.y=.16+progress*.74;
 rings[0].position.y=progress*.22;rings[1].position.y=progress*.06;rings[2].position.y=-progress*.1;
 renderer.render(scene,camera);canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);
 if(progress!==target)wake();
}
function wake(){if(!frame&&sceneReady&&!lost&&!reduce.matches&&!document.hidden&&visible)frame=requestAnimationFrame(paint);}
function resize(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,compact.matches?1.25:1.6));renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=compact.matches?10.4:9.2;camera.updateProjectionMatrix();wake();}
let scrollFrame=0;
function onScroll(){if(scrollFrame||document.hidden)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;target=progressAtScroll();wake();for(const el of document.querySelectorAll('.project-image-link')){const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;const p=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);el.style.setProperty('--project-scale',reduce.matches?'1':String(.965+.035*p));el.style.setProperty('--project-y',reduce.matches?'0px':`${(1-p)*10}px`);}});}
window.addEventListener('scroll',onScroll,{passive:true});
new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible){target=progressAtScroll();progress=target;wake();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'}).observe(stage);
const revealObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-visible');revealObserver.unobserve(e.target);}},{threshold:.08});
if(!reduce.matches){document.documentElement.classList.add('reveal-ready');document.querySelectorAll('.reveal').forEach(e=>revealObserver.observe(e));}
function modeChanged(){layoutMode();target=progressAtScroll();progress=target;mx=my=0;if(reduce.matches){stage.classList.remove('is-rendered');document.documentElement.classList.remove('reveal-ready');cancelAnimationFrame(frame);frame=0;}else if(renderer){stage.classList.add('is-rendered');resize();}else init();onScroll();}
reduce.addEventListener('change',modeChanged);compact.addEventListener('change',()=>{layoutMode();resize();onScroll();});
window.addEventListener('resize',()=>{resize();onScroll();});
function resetPointer(){mx=my=0;wake();}
stage.addEventListener('pointermove',e=>{if(!fine.matches||compact.matches||reduce.matches||e.pointerType==='touch')return;const r=stage.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5;wake();});
for(const type of ['pointerleave','pointercancel'])stage.addEventListener(type,resetPointer);
window.addEventListener('blur',resetPointer);
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);cancelAnimationFrame(scrollFrame);frame=scrollFrame=0;if(!document.hidden){target=progressAtScroll();progress=target;wake();}});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;sceneReady=false;cancelAnimationFrame(frame);frame=0;stage.classList.remove('is-rendered');layoutMode();});
canvas.addEventListener('webglcontextrestored',()=>location.reload());
let initializing=false;
async function init(){
 if(initializing||reduce.matches)return;initializing=true;
 try{
 const T=await import('./vendor/three.module.min.js');const {RoomEnvironment}=await import('./vendor/RoomEnvironment.js');
 renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0xffffff,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.55;
 scene=new T.Scene();camera=new T.PerspectiveCamera(35,1,.1,100);camera.position.set(0,2.5,9.2);camera.lookAt(0,0,0);
 const pmrem=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.03);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xffffff,0xa2a8b3,2.2));const key=new T.DirectionalLight(0xffffff,4);key.position.set(-4,6,5);scene.add(key);const rim=new T.DirectionalLight(0xc2dcff,2.2);rim.position.set(4,1,-3);scene.add(rim);
 const metal=new T.MeshStandardMaterial({color:0xc7cbd1,metalness:1,roughness:.24});const edge=new T.MeshStandardMaterial({color:0xe1e5e9,metalness:1,roughness:.14});const dark=new T.MeshStandardMaterial({color:0x343c44,metalness:.85,roughness:.28});const blue=new T.MeshStandardMaterial({color:0x669ed1,metalness:.6,roughness:.2,emissive:0x28659e,emissiveIntensity:.2});
 assembly=new T.Group();scene.add(assembly);rings=[];
 for(const [i,r] of [2.45,1.96,1.48].entries()){
 const g=new T.Group();assembly.add(g);rings.push(g);
 const torus=new T.Mesh(new T.TorusGeometry(r,.115-i*.012,20,160),metal);g.add(torus);
 for(const offset of [-.067,.067]){const line=new T.Mesh(new T.TorusGeometry(r,.016,8,160),edge);line.position.z=offset;g.add(line);}
 const tickGeo=new T.BoxGeometry(.012,.065,.014);const ticks=new T.InstancedMesh(tickGeo,dark,72);const o=new T.Object3D();for(let n=0;n<72;n++){const a=n/72*Math.PI*2;o.position.set(Math.sin(a)*r,Math.cos(a)*r,.111-i*.012);o.rotation.z=-a;o.scale.set(1,n%6===0?1.7:1,1);o.updateMatrix();ticks.setMatrixAt(n,o.matrix);}g.add(ticks);
 for(const angle of [0,Math.PI]){const hub=new T.Mesh(new T.SphereGeometry(.15,16,12),edge);hub.scale.set(.7,.7,.5);hub.position.set(Math.sin(angle+i*.8)*r,Math.cos(angle+i*.8)*r,0);g.add(hub);}
 }
 const core=new T.Group();assembly.add(core);const disc=new T.Mesh(new T.CylinderGeometry(.94,.94,.22,96,1),metal);disc.rotation.x=Math.PI/2;core.add(disc);const face=new T.Mesh(new T.CircleGeometry(.9,96),new T.MeshStandardMaterial({color:0xe1e5ea,metalness:.88,roughness:.3}));face.position.z=.115;core.add(face);const bezel=new T.Mesh(new T.TorusGeometry(.9,.018,10,96),edge);bezel.position.z=.12;core.add(bezel);const lightRing=new T.Mesh(new T.TorusGeometry(.76,.008,6,96),blue);lightRing.position.z=.122;core.add(lightRing);
 const mPath=new T.CurvePath();const points=[[-.32,-.2],[-.32,.23],[0,-.03],[.32,.23],[.32,-.2]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];mPath.add(new T.LineCurve3(new T.Vector3(a[0],a[1],.14),new T.Vector3(b[0],b[1],.14)));}core.add(new T.Mesh(new T.TubeGeometry(mPath,32,.018,8,false),dark));
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const cx=shadowCanvas.getContext('2d');const grad=cx.createRadialGradient(64,64,4,64,64,64);grad.addColorStop(0,'rgba(49,60,73,.22)');grad.addColorStop(.4,'rgba(49,60,73,.10)');grad.addColorStop(1,'rgba(49,60,73,0)');cx.fillStyle=grad;cx.fillRect(0,0,128,128);const shadow=new T.Mesh(new T.PlaneGeometry(7,4),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.2;scene.add(shadow);
 sceneReady=true;layoutMode();resize();target=progressAtScroll();progress=target;paint();stage.classList.toggle('is-rendered',!reduce.matches);canvas.dataset.ready='true';
 }catch(error){canvas.dataset.ready='fallback';console.warn('Metal scene unavailable; using local artwork.',error.message);stage.classList.remove('is-rendered');sceneReady=false;layoutMode();}
 finally{initializing=false;}
}
init();
