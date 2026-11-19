// Leonida Legend — GTA VI trophy tracker. Plain ES module, no libraries, no network
// beyond fetching this app's own data file. Progress lives in localStorage; export
// downloads it as JSON and import reads such a file back.
import { renderRoadmap } from './roadmap.js';

const EARNED_KEY = 'gta6-trophy-guide-earned-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

const KINDS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
  ['side', 'Side quests'],
  ['robbery', 'Robberies'],
  ['freeroam', 'Free-roam'],
  ['money', 'Money'],
  ['platinum', 'Platinum'],
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));
const sourceByKey = new Map(doc.sources.map((s) => [s.key, s]));

// ---- state ----
const params = new URLSearchParams(location.search);
let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]').filter((n) => byName.has(n)));
let spoiler = localStorage.getItem(SPOILER_KEY) === '1' || params.get('spoiler') === 'on';
let kind = KINDS.some(([k]) => k === params.get('filter')) ? params.get('filter') : 'all';
let grade = 'all';
let query = '';
let hideEarned = false;
let selectedId = Number(params.get('trophy')) || null;
let view = params.get('view') === 'roadmap' ? 'roadmap' : 'checklist';
if (params.get('earned')) {
  for (const id of params.get('earned').split(',')) {
    const t = byId.get(Number(id));
    if (t) earned.add(t.name);
  }
}

// ---- elements ----
const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const detailEl = $('detail');
const searchEl = $('search');
const gradeEl = $('grade');
const spoilerEl = $('spoiler');
const hideEarnedEl = $('hideEarned');
const chipsEl = $('kindChips');
const resultCountEl = $('resultCount');

function save() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort()));
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

// A story trophy is masked while spoiler mode is on and it is not yet earned.
function isMasked(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.name);
}

function gradeDot(t) {
  const dot = document.createElement('span');
  dot.className = 'grade-dot grade-' + t.grade;
  dot.title = t.grade;
  return dot;
}

function kindLabel(k) {
  return (KINDS.find(([key]) => key === k) ?? [k, k])[1];
}

function matches(t) {
  if (kind === 'missable' && !t.missable) return false;
  if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
  if (grade !== 'all' && t.grade !== grade) return false;
  if (hideEarned && earned.has(t.name)) return false;
  if (query) {
    const hay = isMasked(t) ? '' : (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  $('progressText').textContent = done + ' of ' + total + ' earned';
  $('progressPct').textContent = Math.round((done / total) * 100) + '%';
  $('progressFill').style.width = (done / total) * 100 + '%';
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    return g + ' ' + got + '/' + all;
  });
  $('progressGrades').textContent = parts.join(' · ');
}

function renderChips() {
  chipsEl.replaceChildren();
  for (const [key, label] of KINDS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (kind === key ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => {
      kind = key;
      renderChips();
      renderList();
    });
    chipsEl.append(b);
  }
}

function renderList() {
  rowsEl.replaceChildren();
  const shown = trophies.filter(matches);
  resultCountEl.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies.';
  $('emptyNote').hidden = shown.length > 0;
  for (const t of shown) {
    const li = document.createElement('li');
    if (selectedId === t.id) li.classList.add('selected');
    if (earned.has(t.name)) li.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Earned: ' + (isMasked(t) ? 'hidden story trophy' : t.name));
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      renderProgress();
      renderList();
      renderDetail();
    });
    const name = document.createElement('div');
    name.className = 'trophy-name';
    if (isMasked(t)) {
      name.innerHTML = '<span class="hidden-mark">Hidden story trophy — earn it to reveal</span>';
    } else {
      name.textContent = t.name;
    }
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isMasked(t) ? 'Story trophy, hidden until earned.' : t.description;
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(gradeDot(t));
    const gradeLabel = document.createElement('span');
    gradeLabel.className = 'grade-label';
    gradeLabel.textContent = t.grade;
    meta.append(gradeLabel);
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag kind-' + t.kind;
    kindTag.textContent = kindLabel(t.kind);
    tags.append(kindTag);
    if (t.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag';
      hiddenTag.textContent = 'hidden on PS5';
      tags.append(hiddenTag);
    }
    if (t.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = '⚠ possibly missable';
      tags.append(missTag);
    }
    li.append(box, name, meta, desc, tags);
    li.addEventListener('click', (e) => {
      if (e.target === box) return;
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    rowsEl.append(li);
  }
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = byId.get(selectedId);
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Pick a trophy on the left to see its guide, its sources and when it can be missed.';
    detailEl.append(p);
    return;
  }
  if (isMasked(t)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent =
      'Spoiler-free mode is on: this story trophy stays hidden until you earn it. ' +
      'Turn the setting off to see its name, description and guide.';
    detailEl.append(h, note);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = t.description + ' — ' + t.grade + (t.hidden ? ' · hidden on PlayStation until earned' : '');
  const meta = document.createElement('p');
  meta.className = 'official';
  meta.textContent =
    kindLabel(t.kind) + ' · roadmap stage ' + t.stage + ' of 5' + (t.missable ? ' · ⚠ possibly missable — see the guide' : '');
  const guideLabel = document.createElement('p');
  guideLabel.className = 'guide-label';
  guideLabel.textContent = 'How to get it';
  const guide = document.createElement('p');
  guide.className = 'guide' + (t.guide.startsWith('No confirmed') ? ' unknown' : '');
  guide.textContent = t.guide;
  const sources = document.createElement('div');
  sources.className = 'sources';
  const sourcesTitle = document.createElement('b');
  sourcesTitle.textContent = 'Sources for this guide';
  const list = document.createElement('ul');
  for (const key of t.sources) {
    const s = sourceByKey.get(key);
    if (!s) continue;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    list.append(li);
  }
  sources.append(sourcesTitle, list);
  const btn = document.createElement('button');
  btn.type = 'button';
  const isEarned = earned.has(t.name);
  btn.className = 'earn-btn' + (isEarned ? ' earned' : '');
  btn.textContent = isEarned ? '✓ Earned — click to unmark' : 'Mark as earned';
  btn.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name);
    else earned.add(t.name);
    save();
    renderProgress();
    renderList();
    renderDetail();
  });
  detailEl.append(h, official, meta, guideLabel, guide, sources, btn);
}

function renderRoadmapView() {
  renderRoadmap($('roadmap'), trophies, {
    earned,
    spoiler,
    onSelect: (id) => {
      selectedId = id;
      setView('checklist');
      renderList();
      renderDetail();
      document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
  });
}

function setView(next) {
  view = next;
  $('tabChecklist').classList.toggle('active', view === 'checklist');
  $('tabRoadmap').classList.toggle('active', view === 'roadmap');
  $('checklistView').hidden = view !== 'checklist';
  $('roadmapView').hidden = view !== 'roadmap';
  $('toolbar').style.display = view === 'checklist' ? '' : 'none';
  document.querySelector('.online-note').style.display = view === 'checklist' ? '' : 'none';
  if (view === 'roadmap') renderRoadmapView();
}

function renderSourcesLine() {
  const line = $('sourcesLine');
  line.replaceChildren();
  for (const s of doc.sources) {
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    line.append(a);
  }
}

// ---- wire up ----
$('tabChecklist').addEventListener('click', () => setView('checklist'));
$('tabRoadmap').addEventListener('click', () => setView('roadmap'));
searchEl.addEventListener('input', () => {
  query = searchEl.value.trim().toLowerCase();
  renderList();
});
gradeEl.addEventListener('change', () => {
  grade = gradeEl.value;
  renderList();
});
hideEarnedEl.addEventListener('change', () => {
  hideEarned = hideEarnedEl.checked;
  renderList();
});
spoilerEl.addEventListener('change', () => {
  spoiler = spoilerEl.checked;
  save();
  renderList();
  renderDetail();
  if (view === 'roadmap') renderRoadmapView();
});
$('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names) || !names.every((n) => byName.has(n))) throw new Error('bad file');
    earned = new Set(names);
    save();
    renderProgress();
    renderList();
    renderDetail();
    resultCountEl.textContent = 'Imported ' + earned.size + ' earned trophies from ' + file.name + '.';
  } catch {
    resultCountEl.textContent = 'Import failed: that file is not a trophy-progress export from this guide.';
  }
  e.target.value = '';
});

// ---- first paint ----
spoilerEl.checked = spoiler;
if (kind !== 'all') renderChips();
else renderChips();
renderProgress();
renderList();
renderDetail();
renderSourcesLine();
setView(view);
save();
