const prizes = [
  { label: '50', value: 50, color: '#ff5c7a', weight: 18 },
  { label: '100', value: 100, color: '#ffb947', weight: 16 },
  { label: '200', value: 200, color: '#8f7dff', weight: 13 },
  { label: '500', value: 500, color: '#63e4ff', weight: 10 },
  { label: 'جائزة', value: 'Jackpot', color: '#6ef5b2', weight: 7 },
  { label: 'Free', value: 'Free Spin', color: '#ff5bbd', weight: 11 },
  { label: '75', value: 75, color: '#ff9b37', weight: 15 },
  { label: '300', value: 300, color: '#5c4dff', weight: 10 },
];

const wheel = document.getElementById('wheel');
const wheelLabels = document.getElementById('wheelLabels');
const spinBtn = document.getElementById('spinBtn');
const prizeText = document.getElementById('prizeText');
const statusText = document.getElementById('statusText');
const coinCount = document.getElementById('coinCount');
const confettiCanvas = document.getElementById('confettiCanvas');

let coinBalance = 1200;
let currentRotation = 0;
let isSpinning = false;

function buildWheel() {
  const totalWeight = prizes.reduce((sum, item) => sum + item.weight, 0);
  const colors = [];
  let start = 0;

  prizes.forEach((prize) => {
    const end = start + (prize.weight / totalWeight) * 360;
    colors.push(`${prize.color} ${start}deg ${end}deg`);
    start = end;
  });

  wheel.style.background = `conic-gradient(from -90deg, ${colors.join(', ')})`;

  const labels = [];
  const segmentAngle = 360 / prizes.length;

  prizes.forEach((prize, index) => {
    const angle = index * segmentAngle + segmentAngle / 2;
    const radians = ((angle - 90) * Math.PI) / 180;
    const radius = 155;
    const x = 50 + Math.cos(radians) * 28;
    const y = 50 + Math.sin(radians) * 28;

    const label = document.createElement('div');
    label.className = 'label';
    label.style.left = `${x}%`;
    label.style.top = `${y}%`;
    label.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

    const inner = document.createElement('span');
    inner.textContent = prize.label;
    label.appendChild(inner);
    labels.push(label);
  });

  wheelLabels.innerHTML = '';
  labels.forEach((label) => wheelLabels.appendChild(label));
}

function pickWinner() {
  const totalWeight = prizes.reduce((sum, item) => sum + item.weight, 0);
  const random = Math.random() * totalWeight;

  let cumulative = 0;
  for (let i = 0; i < prizes.length; i += 1) {
    cumulative += prizes[i].weight;
    if (random <= cumulative) {
      return i;
    }
  }

  return prizes.length - 1;
}

function animateConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const particles = Array.from({ length: 120 }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    r: Math.random() * 5 + 3,
    color: ['#ffd56c', '#63e4ff', '#ff5bbd', '#6ef5b2', '#ff5c7a', '#8f7dff'][Math.floor(Math.random() * 6)],
    vx: (Math.random() - 0.5) * 9,
    vy: Math.random() * 7 + 2,
    life: 100 + Math.random() * 50,
    gravity: 0.08 + Math.random() * 0.08,
  }));

  let frame = 0;
  const render = () => {
    frame += 1;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.life -= 1;

      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (frame < 70) {
      requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  };

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  requestAnimationFrame(render);
}

function spinWheel() {
  if (isSpinning) return;

  if (coinBalance < 50) {
    statusText.textContent = 'الرصيد غير كافٍ';
    prizeText.textContent = '50';
    return;
  }

  isSpinning = true;
  spinBtn.disabled = true;
  coinBalance -= 50;
  coinCount.textContent = coinBalance;
  statusText.textContent = 'يتم الدوران...';
  prizeText.textContent = '...';

  const winnerIndex = pickWinner();
  const prize = prizes[winnerIndex];
  const segmentAngle = 360 / prizes.length;
  const centerAngle = (winnerIndex + 0.5) * segmentAngle;
  const extraTurns = 7 + Math.random() * 2;
  const finalRotation = currentRotation + extraTurns * 360 + (360 - centerAngle);
  currentRotation = finalRotation;

  wheel.style.transform = `rotate(${finalRotation}deg)`;

  setTimeout(() => {
    isSpinning = false;
    spinBtn.disabled = false;
    statusText.textContent = 'تهانينا!';
    prizeText.textContent = prize.label;

    if (typeof prize.value === 'number') {
      coinBalance += prize.value;
      coinCount.textContent = coinBalance;
    }

    animateConfetti();
  }, 4700);
}

spinBtn.addEventListener('click', spinWheel);
window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

buildWheel();
