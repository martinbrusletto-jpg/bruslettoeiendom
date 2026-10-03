// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Nav scroll state
const nav = document.getElementById('nav');
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// Wall form — quick register
const wallForm = document.getElementById('wallForm');
const wallSuccess = document.getElementById('wallSuccess');

if (wallForm) {
  wallForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = wallForm.querySelector('input[name="email"]').value;
    const btn = wallForm.querySelector('button');
    btn.textContent = '...';
    btn.disabled = true;

    try {
      const res = await fetch('/varden8/api/quick-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epost: email })
      });

      if (res.ok) {
        wallForm.style.display = 'none';
        wallSuccess.classList.add('show');
        document.querySelector('.wall-note').style.display = 'none';
      } else {
        const data = await res.json();
        btn.textContent = data.error || 'Prøv igjen';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Noe gikk galt';
      btn.disabled = false;
    }
  });
}
