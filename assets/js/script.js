/* ==========================================================================
   JRA FITNESS HUB — script.js
   Vanilla JS. Sections: loader, cursor, navbar, scroll-reveal/GSAP init, counters,
   typing effect, marquee dup, before/after slider, BMI calculator, FAQ,
   Swiper sliders, magnetic buttons, mouse parallax, back-to-top.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------- 1. LOADER --------------------------------- */
  const loader = document.getElementById('loader');
  if(loader){
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('done'), 500);
    });
    // fallback in case load event already fired
    setTimeout(() => loader.classList.add('done'), 2500);
  }

  /* ---------------------------- 2. CURSOR FOLLOWER ------------------------ */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if(dot && ring && window.matchMedia('(hover:hover)').matches){
    let mx=0,my=0,rx=0,ry=0;
    window.addEventListener('mousemove', e=>{
      mx=e.clientX; my=e.clientY;
      dot.style.left=mx+'px'; dot.style.top=my+'px';
    });
    (function loop(){
      rx += (mx-rx)*0.15; ry += (my-ry)*0.15;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,.card-hover,.g-item,.plan-card').forEach(el=>{
      el.addEventListener('mouseenter', ()=>ring.classList.add('grow'));
      el.addEventListener('mouseleave', ()=>ring.classList.remove('grow'));
    });
  }

  /* ---------------------------- 3. NAVBAR ---------------------------------- */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if(!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    document.querySelector('.back-top')?.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll); onScroll();

  const navToggle = document.querySelector('.nav-toggle');
  const navMobile = document.querySelector('.nav-mobile');
  navToggle?.addEventListener('click', ()=>{
    navToggle.classList.toggle('open');
    navMobile.classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });
  document.querySelectorAll('.nav-mobile a').forEach(a=>a.addEventListener('click', ()=>{
    navToggle.classList.remove('open'); navMobile.classList.remove('open'); document.body.classList.remove('nav-open');
  }));

  /* ---------------------------- 4. SCROLL REVEAL (self-contained) ---------- */
  // Not relying on an external library here: every [data-aos] element is
  // revealed by our own observer, with a hard timeout fallback so content
  // can never end up permanently invisible (e.g. Services / Membership /
  // Trainers) if a scroll listener or CDN misbehaves.
  const revealEls = document.querySelectorAll('[data-aos]');
  if('IntersectionObserver' in window){
    const revealObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const delay = +(entry.target.dataset.aosDelay || 0);
          setTimeout(()=> entry.target.classList.add('in-view'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(el=>revealObserver.observe(el));
  } else {
    revealEls.forEach(el=>el.classList.add('in-view'));
  }
  // Safety net: guarantee visibility no matter what.
  setTimeout(()=>{ revealEls.forEach(el=>el.classList.add('in-view')); }, 2500);

  /* ---------------------------- 5. GSAP ANIMATIONS ------------------------- */
  if(window.gsap){
    gsap.registerPlugin(ScrollTrigger);

    // Navbar blur handled via class above, add subtle hero parallax
    gsap.to('.hero-bg img', { yPercent:12, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } });
    gsap.to('.hero-athlete img', { y:-40, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } });

    // Floating athlete
    gsap.to('.hero-athlete img', { y:'+=16', duration:2.6, repeat:-1, yoyo:true, ease:'sine.inOut' });
    gsap.to('.hero-visual', { scale:1.02, duration:4, repeat:-1, yoyo:true, ease:'sine.inOut' });

    // Card fade/rotate/lift on scroll (extra flourish beyond the base reveal)
    gsap.utils.toArray('.gsap-tilt').forEach((card, i) => {
      gsap.from(card, {
        opacity:0, y:60, rotate: i%2===0 ? 3 : -3,
        duration:.9, ease:'power3.out',
        scrollTrigger:{ trigger:card, start:'top 88%' }
      });
    });

    // Section title reveal
    gsap.utils.toArray('.section-title').forEach(t=>{
      gsap.from(t, { opacity:0, y:30, duration:.9, ease:'power2.out', scrollTrigger:{ trigger:t, start:'top 90%' } });
    });
  }

  /* ---------------------------- 6. MAGNETIC BUTTONS ------------------------ */
  document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      btn.style.transform = `translate(${x*0.25}px, ${y*0.35}px)`;
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform='translate(0,0)'; });
  });

  /* ---------------------------- 7. MOUSE PARALLAX (hero visual) ----------- */
  const heroVisual = document.querySelector('.hero-visual');
  if(heroVisual){
    heroVisual.addEventListener('mousemove', e=>{
      const r = heroVisual.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - 0.5;
      const py = (e.clientY - r.top)/r.height - 0.5;
      heroVisual.querySelectorAll('.hero-athlete img').forEach(img=>{
        img.style.transform = `translate(${px*14}px, ${py*10}px)`;
      });
      const ringEl = heroVisual.querySelector('.hero-ring');
      if(ringEl) ringEl.style.transform = `translate(-50%,-55%) translate(${px*20}px, ${py*14}px)`;
    });
  }

  /* ---------------------------- 8. TYPING EFFECT --------------------------- */
  const typeEl = document.querySelector('.typing-effect');
  if(typeEl){
    const words = JSON.parse(typeEl.dataset.words || '["TRANSFORM"]');
    let wi=0, ci=0, deleting=false;
    (function type(){
      const word = words[wi];
      ci += deleting ? -1 : 1;
      typeEl.textContent = word.slice(0, ci);
      let delay = deleting ? 55 : 110;
      if(!deleting && ci===word.length){ delay=1600; deleting=true; }
      else if(deleting && ci===0){ deleting=false; wi=(wi+1)%words.length; delay=400; }
      setTimeout(type, delay);
    })();
  }

  /* ---------------------------- 9. COUNTER ANIMATION ----------------------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1600; const start = performance.now();
    const step = (t) => {
      const p = Math.min((t-start)/dur, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.floor(eased*target).toLocaleString() + suffix;
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ runCounter(entry.target); counterObserver.unobserve(entry.target); }
    });
  }, { threshold:.4 });
  counters.forEach(c=>counterObserver.observe(c));

  /* ---------------------------- 10. MARQUEE DUP (brands) ------------------- */
  document.querySelectorAll('.brands-track').forEach(track=>{
    const set = track.querySelector('.brands-set');
    if(set) track.appendChild(set.cloneNode(true));
  });

  /* ---------------------------- 11. BEFORE/AFTER SLIDER -------------------- */
  document.querySelectorAll('.ba-wrap').forEach(wrap=>{
    const handle = wrap.querySelector('.ba-handle');
    const after = wrap.querySelector('.after-img');
    let dragging=false;
    const move = (clientX) => {
      const r = wrap.getBoundingClientRect();
      let pct = ((clientX - r.left)/r.width)*100;
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
      handle.style.left = pct+'%';
    };
    handle?.addEventListener('mousedown', ()=>dragging=true);
    window.addEventListener('mouseup', ()=>dragging=false);
    window.addEventListener('mousemove', e=>{ if(dragging) move(e.clientX); });
    handle?.addEventListener('touchstart', ()=>dragging=true);
    window.addEventListener('touchend', ()=>dragging=false);
    wrap.addEventListener('touchmove', e=>{ if(dragging) move(e.touches[0].clientX); });
    wrap.addEventListener('click', e=>{ if(e.target.closest('.ba-handle')) return; move(e.clientX); });
  });

  /* ---------------------------- 12. FAQ ACCORDION -------------------------- */
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q?.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item').forEach(i=>{
        i.classList.remove('open'); i.querySelector('.faq-a').style.maxHeight=null;
      });
      if(!isOpen){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight+'px'; }
    });
  });

  /* ---------------------------- 13. BMI CALCULATOR ------------------------- */
  const bmiForm = document.getElementById('bmiForm');
  if(bmiForm){
    const heightR = document.getElementById('bmiHeight');
    const weightR = document.getElementById('bmiWeight');
    const heightOut = document.getElementById('bmiHeightVal');
    const weightOut = document.getElementById('bmiWeightVal');
    const scoreEl = document.getElementById('bmiScore');
    const catEl = document.getElementById('bmiCat');
    const arrow = document.getElementById('bmiArrow');

    const categorize = (b) => {
      if(b < 18.5) return {label:'Underweight', color:'#4fc3f7', pos:10};
      if(b < 25) return {label:'Healthy', color:'#4caf50', pos:38};
      if(b < 30) return {label:'Overweight', color:'#ffb300', pos:68};
      return {label:'Obese', color:'#ff5252', pos:92};
    };

    const calc = () => {
      const h = (+heightR.value)/100;
      const w = +weightR.value;
      heightOut.textContent = heightR.value+' cm';
      weightOut.textContent = weightR.value+' kg';
      const bmi = w/(h*h);
      scoreEl.textContent = bmi.toFixed(1);
      const c = categorize(bmi);
      catEl.textContent = c.label; catEl.style.color = c.color;
      if(arrow) arrow.style.left = c.pos+'%';
    };
    [heightR, weightR].forEach(el=>el.addEventListener('input', calc));
    calc();
  }

  /* ---------------------------- 14. SWIPER SLIDERS ------------------------- */
  if(window.Swiper){
    if(document.querySelector('.transformSwiper')){
      new Swiper('.transformSwiper', {
        slidesPerView:1, spaceBetween:24, loop:true,
        autoplay:{ delay:4500, disableOnInteraction:false },
        // Mobile = 1 column, Tablet = 2 columns, Desktop keeps its original 3-up feel
        breakpoints:{ 768:{ slidesPerView:2, spaceBetween:24 }, 1200:{ slidesPerView:3, spaceBetween:26 } },
        navigation:{ nextEl:'.transform-next', prevEl:'.transform-prev' },
      });
    }
    if(document.querySelector('.reviewSwiper')){
      new Swiper('.reviewSwiper', {
        slidesPerView:1, spaceBetween:24, loop:true,
        autoplay:{ delay:4200, disableOnInteraction:false },
        pagination:{ el:'.review-pagination', clickable:true },
        breakpoints:{ 768:{ slidesPerView:2 }, 1200:{ slidesPerView:3 } },
      });
    }
    if(document.querySelector('.trainerSwiper')){
      new Swiper('.trainerSwiper', {
        slidesPerView:1.2, spaceBetween:20, loop:true,
        autoplay:{ delay:3800, disableOnInteraction:false },
        breakpoints:{ 640:{ slidesPerView:2.2 }, 992:{ slidesPerView:4 } },
      });
    }
  }

  /* ---------------------------- 15. CONTACT FORM (demo submit) ------------- */
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', e=>{
      e.preventDefault();
      const btn = contactForm.querySelector('button[type=submit]');
      const original = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      setTimeout(()=>{
        btn.innerHTML = 'Message Sent ✓';
        contactForm.reset();
        setTimeout(()=> btn.innerHTML = original, 2200);
      }, 1000);
    });
  }

  /* ---------------------------- 16. BACK TO TOP ----------------------------- */
  document.querySelector('.back-top')?.addEventListener('click', ()=>{
    window.scrollTo({ top:0, behavior:'smooth' });
  });

  /* ---------------------------- 17. FLOATING PARTICLES (hero) -------------- */
  const pWrap = document.querySelector('.hero-particles');
  if(pWrap){
    for(let i=0;i<18;i++){
      const s = document.createElement('span');
      s.style.left = Math.random()*100+'%';
      s.style.top = Math.random()*100+'%';
      s.style.animationDelay = (Math.random()*5)+'s';
      s.style.animationDuration = (4+Math.random()*4)+'s';
      s.style.opacity = (0.3+Math.random()*0.6).toFixed(2);
      pWrap.appendChild(s);
    }
  }

});
