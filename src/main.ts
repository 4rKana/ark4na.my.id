import './style.css';

const textToType: string = '> SYSTEM INITIALIZED... INFORMATICS & NETWORK INFRASTRUCTURE SPECIALIST.';
let charIndex: number = 0;

function runTypeWriter(): void {
  const typeWriterElement = document.getElementById('typewriter');
  if (!typeWriterElement) return;

  if (charIndex < textToType.length) {
    typeWriterElement.innerHTML += textToType.charAt(charIndex);
    charIndex++;
    setTimeout(runTypeWriter, 50);
  } else {
    setInterval(() => {
      if (typeWriterElement.innerHTML.endsWith('_')) {
        typeWriterElement.innerHTML = typeWriterElement.innerHTML.slice(0, -1);
      } else {
        typeWriterElement.innerHTML += '_';
      }
    }, 500);
  }
}

function updateTime(): void {
  const timeElement = document.getElementById('sys-time');
  if (!timeElement) return;

  const now = new Date();
  const hours: string = now.getHours().toString().padStart(2, '0');
  const minutes: string = now.getMinutes().toString().padStart(2, '0');
  const seconds: string = now.getSeconds().toString().padStart(2, '0');

  timeElement.textContent = `${hours}:${minutes}:${seconds} WIB`;
}

function initTabNavigation(): void {
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
  const sections = document.querySelectorAll<HTMLElement>('.content-section');

  navLinks.forEach((link) => {
    link.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (!targetId) return;

      const targetSection = document.querySelector<HTMLElement>(targetId);
      if (targetSection) {
        navLinks.forEach((nav) => nav.classList.remove('active'));
        link.classList.add('active');

        sections.forEach((sec) => sec.classList.remove('active'));
        setTimeout(() => {
          targetSection.classList.add('active');
        }, 10);
      }
    });
  });
}

function bootstrap(): void {
  runTypeWriter();
  updateTime();
  setInterval(updateTime, 1000);
  initTabNavigation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}