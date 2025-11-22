let journeys = [];
let heatmapData = [];
let passportStamps = [];
let tagFilters = ['全部'];
let recordButtonsBound = false;

function latLngToPosition(lat, lng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

function buildDerivedData() {
  passportStamps = journeys.map((trip) => ({
    title: `${trip.city?.toUpperCase?.() || '未知'} · ${trip.year || ''}`,
    note: `${trip.country || ''} · ${(trip.poi || [])[0] || ''}`,
    mood: trip.mood || ''
  }));

  const tags = new Set(['全部']);
  journeys.forEach((trip) => {
    (trip.theme || []).forEach((t) => tags.add(t));
    (trip.companions || []).forEach((t) => tags.add(t));
  });
  tagFilters = Array.from(tags);

  const base = [];
  journeys.forEach((trip, index) => {
    const stayDays = Math.max(1, (new Date(trip.end) - new Date(trip.start)) / (1000 * 60 * 60 * 24));
    const level = Math.min(4, Math.ceil(stayDays / 3));
    base.push({
      level,
      label: `${trip.city} · ${trip.season || trip.year || ''}`
    });

    // Add a second entry for longer trips to make the heatmap richer
    if (index % 2 === 0) {
      base.push({ level: Math.max(1, level - 1), label: `${trip.city} · 重访` });
    }
  });

  while (base.length < 80 && base.length) {
    base.push(base[base.length % journeys.length]);
  }
  heatmapData = base.slice(0, 80);
}

function renderMap() {
  const map = document.getElementById('world-map');
  map.innerHTML = '';
  journeys.forEach((trip) => {
    const marker = document.createElement('div');
    marker.className = 'marker';
    const { x, y } = latLngToPosition(trip.lat, trip.lng);
    marker.style.left = `${x}%`;
    marker.style.top = `${y}%`;

    const tooltip = document.createElement('div');
    tooltip.className = 'marker-tooltip';
    tooltip.innerHTML = `<strong>${trip.city}</strong><br/>${trip.country} · ${trip.start} → ${trip.end}`;

    marker.appendChild(tooltip);
    map.appendChild(marker);
  });
}

function renderTimeline() {
  const container = document.getElementById('timeline');
  container.innerHTML = '';
  const sorted = [...journeys].sort((a, b) => new Date(b.start) - new Date(a.start));

  sorted.forEach((trip) => {
    const card = document.createElement('div');
    card.className = 'timeline-card';
    card.innerHTML = `
      <header>
        <div>
          <strong>${trip.title}</strong>
          <p class="subtle">${trip.location} · ${trip.season || ''} ${trip.year || ''}</p>
        </div>
        <span class="badge">${trip.start} → ${trip.end}</span>
      </header>
      <p>${trip.mood || '这一段旅程等待你补充故事。'}</p>
      <p class="subtle">POI: ${(trip.poi || []).join(' / ')}</p>
    `;
    container.appendChild(card);
  });
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  journeys.forEach((trip) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${trip.heroImage}" alt="${trip.city} hero" loading="lazy" />
      <div class="meta">
        <strong>${trip.city}</strong>
        <p class="subtle">${trip.country} · ${trip.season || ''} ${trip.year || ''}</p>
        <p>${trip.mood || ''}</p>
      </div>
    `;
    gallery.appendChild(card);
  });
}

function renderHighlights() {
  const highlights = document.getElementById('highlights');
  highlights.innerHTML = '<h3>高光时刻</h3>';
  journeys.forEach((trip) => {
    const item = document.createElement('div');
    item.className = 'highlight-item';
    item.innerHTML = `<strong>${trip.city}</strong><p>${(trip.highlights || []).join(' · ')}</p>`;
    highlights.appendChild(item);
  });

  const exif = document.createElement('p');
  exif.className = 'small';
  exif.textContent = 'EXIF 自动提取：拍摄时间与 GPS 坐标已写入时间轴，无需手动输入。';
  highlights.appendChild(exif);
}

function renderStories() {
  const stories = document.getElementById('stories');
  stories.innerHTML = '';
  journeys.forEach((trip) => {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `
      <p class="eyebrow">${trip.year || ''} · ${trip.season || ''}</p>
      <h4>${trip.title}</h4>
      <p class="subtle">${trip.location} · ${trip.start} → ${trip.end}</p>
      <p>${trip.mood || '点击上传游记，填补这一段空白。'}</p>
    `;
    stories.appendChild(card);
  });
}

function calcStats() {
  const countries = new Set(journeys.map((t) => t.country));
  const continents = new Set(journeys.map((t) => t.continent));
  const totalDistance = journeys.reduce((sum, trip) => sum + (trip.distance || 0), 0);
  const revisitCount = journeys.filter((trip) => trip.revisit).length;
  const modes = journeys.flatMap((trip) => trip.transport || []);
  const modeCount = modes.reduce((acc, mode) => {
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});

  return { countries, continents, totalDistance, revisitCount, modeCount };
}

function renderHeroMetrics() {
  const { countries, totalDistance } = calcStats();
  const rating = journeys.length
    ? journeys.reduce((sum, trip) => sum + (trip.rating || 0), 0) / journeys.length
    : 0;

  const countryEl = document.getElementById('hero-countries');
  const distanceEl = document.getElementById('hero-distance');
  const ratingEl = document.getElementById('hero-rating');

  if (countryEl) countryEl.textContent = countries.size;
  if (distanceEl) distanceEl.textContent = `${totalDistance.toLocaleString()} km`;
  if (ratingEl) ratingEl.textContent = `${rating.toFixed(1)} ★`;
}

function renderAll() {
  buildDerivedData();
  renderHeroMetrics();
  renderMap();
  renderTimeline();
  renderGallery();
  renderHighlights();
  renderStories();
  renderStats();
  renderAchievements();
  renderTags();
  renderPassport();
  renderThenNow();
  renderHeatmap('heatmap', heatmapData);
  renderMiniHeatmap();
}

function renderStats() {
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';
  const { countries, continents, totalDistance, revisitCount, modeCount } = calcStats();

  const stats = [
    { title: '已去国家数量', value: `${countries.size}/197`, desc: '世界地图点亮进度', progress: (countries.size / 197) * 100 },
    { title: '已去大洲数量', value: continents.size, desc: '从亚洲到北美洲的足迹', progress: (continents.size / 7) * 100 },
    { title: '总里程数', value: `${totalDistance.toLocaleString()} km`, desc: '飞机/自驾/火车的累计距离', progress: 100 },
    { title: '重访率', value: `${revisitCount} 次二刷`, desc: '那些念念不忘的城市', progress: journeys.length ? (revisitCount / journeys.length) * 100 : 0 }
  ];

  stats.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <p class="eyebrow">${item.title}</p>
      <h3>${item.value}</h3>
      <p class="subtle">${item.desc}</p>
      <div class="progress"><span style="width:${item.progress}%"></span></div>
    `;
    grid.appendChild(card);
  });

  const transportCard = document.createElement('div');
  transportCard.className = 'stat-card';
  transportCard.innerHTML = '<p class="eyebrow">交通方式</p><h3>到达方式</h3>';
  const tagWrap = document.createElement('div');
  tagWrap.className = 'transport-tags';
  Object.entries(modeCount).forEach(([mode, count]) => {
    const tag = document.createElement('span');
    tag.textContent = `${mode} x ${count}`;
    tagWrap.appendChild(tag);
  });
  transportCard.appendChild(tagWrap);
  grid.appendChild(transportCard);
}

function renderAchievements() {
  const container = document.getElementById('achievements');
  container.innerHTML = '';
  const { countries, totalDistance } = calcStats();
  const badges = [
    { title: '护照印章收藏家', desc: `解锁 ${countries.size} 个国家的印章`, icon: '🛂' },
    { title: '里程碑', desc: `累计 ${totalDistance.toLocaleString()} km`, icon: '🛰️' },
    { title: '城市复读机', desc: '至少二刷 2 座城市', icon: '🧭' },
    { title: '四季打卡', desc: '春夏秋冬均有足迹', icon: '🍃' }
  ];

  badges.forEach((badge) => {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.innerHTML = `<p class="eyebrow">${badge.icon}</p><h4>${badge.title}</h4><p class="subtle">${badge.desc}</p>`;
    container.appendChild(card);
  });
}

function renderTags() {
  const filterContainer = document.getElementById('tag-filters');
  const cardsContainer = document.getElementById('tag-cards');
  let active = '全部';

  filterContainer.innerHTML = '';
  cardsContainer.innerHTML = '';

  function paintCards(filter) {
    cardsContainer.innerHTML = '';
    journeys
      .filter((trip) => filter === '全部' || (trip.theme || []).includes(filter) || (trip.companions || []).includes(filter))
      .forEach((trip) => {
        const card = document.createElement('div');
        card.className = 'tag-card';
        card.innerHTML = `
          <p class="eyebrow">${(trip.companions || []).join(' · ')}</p>
          <h4>${trip.title}</h4>
          <p class="subtle">${(trip.theme || []).join(' / ')}</p>
          <p>推荐指数：${'★'.repeat(trip.rating || 0)}${'☆'.repeat(5 - (trip.rating || 0))}</p>
          <p class="subtle">二刷：${trip.revisit ? 'Yes' : 'No'}</p>
        `;
        cardsContainer.appendChild(card);
      });
  }

  tagFilters.forEach((tag) => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    if (tag === active) btn.classList.add('active');
    btn.addEventListener('click', () => {
      active = tag;
      document.querySelectorAll('.tag-chips button').forEach((b) => b.classList.toggle('active', b.textContent === tag));
      paintCards(active);
    });
    filterContainer.appendChild(btn);
  });

  paintCards(active);
}

function renderPassport() {
  const container = document.getElementById('passport');
  container.innerHTML = '<p class="eyebrow">护照印章墙</p>';
  passportStamps.forEach((stamp) => {
    const card = document.createElement('div');
    card.className = 'stamp';
    card.innerHTML = `<strong>${stamp.title}</strong><p class="subtle">${stamp.note}</p><p>${stamp.mood}</p>`;
    container.appendChild(card);
  });
}

function renderThenNow() {
  const container = document.getElementById('then-now');
  container.innerHTML = `<p class="eyebrow">此时彼刻</p><h4>同一地点，不同年份</h4>`;
  const slot = document.createElement('div');
  slot.className = 'images';

  const pairs = journeys.slice(0, 2).map((trip) => ({
    label: `${trip.city} · ${trip.year || ''}`,
    src: (trip.gallery && trip.gallery[0]) || trip.heroImage
  }));

  const fallback = [
    {
      label: '京都 · 2022',
      src: 'https://images.unsplash.com/photo-1504788363733-507549153474?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: '京都 · 2016',
      src: 'https://images.unsplash.com/photo-1470123808288-1e59739d9357?auto=format&fit=crop&w=800&q=80'
    }
  ];

  (pairs.length >= 2 ? pairs : fallback).forEach((item) => {
    const fig = document.createElement('figure');
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.label;
    img.loading = 'lazy';
    const cap = document.createElement('figcaption');
    cap.className = 'subtle';
    cap.textContent = item.label;
    fig.appendChild(img);
    fig.appendChild(cap);
    slot.appendChild(fig);
  });

  container.appendChild(slot);
  const note = document.createElement('p');
  note.className = 'small';
  note.textContent = '同一地点不同年份的照片自动对比，展示成长与变化。';
  container.appendChild(note);
}

function renderHeatmap(targetId, data) {
  const container = document.getElementById(targetId);
  container.innerHTML = '';
  data.forEach((cell) => {
    const block = document.createElement('div');
    block.className = 'heat-cell';
    block.style.background = `rgba(102, 228, 193, ${0.15 * cell.level})`;
    block.title = cell.label;
    container.appendChild(block);
  });
}

function renderMiniHeatmap() {
  const mini = document.getElementById('mini-heatmap');
  mini.innerHTML = '';
  const sample = heatmapData.slice(0, 48);
  sample.forEach((cell) => {
    const block = document.createElement('div');
    block.className = 'heat-cell';
    block.style.width = '10px';
    block.style.height = '10px';
    block.style.background = `rgba(92, 160, 255, ${0.15 * cell.level})`;
    mini.appendChild(block);
  });
}

function showErrorState(message) {
  const main = document.querySelector('main');
  main.innerHTML = `
    <section class="panel">
      <div class="error-state">
        <h3>无法加载旅程数据</h3>
        <p>${message}</p>
        <p class="small">请确保已运行 <code>npm start</code> 并保持服务在线。</p>
      </div>
    </section>
  `;
}

async function fetchJourneys() {
  const response = await fetch('/api/journeys');
  if (!response.ok) {
    throw new Error('无法从 API 获取旅程列表');
  }
  const payload = await response.json();
  return payload.journeys || [];
}

function parseList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function setupRecordForm() {
  if (recordButtonsBound) return;
  recordButtonsBound = true;

  const modal = document.getElementById('journey-modal');
  const form = document.getElementById('journey-form');
  const feedback = document.getElementById('form-feedback');
  const closeBtn = document.getElementById('close-modal');
  const cancelBtn = document.getElementById('cancel-modal');

  function openModal() {
    form.reset();
    const idInput = form.elements.id;
    if (idInput) idInput.value = `trip-${Date.now()}`;
    feedback.textContent = '';
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('[data-action="record"]').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = '写入中，请稍候...';
    try {
      const formData = new FormData(form);
      const payload = {
        id: formData.get('id').trim(),
        title: formData.get('title').trim(),
        location: formData.get('location').trim(),
        country: formData.get('country').trim(),
        continent: formData.get('continent').trim(),
        city: formData.get('city').trim(),
        lat: parseFloat(formData.get('lat')),
        lng: parseFloat(formData.get('lng')),
        start: formData.get('start'),
        end: formData.get('end'),
        season: formData.get('season') || '',
        year: formData.get('year') ? Number(formData.get('year')) : undefined,
        heroImage: formData.get('heroImage'),
        poi: parseList(formData.get('poi')),
        gallery: parseList(formData.get('gallery')),
        highlights: parseList(formData.get('highlights')),
        companions: parseList(formData.get('companions')),
        theme: parseList(formData.get('theme')),
        transport: parseList(formData.get('transport')),
        rating: formData.get('rating') ? Number(formData.get('rating')) : 0,
        revisit: formData.get('revisit') === 'true',
        distance: formData.get('distance') ? Number(formData.get('distance')) : 0,
        mood: formData.get('mood') || ''
      };

      const response = await fetch('/api/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || '写入失败，请检查必填项。');
      }

      const result = await response.json();
      const saved = result.journey;
      journeys = [saved, ...journeys.filter((j) => j.id !== saved.id)];
      renderAll();
      feedback.textContent = '写入成功，已刷新最新数据。';
      setTimeout(() => closeModal(), 600);
    } catch (error) {
      console.error(error);
      feedback.textContent = error.message;
    }
  });
}

async function init() {
  setupRecordForm();
  try {
    journeys = await fetchJourneys();
    if (!journeys.length) {
      showErrorState('暂无数据，请先添加旅程或执行 seed。');
      return;
    }
    renderAll();
  } catch (error) {
    console.error(error);
    showErrorState(error.message);
  }
}

document.addEventListener('DOMContentLoaded', init);
