/* ========= Helpers ========= */
const $ = (q, sc = document) => sc.querySelector(q);
const $$ = (q, sc = document) => [...sc.querySelectorAll(q)];

/* ========= Mobile Nav ========= */
const burger = $('.hamburger');
const menu = $('#navMenu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('show');
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
});

/* ========= Anthem Controls ========= */
const anthem = $('#anthem');
const playBtn = $('#playAnthem');
let anthemPlaying = false;

function toggleAnthem(){
  if(!anthem) return;
  if(!anthemPlaying){
    anthem.play().then(()=> {
      anthemPlaying = true;
      playBtn.textContent = '⏸ Pause Anthem';
    }).catch(()=> {
      // Autoplay blocked: prompt user via popup
      openPopup("Tap Play to start the anthem.");
    });
  }else{
    anthem.pause();
    anthemPlaying = false;
    playBtn.textContent = '▶ Play Anthem';
  }
}
playBtn.addEventListener('click', toggleAnthem);

/* ========= Countdown to next 15 Aug ========= */
function nextIndependenceDay() {
  const now = new Date();
  const year = now.getMonth() > 7 || (now.getMonth() === 7 && now.getDate() > 15) ? now.getFullYear()+1 : now.getFullYear();
  // Month index: 7 = August; set to midnight IST (UTC+5:30)
  // Create date in local time; visual countdown is fine even if not TZ-perfect
  return new Date(year, 7, 15, 0, 0, 0, 0);
}

const dEl = $('#d'), hEl = $('#h'), mEl = $('#m'), sEl = $('#s');
function updateCountdown(){
  const end = nextIndependenceDay();
  const now = new Date();
  let diff = end - now;
  if(diff < 0) diff = 0;
  const sec = Math.floor(diff/1000)%60;
  const min = Math.floor(diff/1000/60)%60;
  const hr  = Math.floor(diff/1000/60/60)%24;
  const day = Math.floor(diff/1000/60/60/24);
  dEl.textContent = String(day).padStart(2,'0');
  hEl.textContent = String(hr).padStart(2,'0');
  mEl.textContent = String(min).padStart(2,'0');
  sEl.textContent = String(sec).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ========= Fireworks ========= */
const fwCanvas = $('#fireworks');
const ctx = fwCanvas.getContext('2d');
let particles = [];
let rafId = null;

function resizeCanvas(){
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function rand(min, max){ return Math.random()*(max-min)+min; }

function createBurst(x, y, count=80){
  for(let i=0;i<count;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = rand(1.5, 4.2);
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      life: rand(50, 90),
      alpha: 1,
      gravity: 0.025 + Math.random()*0.02,
      size: rand(1, 2.8)
    });
  }
}

function step(){
  ctx.clearRect(0,0,fwCanvas.width, fwCanvas.height);
  particles.forEach(p=>{
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.life--;
    p.alpha = Math.max(0, p.life/90);
    ctx.globalAlpha = p.alpha;
    // random tricolor sparkle
    const pick = Math.random();
    ctx.fillStyle = pick < .34 ? '#FF9933' : (pick < .67 ? '#138808' : '#0a5fa1');
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
  });
  particles = particles.filter(p=>p.life>0 && p.alpha>0.02);
  if(particles.length>0) rafId = requestAnimationFrame(step);
  else {
    fwCanvas.style.opacity = '0';
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function fireworksBurst(centerX, centerY){
  createBurst(centerX, centerY, 120);
  createBurst(centerX+rand(-40,40), centerY+rand(-40,40), 90);
  createBurst(centerX+rand(-60,60), centerY+rand(-60,60), 90);
  if(!rafId){
    fwCanvas.style.opacity = '1';
    rafId = requestAnimationFrame(step);
  }
}

/* Button to celebrate */
$('#celebrateBtn').addEventListener('click', ()=>{
  fireworksBurst(window.innerWidth/2, window.innerHeight/3);
  openPopup("🎉Happy Independence Day! Jai Hind!");
});

/* ========= Wishes ========= */
const form = $('#wishForm');
const wishList = $('#wishList');

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = $('#name').value.trim();
  const msg = $('#message').value.trim();
  if(!name || !msg) return;
  const li = document.createElement('li');
  li.textContent = ` ${name}: ${msg}`;
  wishList.prepend(li);
  form.reset();
  // confetti-like mini burst
  fireworksBurst(rand(50, window.innerWidth-50), rand(80, window.innerHeight-100));
});

/* ========= Popup ========= */
const popup = $('#popup');
const closePopupBtn = $('#closePopup');
function openPopup(text){
  popup.querySelector('p').textContent = text;
  popup.hidden = false;
}
closePopupBtn.addEventListener('click', ()=> popup.hidden = true);
popup.addEventListener('click', (e)=> { if(e.target === popup) popup.hidden = true; });

/* ========= Accessibility niceties ========= */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && !popup.hidden) popup.hidden = true;
});

/* ========= Bonus: celebrate on load if it is Aug 15 ========= */
(function celebrateIfToday(){
  const n = new Date();
  if(n.getMonth() === 7 && n.getDate() === 15){
    setTimeout(()=>{
      fireworksBurst(window.innerWidth/2, window.innerHeight/3);
      openPopup("Wishing you a very Happy Independence Day!");
    }, 600);
  }
})();
