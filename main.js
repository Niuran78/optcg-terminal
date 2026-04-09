/* OPTCG Market Terminal — main.js */

// =============================================
// 1. INTERSECTION OBSERVER — FADE-IN ANIMATIONS
// =============================================
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
      observer.unobserve(el.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

// Trigger hero elements immediately
document.querySelectorAll('.hero .fade-in, .terminal-mockup-wrap.fade-in').forEach(el => {
  setTimeout(() => el.classList.add('visible'), 80);
});

// =============================================
// 2. NAV SCROLL BEHAVIOR
// =============================================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// =============================================
// 3. ANIMATED STAT COUNTERS
// =============================================
function animateCount(el, target, prefix = '', suffix = '') {
  const duration = 1600;
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = prefix + current.toLocaleString('en-US');
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + target.toLocaleString('en-US');
  }
  requestAnimationFrame(update);
}

const statNums = document.querySelectorAll('[data-count]');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const prefix = el.dataset.prefix || '';
      animateCount(el, target, prefix);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statObserver.observe(el));

// =============================================
// 4. WAITLIST FORM — WEB3FORMS SUBMISSION
// =============================================
const form = document.getElementById('waitlistForm');
const successMsg = document.getElementById('waitlistSuccess');
const spotsLeft = document.getElementById('spotsLeft');
const counterFill = document.getElementById('counterFill');

let currentSpots = 50;

function showSuccess() {
  form.hidden = true;
  successMsg.hidden = false;

  // Update counter
  currentSpots = Math.max(0, currentSpots - 1);
  spotsLeft.textContent = currentSpots;
  const pct = ((50 - currentSpots) / 50) * 100;
  counterFill.style.width = pct + '%';

  // Smooth success reveal
  successMsg.style.opacity = '0';
  successMsg.style.transform = 'translateY(12px)';
  successMsg.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  requestAnimationFrame(() => {
    successMsg.style.opacity = '1';
    successMsg.style.transform = 'translateY(0)';
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = form.querySelector('button[type=submit]');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');

  // Show loading state
  btnText.hidden = true;
  btnLoading.hidden = false;
  btn.disabled = true;

  try {
    const formData = new FormData(form);
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (data.success) {
      showSuccess();
    } else {
      // Fallback: still show success to not block the user
      console.warn('Web3Forms submission issue:', data.message);
      showSuccess();
    }
  } catch (err) {
    // Network error fallback — still acknowledge the user
    console.warn('Form submission error:', err);
    showSuccess();
  } finally {
    btnText.hidden = false;
    btnLoading.hidden = true;
    btn.disabled = false;
  }
});

// =============================================
// 5. COUNTER BAR ANIMATION ON VIEW
// =============================================
const counterEl = document.querySelector('.waitlist-counter');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Simulate 10 people already signed up
      const pct = (10 / 50) * 100;
      counterFill.style.transition = 'width 1.2s cubic-bezier(0.16,1,0.3,1)';
      counterFill.style.width = pct + '%';
      currentSpots = 40;
      spotsLeft.textContent = currentSpots;
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
if (counterEl) counterObserver.observe(counterEl);

// =============================================
// 6. LIVE DATA TICKER — SUBTLE PRICE FLICKER
// =============================================
const prices = document.querySelectorAll('.t-price');
setInterval(() => {
  prices.forEach(el => {
    if (Math.random() > 0.85) {
      el.style.transition = 'color 0.2s ease';
      el.style.color = 'var(--color-accent)';
      setTimeout(() => {
        el.style.color = '';
      }, 300);
    }
  });
}, 3000);

// =============================================
// 7. SMOOTH ANCHOR SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
