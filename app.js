// Firebase를 연결하려면 README의 설정값을 아래 firebaseConfig에 넣으세요.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = { /* apiKey: '', authDomain: '', projectId: '', ... */ };
let db = null;
try { if (firebaseConfig.apiKey) db = getFirestore(initializeApp(firebaseConfig)); } catch { /* 로컬 모드 */ }

const game = document.querySelector('#game'), cat = document.querySelector('#cat');
const scoreEl = document.querySelector('#score'), livesEl = document.querySelector('#lives');
const message = document.querySelector('#message'), startButton = document.querySelector('#startButton');
const foods = ['🍎','🍓','🍕','🍔','🍩','🍪','🍙','🥕','🐟'];
const toys = ['🧸','⚽','🪀','🎾'];
let score, lives, catX, running, spawnTimer, animation, soundOn = true, lastFrame;
let audioContext, musicTimer;

function setMessage(title, text, button) { message.querySelector('h2').textContent=title; message.querySelector('p').textContent=text; startButton.textContent=button; message.style.display='block'; }
function updateHud(){scoreEl.textContent=score;livesEl.textContent='♥ '.repeat(lives).trim() || '—';livesEl.setAttribute('aria-label',`생명 ${lives}개`)}
function moveCat(x){catX=Math.max(8,Math.min(92,x));cat.style.left=`${catX}%`}
function ensureAudio(){ if(!audioContext) audioContext=new AudioContext(); if(audioContext.state==='suspended') audioContext.resume(); }
function tone(freq, at, duration, type='sine', volume=.055){if(!soundOn)return;ensureAudio();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(volume,at);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g).connect(audioContext.destination);o.start(at);o.stop(at+duration)}
function startMusic(){if(!soundOn||musicTimer)return;ensureAudio();const beat=()=>{const t=audioContext.currentTime;tone(145,t,.15,'triangle',.045);tone(215,t+.21,.11,'triangle',.035);tone(310,t+.45,.08,'sine',.024)};beat();musicTimer=setInterval(beat,760)}
function stopMusic(){clearInterval(musicTimer);musicTimer=null}
function meow(){if(!soundOn)return;ensureAudio();const t=audioContext.currentTime;tone(720,t,.1,'sine',.075);tone(520,t+.1,.18,'sine',.07)}
function growl(){if(!soundOn)return;ensureAudio();const t=audioContext.currentTime;tone(105,t,.28,'sawtooth',.06);tone(82,t+.08,.25,'sawtooth',.05)}
function pop(text,x,y){const el=document.createElement('div');el.className='pop';el.textContent=text;el.style.left=`${x}%`;el.style.top=`${y}px`;game.append(el);setTimeout(()=>el.remove(),600)}
function spawn(){if(!running)return;const toy=Math.random()<.27,el=document.createElement('div');el.className=`drop ${toy?'toy':''}`;el.textContent=(toy?toys:foods)[Math.floor(Math.random()*(toy?toys:foods).length)];const x=8+Math.random()*84;el.style.left=`${x}%`;el.style.top='-45px';el.dataset.x=x;el.dataset.toy=toy;game.append(el);}
function loop(now){ if(!running)return; const dt=Math.min(40,now-(lastFrame||now));lastFrame=now;const speed=2.1+score*.045;document.querySelectorAll('.drop').forEach(el=>{let y=(parseFloat(el.dataset.y)||-45)+speed*dt/16;el.dataset.y=y;el.style.transform=`translateY(${y}px)`;const gameH=game.clientHeight;if(y>gameH-125&&y<gameH-45&&Math.abs(parseFloat(el.dataset.x)-catX)<10){const bad=el.dataset.toy==='true';el.remove();if(bad){lives--;cat.classList.remove('hurt');void cat.offsetWidth;cat.classList.add('hurt');pop('앗! -1 ♥',catX,gameH-125);growl()}else{score++;pop('+1',catX,gameH-125);meow()}updateHud();if(lives===0) end();}else if(y>gameH+30)el.remove();});animation=requestAnimationFrame(loop)}
function start(){document.querySelectorAll('.drop').forEach(e=>e.remove());score=0;lives=3;catX=50;running=true;lastFrame=0;moveCat(catX);updateHud();message.style.display='none';clearInterval(spawnTimer);spawnTimer=setInterval(spawn,Math.max(390,850-score*8));spawn();startMusic();animation=requestAnimationFrame(loop);game.focus()}
function end(){running=false;clearInterval(spawnTimer);cancelAnimationFrame(animation);stopMusic();setMessage('게임 오버!','점수 '+score+'점 · 다시 한 번 도전해볼까요?','다시 하기');if(score>0)saveScore(score);}
async function saveScore(value){if(!db){renderLeaderboard();return}const name=(prompt('최고 점수판에 표시할 이름을 입력하세요.','냥집사')||'냥집사').slice(0,12);try{await addDoc(collection(db,'scores'),{name,score:value,createdAt:serverTimestamp()});renderLeaderboard()}catch{renderLeaderboard()}}
async function renderLeaderboard(){const list=document.querySelector('#leaderboard');let rows=[];try{if(db){const snap=await getDocs(query(collection(db,'scores'),orderBy('score','desc'),limit(5)));rows=snap.docs.map(d=>d.data())}}catch{}if(!rows.length)rows=[{name:'간식 고양이',score:12},{name:'복숭냥',score:8},{name:'치즈냥',score:5}];list.innerHTML=rows.map((r,i)=>`<li><span>${i+1}. ${escapeHtml(r.name)}</span><b>${r.score}점</b></li>`).join('')}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
startButton.addEventListener('click',start);document.querySelector('#leftButton').onclick=()=>moveCat(catX-12);document.querySelector('#rightButton').onclick=()=>moveCat(catX+12);
document.addEventListener('keydown',e=>{if(!running)return;if(e.key==='ArrowLeft')moveCat(catX-7);if(e.key==='ArrowRight')moveCat(catX+7)});
game.addEventListener('pointermove',e=>{if(running&&e.buttons){const r=game.getBoundingClientRect();moveCat((e.clientX-r.left)/r.width*100)}});game.addEventListener('pointerdown',e=>{if(running){const r=game.getBoundingClientRect();moveCat((e.clientX-r.left)/r.width*100)}});
document.querySelector('#soundButton').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'♪':'×';if(soundOn&&running)startMusic();else stopMusic()};renderLeaderboard();
