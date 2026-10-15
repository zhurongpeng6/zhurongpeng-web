const ideas=[
['life','给今天拍一张封面','像为一本杂志拍封面一样，选一个能代表今天的画面：窗边的光、桌上的杯子，或回家的路。拍下来，再为今天起一个名字。','10 分钟'],
['life','走一条没走过的小路','在熟悉的地方，选一条安全、没走过的路线，慢慢走十分钟。留意一个以前没注意到的细节，把它记在手机里。','15 分钟'],
['life','给桌面留一块空白','挑出桌面上的三件物品，放回它们该在的位置。给自己腾出一小块空白，摆上最喜欢的一件东西。','5 分钟'],
['life','给未来的自己留张便条','写一句你此刻最想听到的话，夹进书里或放进口袋。让某个未来的你，意外收到今天的善意。','5 分钟'],
['life','认真尝一口日常','下次喝水或吃点心时，暂时放下手机。观察温度、香气和口感，用三个具体的词描述这一次小小的体验。','5 分钟'],
['life','为生活换一个位置','移动一件小物品，换一首起床时听的歌，或者换个位置读书。看看一个微小变化，会不会让熟悉的日常重新鲜活。','10 分钟'],
['life','收集今天的三个好瞬间','不需要大事：一阵舒服的风、一顿合口味的饭、顺利完成的小任务。记下三个具体瞬间，为今天留一点温柔的证据。','5 分钟'],
['life','写一张感谢卡','想起一个曾帮过你的人，写三句话：发生了什么、你的感受、你想对他说什么。是否送出，由你决定。','10 分钟'],
['create','给一个普通物品写广告','选一件手边的普通物品，把它当成世界上最了不起的新发明。给它取一个名字，再写一句让人想笑的广告语。','10 分钟'],
['create','用三个词，写一个微型故事','把“雨伞、月亮、迟到”放进一个不超过 100 字的故事。可以荒诞，也可以温柔，只要写下第一句就算开始。','15 分钟'],
['create','画一只不太像样的猫','拿一张纸，用一条不断开的线画一只猫。不许擦掉。最后给它起个名字，并写下它最奇怪的爱好。','5 分钟'],
['create','设计一家不存在的小店','如果你可以开一家只卖“感觉”的店，会卖什么？画一个招牌，列出三件商品和它们的价格。比如：一小时不着急。','15 分钟'],
['create','为你的房间设计声音','选三种能安全发出声音的小物品，用轻敲、翻动或摇晃组合成一段十秒的节奏。用手机录下来，为它命名。','10 分钟'],
['create','把一句话变成一首小诗','从今天说过的一句话里挑出五个词，把它们分成三行。再加入一个颜色或一个季节，看看它会变成什么。','10 分钟'],
['create','给陌生星球画张地图','画五个随意的形状，把它们变成山、海、城镇或未知地带。标出一个“绝对值得去”的地点，并写出理由。','20 分钟'],
['create','给一张旧照片写新结局','翻到一张自己拍的照片，假设它是电影的最后一帧。用三句话写出这部电影的故事，再给电影起一个名字。','10 分钟'],
['observe','寻找身边的五种绿色','从窗口或在附近找出五种不一样的绿色。不要只写“深绿、浅绿”，试着给每一种起一个专属名字。','10 分钟'],
['observe','把熟悉的地方当成初次到访','像游客一样观察你的房间或校园。记录三个你会介绍给陌生人的细节，试着解释它们为什么值得被看见。','15 分钟'],
['observe','听一场三分钟的小音乐会','找个舒适的位置，安静听三分钟。把听见的声音按由近到远写下来，注意平时被你忽略的背景声。','5 分钟'],
['observe','寻找一个自然形成的图案','看看树影、墙面或杯子上的水迹。找出一个像动物或人物的图案，画下轮廓，并为它编一句台词。','10 分钟'],
['observe','站在杯子的角度看世界','假设桌上的杯子会写日记，它今天见到了什么？写下三句话，把你熟悉的一天交给另一双眼睛。','10 分钟'],
['observe','注意一次光的移动','观察阳光或灯光落在物体上的形状。隔五分钟再看一次，写下变化。没有阳光时，也可以观察一盏灯投下的影子。','10 分钟'],
['observe','给一个习惯问三个为什么','选一个很小的习惯，比如总坐同一个位置。温和地追问三个“为什么”，只记录答案，不急着评价或改变。','5 分钟'],
['observe','发现藏在日常里的圆','找五个圆形物品或图案，挑两个平常不会放在一起的，想象它们之间有什么秘密联系。','10 分钟']
].map((x,i)=>({id:i,category:x[0],title:x[1],text:x[2],time:x[3]}));
const labels={life:'生活小挑战',create:'创作灵感',observe:'换个角度'};
const $=s=>document.querySelector(s);let category='all',current=null,busy=false,timer;let state={saved:[],done:[]};
try{const v=JSON.parse(localStorage.getItem('daily-spark-v1'));if(v&&Array.isArray(v.saved)&&Array.isArray(v.done))state={saved:v.saved.filter(x=>Number.isInteger(x)&&ideas[x]),done:v.done.filter(x=>Number.isInteger(x)&&ideas[x])};}catch{}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),2800)}
function persist(){try{localStorage.setItem('daily-spark-v1',JSON.stringify(state));return true}catch{toast('浏览器未允许保存，记录暂存于本次打开期间');return false}}
function sync(){ $('#savedCount').textContent=state.saved.length;if(current){$('#save').textContent=state.saved.includes(current.id)?'♥ 已收藏':'♡ 收藏这份灵感';$('#save').setAttribute('aria-pressed',state.saved.includes(current.id));$('#complete').textContent=state.done.includes(current.id)?'✓ 已完成':'✓ 我完成了';$('#complete').classList.toggle('selected',state.done.includes(current.id));$('#complete').setAttribute('aria-pressed',state.done.includes(current.id));}}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('.filter').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});}));
async function draw(){if(busy)return;busy=true;$('#draw').disabled=true;$('#box').disabled=true;$('#draw').firstChild.textContent='正在拆开惊喜… ';$('#box').classList.add('opening');const pool=ideas.filter(x=>(category==='all'||x.category===category)&&x.id!==current?.id);await new Promise(r=>setTimeout(r,550));current=pool[Math.floor(Math.random()*pool.length)];$('#resultMeta').textContent=labels[current.category]+' / '+current.time+' / NO. '+String(current.id+1).padStart(2,'0');$('#resultTitle').textContent=current.title;$('#resultText').textContent=current.text;$('#result').hidden=false;sync();$('#box').classList.remove('opening');$('#draw').disabled=false;$('#box').disabled=false;$('#draw').firstChild.textContent='再开启一份灵感 ';busy=false;$('#result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}
$('#draw').onclick=draw;$('#box').onclick=draw;$('#again').onclick=draw;
$('#save').onclick=()=>{if(!current)return;const exists=state.saved.includes(current.id);state.saved=exists?state.saved.filter(x=>x!==current.id):[current.id,...state.saved];const ok=persist();sync();if(ok)toast(exists?'已从灵感架移除':'已放进你的灵感架，随时回来看看');};
$('#complete').onclick=()=>{if(!current)return;const exists=state.done.includes(current.id);state.done=exists?state.done.filter(x=>x!==current.id):[...state.done,current.id];const ok=persist();sync();if(ok)toast(exists?'已取消完成标记':'今天又多了一个小小的开始，做得好！');};
function renderShelf(){const list=$('#savedList');list.replaceChildren();if(!state.saved.length){const p=document.createElement('p');p.className='empty';p.textContent='灵感架还是空的。打开一个盲盒，把喜欢的点子收藏在这里。';list.append(p);return}state.saved.forEach(id=>{const v=ideas[id];const item=document.createElement('article');item.className='saved-item';const title=document.createElement('h3');title.textContent=v.title;const meta=document.createElement('small');meta.textContent=labels[v.category]+' · '+v.time+(state.done.includes(id)?' · 已完成':'');const text=document.createElement('p');text.textContent=v.text;const done=document.createElement('button');done.textContent=state.done.includes(id)?'取消完成':'标记完成';done.onclick=()=>{state.done=state.done.includes(id)?state.done.filter(x=>x!==id):[...state.done,id];persist();sync();renderShelf()};const remove=document.createElement('button');remove.textContent='移出灵感架';remove.onclick=()=>{state.saved=state.saved.filter(x=>x!==id);persist();sync();renderShelf()};item.append(title,meta,text,done,remove);list.append(item)});}
$('#shelfOpen').onclick=()=>{renderShelf();$('#shelf').showModal()};$('#shelfClose').onclick=()=>$('#shelf').close();$('#shelf').onclick=e=>{if(e.target===$('#shelf')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};sync();
