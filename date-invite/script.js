// ---- config: tweak these! ----
const INTRO_LINES = "Psst... hey you. Yeah, you. I've been working up the courage to ask you something...";
const NO_DODGE_MESSAGES = [
  "nice try 😏",
  "nope!",
  "keep trying~",
  "so close!",
  "almost had it",
  "not today!",
];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---- typewriter effect ----
function typewrite(el, text, speed = 32) {
  el.textContent = '';
  let i = 0;
  return new Promise(resolve => {
    const timer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

// ---- floating hearts ambience ----
function spawnHeart() {
  const layer = document.getElementById('hearts-layer');
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.textContent = ['💕', '💖', '🌸', '✨'][Math.floor(Math.random() * 4)];
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
  heart.style.animationDuration = (5 + Math.random() * 3) + 's';
  layer.appendChild(heart);
  setTimeout(() => heart.remove(), 9000);
}
setInterval(spawnHeart, 900);

// ---- confetti burst ----
function confettiBurst() {
  const layer = document.getElementById('confetti-layer');
  const colors = ['#ff8fab', '#ffd166', '#6ab150', '#ffffff', '#d94f79'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.animationDelay = (Math.random() * 0.5) + 's';
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }
}

// ---- screen 1: intro ----
window.addEventListener('DOMContentLoaded', () => {
  typewrite(document.getElementById('intro-text'), INTRO_LINES);
});

document.getElementById('intro-advance').addEventListener('click', () => {
  showScreen('screen-ask');
});

// ---- screen 2: the ask, with a dodging No button ----
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const noHint = document.getElementById('no-hint');
const choiceRow = document.querySelector('.choice-row');
let dodgeCount = 0;

function dodgeNoButton() {
  dodgeCount++;
  noBtn.classList.add('roaming');

  const margin = 60;
  const maxX = window.innerWidth - margin * 2;
  const maxY = window.innerHeight - margin * 2;
  const newX = margin + Math.random() * maxX;
  const newY = margin + Math.random() * maxY;

  noBtn.style.left = newX + 'px';
  noBtn.style.top = newY + 'px';

  noHint.textContent = NO_DODGE_MESSAGES[dodgeCount % NO_DODGE_MESSAGES.length];

  // Yes button grows a little more confident each time
  const scale = Math.min(1 + dodgeCount * 0.08, 1.8);
  yesBtn.style.transform = `scale(${scale})`;
  yesBtn.style.fontSize = (11 + dodgeCount) + 'px';
}

noBtn.addEventListener('mouseenter', dodgeNoButton);
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  dodgeNoButton();
});
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  dodgeNoButton();
});

yesBtn.addEventListener('click', () => {
  confettiBurst();
  showScreen('screen-activities');
});

// ---- screen 3: activity picker ----
const selected = new Set();
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('selected');
    if (card.classList.contains('selected')) {
      selected.add(card.dataset.label);
    } else {
      selected.delete(card.dataset.label);
    }
  });
});

document.getElementById('activities-submit').addEventListener('click', () => {
  const summary = document.getElementById('summary-text');
  if (selected.size === 0) {
    summary.textContent = "You picked a surprise-me date. I love that for us. 💫";
  } else {
    const list = Array.from(selected).join(', ');
    summary.textContent = `Locking it in: ${list}. I'll plan the rest! 🌻`;
  }
  confettiBurst();
  showScreen('screen-end');
});
