// Firebase 없이도 바로 배포되는 가벼운 정적 게임입니다.

const game = document.querySelector('#game'), cat = document.querySelector('#cat');
const scoreEl = document.querySelector('#score'), livesEl = document.querySelector('#lives'), missedEl = document.querySelector('#missed');
const message = document.querySelector('#message'), startButton = document.querySelector('#startButton');
const foods = ['🍎','🍓','🍕','🍔','🍩','🍪','🍙','🥕','🐟'];
const toys = ['🧸','⚽','🪀','🎾'];
let score, lives, missed, catX, running, spawnTimer, animation, soundOn = true, lastFrame;
let audioContext, musicTimer;

function setMessage(title, text, button) { message.querySelector('h2').textContent=title; message.querySelector('p').textContent=text; startButton.textContent=button; message.style.display='block'; }
function updateHud(){scoreEl.textContent=score;livesEl.textContent='♥ '.repeat(lives).trim() || '—';livesEl.setAttribute('aria-label',`생명 ${lives}개`);missedEl.textContent=`${missed} / 5`;missedEl.setAttribute('aria-label',`놓친 음식 ${missed}개`)}
function moveCat(x){catX=Math.max(8,Math.min(92,x));cat.style.left=`${catX}%`}
function ensureAudio(){ if(!audioContext) audioContext=new AudioContext(); if(audioContext.state==='suspended') audioContext.resume(); }
function tone(freq, at, duration, type='sine', volume=.055, endFreq=freq){if(!soundOn)return;ensureAudio();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),at+duration);g.gain.setValueAtTime(.001,at);g.gain.exponentialRampToValueAtTime(volume,at+.012);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g).connect(audioContext.destination);o.start(at);o.stop(at+duration+.02)}
function startMusic(){if(!soundOn||musicTimer)return;ensureAudio();const beat=()=>{const t=audioContext.currentTime;/* 작게 깔리는 '밥 시간' 리듬 */tone(130,t,.11,'triangle',.017,105);tone(196,t+.18,.08,'sine',.012,205);tone(165,t+.38,.11,'triangle',.016,135);tone(262,t+.57,.09,'sine',.012,278)};beat();musicTimer=setInterval(beat,820)}
function stopMusic(){clearInterval(musicTimer);musicTimer=null}
function meow(){if(!soundOn)return;ensureAudio();const t=audioContext.currentTime;/* 짧고 기분 좋은 '냐아옹' */tone(610,t,.16,'triangle',.10,920);tone(920,t+.13,.25,'sine',.095,480);tone(470,t+.28,.13,'triangle',.055,610)}
function growl(){if(!soundOn)return;ensureAudio();const t=audioContext.currentTime;/* 낮고 거친 하악 */tone(210,t,.08,'sawtooth',.07,105);tone(115,t+.07,.32,'sawtooth',.085,68);tone(78,t+.12,.23,'square',.035,62)}
function pop(text,x,y){const el=document.createElement('div');el.className='pop';el.textContent=text;el.style.left=`${x}%`;el.style.top=`${y}px`;game.append(el);setTimeout(()=>el.remove(),600)}
function spawn(){if(!running)return;const toy=Math.random()<.27,el=document.createElement('div');el.className=`drop ${toy?'toy':''}`;el.textContent=(toy?toys:foods)[Math.floor(Math.random()*(toy?toys:foods).length)];const x=8+Math.random()*84;el.style.left=`${x}%`;el.style.top='-45px';el.dataset.x=x;el.dataset.toy=toy;game.append(el);}
function loop(now){ if(!running)return; const dt=Math.min(40,now-(lastFrame||now));lastFrame=now;const speed=2.1+score*.045;document.querySelectorAll('.drop').forEach(el=>{let y=(parseFloat(el.dataset.y)||-45)+speed*dt/16;el.dataset.y=y;el.style.transform=`translateY(${y}px)`;const gameH=game.clientHeight;if(y>gameH-125&&y<gameH-45&&Math.abs(parseFloat(el.dataset.x)-catX)<10){const bad=el.dataset.toy==='true';el.remove();if(bad){lives--;cat.classList.remove('hurt');void cat.offsetWidth;cat.classList.add('hurt');pop('앗! -1 ♥',catX,gameH-125);growl()}else{score++;pop('+1',catX,gameH-125);meow()}updateHud();if(lives===0)end('장난감 때문에 생명이 모두 사라졌어요!');}else if(y>gameH+30){el.remove();if(el.dataset.toy==='false'){missed++;pop(`놓침 ${missed}/5`,parseFloat(el.dataset.x),gameH-100);updateHud();if(missed>=5)end('간식을 5번 놓쳐 고양이가 화났어요!');}}});animation=requestAnimationFrame(loop)}
function start(){document.querySelectorAll('.drop').forEach(e=>e.remove());score=0;lives=3;missed=0;catX=50;running=true;lastFrame=0;moveCat(catX);updateHud();message.style.display='none';clearInterval(spawnTimer);spawnTimer=setInterval(spawn,Math.max(390,850-score*8));spawn();startMusic();animation=requestAnimationFrame(loop);game.focus()}
function end(reason='다시 한 번 도전해볼까요?'){running=false;clearInterval(spawnTimer);cancelAnimationFrame(animation);stopMusic();setMessage('게임 오버!',`점수 ${score}점 · ${reason}`,'다시 하기');}
function renderLeaderboard(){const list=document.querySelector('#leaderboard');const rows=[{name:'간식 고양이',score:12},{name:'복숭냥',score:8},{name:'치즈냥',score:5}];list.innerHTML=rows.map((r,i)=>`<li><span>${i+1}. ${escapeHtml(r.name)}</span><b>${r.score}점</b></li>`).join('')}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
startButton.addEventListener('click',start);document.querySelector('#leftButton').onclick=()=>moveCat(catX-12);document.querySelector('#rightButton').onclick=()=>moveCat(catX+12);
document.addEventListener('keydown',e=>{if(!running)return;if(e.key==='ArrowLeft')moveCat(catX-7);if(e.key==='ArrowRight')moveCat(catX+7)});
game.addEventListener('pointermove',e=>{if(running&&e.buttons){const r=game.getBoundingClientRect();moveCat((e.clientX-r.left)/r.width*100)}});game.addEventListener('pointerdown',e=>{if(running){const r=game.getBoundingClientRect();moveCat((e.clientX-r.left)/r.width*100)}});
document.querySelector('#soundButton').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'♪':'×';if(soundOn&&running)startMusic();else stopMusic()};renderLeaderboard();
