const WHATSAPP_NUMBER = '5511977160644';
const DEFAULT_MESSAGE = 'Olá, quero fazer um diagnóstico comercial com o FlowDesk.';

function whatsappUrl(message = DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  const plan = link.dataset.plan;
  const message = plan
    ? `Olá, quero entender melhor o plano ${plan} do FlowDesk e fazer um diagnóstico comercial.`
    : DEFAULT_MESSAGE;
  link.href = whatsappUrl(message);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});

const mobileMenu = document.getElementById('mobileMenu');
const mobileNav = document.getElementById('mobileNav');
if (mobileMenu && mobileNav) {
  mobileMenu.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mobileNav.classList.remove('open')));
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelectorAll('[data-counter]').forEach((el) => {
  const target = Number(el.dataset.counter);
  let started = false;
  const counterObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return;
    started = true;
    const start = performance.now();
    const duration = 850;
    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    counterObserver.disconnect();
  }, { threshold: .6 });
  counterObserver.observe(el);
});

document.querySelectorAll('.faq-list details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (detail.open) {
      document.querySelectorAll('.faq-list details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    }
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
