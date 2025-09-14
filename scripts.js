/* script.js
   Shared JavaScript for the Om ❤️ Megha site.
   - Background particle variations
   - Typewriter runner
   - Simple fireworks canvas for celebration
   - Small helpers
*/

/* ---------- Configuration ---------- */
// Edit this if you want to show a 'days since we met' counter
// Use format 'YYYY-MM-DD' or leave as null to disable
const meetDateStr = null; // e.g. '2025-09-10'

/* ---------- Utilities ---------- */
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return Array.from(document.querySelectorAll(sel))}

/* ---------- Typewriter ---------- */
function runTypewriter(lines, speed=50, onDone){
  const el = qs('#typeText');
  if(!el) return;
  el.textContent = '';
  let li=0, ch=0;
  function step(){
    if(li >= lines.length){
      if(onDone) onDone();
      return;
    }
    const line = lines[li];
    if(ch <= line.length){
      el.textContent = line.slice(0,ch);
      ch++;
      setTimeout(step, speed);
    } else {
      // pause then next line
      li++; ch=0;
      setTimeout(step, 700);
    }
  }
  step();
}

/* ---------- Background animations ---------- */
let bgCtx, bgCanvas, bgAnim = null;
function startBackground(mode='stars'){
  // mode: 'stars', 'soft', 'hearts'
  bgCanvas = document.getElementById('bgCanvas');
  if(!bgCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  function resize(){
    bgCanvas.width = innerWidth * dpr;
    bgCanvas.height = innerHeight * dpr;
    bgCanvas.style.width = innerWidth + 'px';
    bgCanvas.style.height = innerHeight + 'px';
    if(bgCtx) bgCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  bgCtx = bgCanvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);

  let particles = [];
  function initParticles(){
    particles = [];
    const count = Math.round((innerWidth+innerHeight)/20);
    for(let i=0;i<count;i++){
      particles.push(createParticle(mode));
    }
  }
  function createParticle(m){
    const x = Math.random()*innerWidth, y = Math.random()*innerHeight;
    const vx = (Math.random()-0.5)*(m==='stars'?0.2:0.6);
    const vy = (Math.random()-0.5)*(m==='stars'?0.2:0.6);
    const r = Math.random()* (m==='stars'?1.6:8) + (m==='stars'?0.4:2);
    return {x,y,vx,vy,r,alpha: Math.random()*0.9+0.1};
  }
  function draw(){
    bgCtx.clearRect(0,0,innerWidth,innerHeight);
    if(mode === 'stars'){
      for(const p of particles){
        bgCtx.beginPath();
        bgCtx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        bgCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
        bgCtx.fill();
        p.x += p.vx; p.y += p.vy;
        if(p.x < -10) p.x = innerWidth+10;
        if(p.x > innerWidth+10) p.x = -10;
        if(p.y < -10) p.y = innerHeight+10;
        if(p.y > innerHeight+10) p.y = -10;
      }
    } else if(mode === 'soft'){
      // soft floating circles
      for(const p of particles){
        const g = bgCtx.createRadialGradient(p.x,p.y,p.r*0.1,p.x,p.y,p.r*6);
        g.addColorStop(0, `rgba(255,255,255,${p.alpha*0.08})`);
        g.addColorStop(1, `rgba(255,255,255,0)`);
        bgCtx.fillStyle = g;
        bgCtx.fillRect(p.x-p.r*6,p.y-p.r*6,p.r*12,p.r*12);
        p.x += p.vx; p.y += p.vy;
        if(p.x < -50) p.x = innerWidth+50;
        if(p.x > innerWidth+50) p.x = -50;
        if(p.y < -50) p.y = innerHeight+50;
        if(p.y > innerHeight+50) p.y = -50;
      }
    } else if(mode === 'hearts'){
      for(const p of particles){
        drawHeart(bgCtx,p.x,p.y,p.r, p.alpha);
        p.y -= 0.3;
        p.x += Math.sin(p.y*0.01 + p.r)*0.2;
        if(p.y < -50) p.y = innerHeight+50;
      }
    }
  }
  function drawHeart(ctx,x,y,size, alpha){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(size/20,size/20);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(0,-3, -6,-12, -12,-12);
    ctx.bezierCurveTo(-20,-12, -20,2, -20,2);
    ctx.bezierCurveTo(-20,10, -12,18, 0,30);
    ctx.bezierCurveTo(12,18, 20,10, 20,2);
    ctx.bezierCurveTo(20,2, 20,-12, 12,-12);
    ctx.bezierCurveTo(6,-12, 0,-3, 0,0);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,92,138,${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  initParticles();
  bgAnim = setInterval(draw, 1000/30);
}

/* ---------- Fireworks ---------- */
function startFireworks(canvasId){
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);

  let particles = [];

  function explode(x,y){
    const count = 30 + Math.round(Math.random()*40);
    for(let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = Math.random()*4 + 1.2;
      particles.push({
        x, y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        life: 80 + Math.random()*30,
        age: 0,
        size: Math.random()*2+1,
        hue: Math.floor( Math.random()*360 )
      });
    }
  }

  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.age++;
      p.vy += 0.03; // gravity-ish
      p.x += p.vx; p.y += p.vy;
      const alpha = Math.max(0, 1 - p.age/p.life);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fill();
      if(p.age > p.life) particles.splice(i,1);
    }
    requestAnimationFrame(loop);
  }
  loop();

  // random bursts
  const interval = setInterval(()=> {
    explode(100 + Math.random()*(canvas.width-200), 100 + Math.random()*(canvas.height/2));
  }, 600);

  // also explode on click/tap
  canvas.addEventListener('click', e => {
    explode(e.clientX, e.clientY);
  });
}

/* ---------- On load helpers ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // If meetDate configured, show in some elements with class 'met-since' if present
  if(meetDateStr){
    try{
      const md = new Date(meetDateStr + 'T00:00:00');
      if(!isNaN(md.getTime())){
        const days = Math.floor((Date.now() - md.getTime())/(1000*60*60*24));
        qsa('.met-since').forEach(el => el.textContent = `${days} day(s)`);
      }
    }catch(e){}
  }
});