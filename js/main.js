let typeInterval = null;

const STATUS_LABELS = {
  active: 'ACTIVE',
  paused: 'PAUSED',
  completed: 'DONE',
  backlog: 'BACKLOG'
};

const XP_PER_LEVEL = 500;

const CATEGORY_META = {
  code:     { icon: '⌨',  label: 'CODE',     color: '#00a800' },
  creative: { icon: '✦',  label: 'CREATIVE', color: '#f8b800' },
  tool:     { icon: '⚙',  label: 'TOOL',     color: '#3cbcfc' },
  work:     { icon: '◈',  label: 'WORK',     color: '#fc7460' }
};

function hearts(filled, max) {
  let html = '';
  for (let i = 0; i < max; i++) {
    html += `<span class="heart${i < filled ? '' : ' empty'}">❤️</span>`;
  }
  return html;
}

function stats(s) {
  const pieces = [
    { key: 'momentum', label: 'MOMENTUM', icon: '⚡' },
    { key: 'claridad',  label: 'CLARIDAD',  icon: '🎯' },
    { key: 'avance',   label: 'AVANCE',   icon: '📈' }
  ];
  return pieces.map(({ key, label, icon }) => `
    <div class="triforce-piece">
      <span class="tf-label">${icon} ${label}</span>
      <div class="tf-pips">
        ${[1,2,3].map(i => `<div class="tf-pip${i <= s[key] ? '' : ' empty'}"></div>`).join('')}
      </div>
    </div>
  `).join('');
}

function xpBar(xp) {
  const progress = xp % XP_PER_LEVEL;
  const pct = Math.min((progress / XP_PER_LEVEL) * 100, 100);
  return `
    <div class="xp-row">
      <div class="xp-label">
        <span>⭐ XP</span>
        <span>${xp} pts</span>
      </div>
      <div class="xp-bar-bg">
        <div class="xp-bar-fill" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
}

function openModal(q) {
  const overlay = document.getElementById('dialog-overlay');
  const nameEl  = document.getElementById('dialog-name');
  const bodyEl  = document.getElementById('dialog-body');
  const cursor  = document.getElementById('dialog-cursor');

  const fullText = [
    `${q.description}`,
    ``,
    `CATEGORY : ${q.category.toUpperCase()}`,
    `STATUS   : ${STATUS_LABELS[q.status]}`,
    `LEVEL    : ${q.level}`,
    `XP       : ${q.xp} pts`,
    `HEARTS   : ${'❤'.repeat(q.hearts)}${'♡'.repeat(q.maxHearts - q.hearts)}`,
    ``,
    `⚡ MOMENTUM : ${'▲'.repeat(q.stats.momentum)}${'△'.repeat(3 - q.stats.momentum)}`,
    `🎯 CLARIDAD  : ${'▲'.repeat(q.stats.claridad)}${'△'.repeat(3 - q.stats.claridad)}`,
    `📈 AVANCE    : ${'▲'.repeat(q.stats.avance)}${'△'.repeat(3 - q.stats.avance)}`,
    ``,
    `▶ NEXT   : ${q.nextStep}`,
  ].join('\n');

  nameEl.textContent = q.name.toUpperCase();
  bodyEl.textContent = '';
  cursor.style.visibility = 'hidden';
  overlay.classList.add('active');

  let i = 0;
  const speed = 18;
  clearInterval(typeInterval);
  typeInterval = setInterval(() => {
    bodyEl.textContent += fullText[i];
    i++;
    if (i >= fullText.length) {
      clearInterval(typeInterval);
      cursor.style.visibility = 'visible';
    }
  }, speed);
}

function closeModal() {
  clearInterval(typeInterval);
  document.getElementById('dialog-overlay').classList.remove('active');
}

function renderCard(q, index = 0) {
  const cat = CATEGORY_META[q.category] || CATEGORY_META.work;
  return `
    <div class="quest-card status-${q.status}"
         data-category="${q.category}"
         data-status="${q.status}"
         data-id="${q.id}"
         style="--i:${index}; --cat-color:${cat.color}">

      <div class="card-header">
        <span class="category-badge" style="color:${cat.color}; border-color:${cat.color}">
          ${cat.icon} ${cat.label}
        </span>
        <span class="status-badge ${q.status}">${STATUS_LABELS[q.status]}</span>
      </div>

      <div class="quest-name">${q.name}</div>
      <div class="quest-subtitle">${q.subtitle}</div>

      <div class="card-bottom">
        <div class="hearts-row">${hearts(q.hearts, q.maxHearts)}</div>
        <div class="level-badge">LVL ${q.level}</div>
      </div>

      <div class="next-step">
        <span class="next-label">▶ NEXT STEP</span>
        <span class="next-text">${q.nextStep}</span>
      </div>
    </div>
  `;
}

function renderHero(hero) {
  document.querySelector('.hero-name').textContent = hero.name.toUpperCase();
  document.querySelector('.hero-title').textContent = hero.title;
  document.querySelector('#hero-level').textContent = hero.level;
  document.querySelector('#hero-xp').textContent = hero.totalXP.toLocaleString();
}

function applyFilter(quests, filter) {
  if (filter === 'all') return quests;
  if (['active','paused','completed','backlog'].includes(filter)) {
    return quests.filter(q => q.status === filter);
  }
  return quests.filter(q => q.category === filter);
}

async function init() {
  const res = await fetch('./data/quests.json');
  const data = await res.json();

  renderHero(data.hero);

  let currentFilter = 'all';
  const grid = document.getElementById('quest-grid');

  function render() {
    const filtered = applyFilter(data.quests, currentFilter);
    grid.innerHTML = filtered.map((q, i) => renderCard(q, i)).join('');
    grid.querySelectorAll('.quest-card').forEach(card => {
      card.addEventListener('click', () => {
        const quest = data.quests.find(q => q.id === card.dataset.id);
        if (quest) openModal(quest);
      });
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
}

init();
