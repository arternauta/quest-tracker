let typeInterval = null;

const STATUS_LABELS = {
  active: 'ACTIVE',
  paused: 'PAUSED',
  completed: 'DONE',
  backlog: 'BACKLOG'
};

const XP_PER_LEVEL = 500;

function hearts(filled, max) {
  let html = '';
  for (let i = 0; i < max; i++) {
    html += `<span class="heart${i < filled ? '' : ' empty'}">❤️</span>`;
  }
  return html;
}

function rupees(filled, max = 5) {
  let html = `<span class="rupee-label">💎</span>`;
  for (let i = 0; i < max; i++) {
    html += `<span class="rupee${i < filled ? '' : ' empty'}">◆</span>`;
  }
  return html;
}

function triforce(tf) {
  const pieces = [
    { key: 'power',   label: 'POWER' },
    { key: 'wisdom',  label: 'WISDOM' },
    { key: 'courage', label: 'COURAGE' }
  ];
  return pieces.map(({ key, label }) => `
    <div class="triforce-piece">
      <span class="tf-label">${label}</span>
      <div class="tf-pips">
        ${[1,2,3].map(i => `<div class="tf-pip${i <= tf[key] ? '' : ' empty'}"></div>`).join('')}
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
    `RUPEES   : ${'◆'.repeat(q.rupees)}${'◇'.repeat(5 - q.rupees)}`,
    ``,
    `POWER    : ${'▲'.repeat(q.triforce.power)}${'△'.repeat(3 - q.triforce.power)}`,
    `WISDOM   : ${'▲'.repeat(q.triforce.wisdom)}${'△'.repeat(3 - q.triforce.wisdom)}`,
    `COURAGE  : ${'▲'.repeat(q.triforce.courage)}${'△'.repeat(3 - q.triforce.courage)}`,
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

function renderCard(q) {
  return `
    <div class="quest-card status-${q.status}" data-category="${q.category}" data-status="${q.status}" data-id="${q.id}">
      <span class="status-badge ${q.status}">${STATUS_LABELS[q.status]}</span>

      <div class="quest-name">${q.name}</div>
      <div class="quest-subtitle">${q.subtitle}</div>

      <div class="level-badge">LVL ${q.level}</div>

      <div class="hearts-row">${hearts(q.hearts, q.maxHearts)}</div>

      ${xpBar(q.xp)}

      <div class="rupees-row">${rupees(q.rupees)}</div>

      <div class="triforce-row">${triforce(q.triforce)}</div>

      <div class="next-step">
        <span class="next-label">▶ NEXT STEP</span>
        <span class="next-text">${q.nextStep}</span>
      </div>

      <div class="tags-row">
        ${q.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
      </div>

      <div class="last-updated">updated ${q.lastUpdated}</div>
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
    grid.innerHTML = filtered.map(renderCard).join('');
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
