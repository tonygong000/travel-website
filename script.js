const journeys = [
  {
    id: 'paris2023',
    title: '巴黎秋日 Citywalk',
    location: '巴黎, 法国',
    country: '法国',
    continent: '欧洲',
    city: '巴黎',
    poi: ['埃菲尔铁塔', '卢浮宫', '塞纳河'],
    lat: 48.8566,
    lng: 2.3522,
    start: '2023-09-20',
    end: '2023-09-27',
    season: '秋季',
    year: 2023,
    heroImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522093132552-310aea2b0d74?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80'
    ],
    highlights: ['雨后的塞纳河漫步', '卢浮宫闭馆前独享寂静', '圣礼拜堂彩窗沐浴阳光'],
    companions: ['情侣'],
    theme: ['Citywalk', '美食之旅'],
    transport: ['飞机', '火车', '步行'],
    rating: 5,
    revisit: true,
    distance: 9700,
    mood: '落叶飘进纸杯拿铁的那刻，觉得世界温柔起来。'
  },
  {
    id: 'kyoto2022',
    title: '京都慢旅',
    location: '京都, 日本',
    country: '日本',
    continent: '亚洲',
    city: '京都',
    poi: ['伏见稻荷大社', '岚山竹林', '先斗町'],
    lat: 35.0116,
    lng: 135.7681,
    start: '2022-03-15',
    end: '2022-03-22',
    season: '春季',
    year: 2022,
    heroImage: 'https://images.unsplash.com/photo-1504788363733-507549153474?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504788366400-8e2287a6cc57?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504788366400-99b57a6cc57?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80'
    ],
    highlights: ['凌晨登顶稻荷山看日出', '岚山竹林的风声', '先斗町河畔和服约会'],
    companions: ['独自', '朋友'],
    theme: ['文化朝圣', 'Citywalk'],
    transport: ['飞机', '地铁', '步行'],
    rating: 4,
    revisit: false,
    distance: 2500,
    mood: '樱花飘落肩头，好像全城都在为我拍彩带。'
  },
  {
    id: 'banff2024',
    title: '落基山公路自驾',
    location: '班夫, 加拿大',
    country: '加拿大',
    continent: '北美洲',
    city: '班夫',
    poi: ['路易斯湖', '梦莲湖', '冰原大道'],
    lat: 51.1784,
    lng: -115.5708,
    start: '2024-06-02',
    end: '2024-06-11',
    season: '夏季',
    year: 2024,
    heroImage: 'https://images.unsplash.com/photo-1508261306217-1a1b2b85da41?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1508264165352-258859e62245?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508264019162-5d12a2a8c884?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508261306217-1a1b2b85da41?auto=format&fit=crop&w=800&q=80'
    ],
    highlights: ['梦莲湖日出泛舟', '冰原大道星空', '熊出没的越野徒步'],
    companions: ['家庭'],
    theme: ['自驾', '徒步'],
    transport: ['飞机', '自驾', '徒步'],
    rating: 5,
    revisit: true,
    distance: 14000,
    mood: '雪山倒映在湖面，像把现实和梦境重叠到了一起。'
  },
  {
    id: 'rome2021',
    title: '罗马复古周末',
    location: '罗马, 意大利',
    country: '意大利',
    continent: '欧洲',
    city: '罗马',
    poi: ['斗兽场', '特雷维喷泉', '万神殿'],
    lat: 41.9028,
    lng: 12.4964,
    start: '2021-10-08',
    end: '2021-10-12',
    season: '秋季',
    year: 2021,
    heroImage: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505765050516-f72dcac9c60a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505765062320-ebe9b4c2b44a?auto=format&fit=crop&w=800&q=80'
    ],
    highlights: ['在特雷维喷泉扔硬币', '万神殿的光柱', '复古 Vespa 穿街巷'],
    companions: ['情侣'],
    theme: ['复古漫游', '美食之旅'],
    transport: ['飞机', '地铁', '步行'],
    rating: 4,
    revisit: false,
    distance: 9200,
    mood: '黄昏的罗马像上世纪的电影，胶片颗粒感肉眼可见。'
  }
];

const heatmapData = Array.from({ length: 80 }, (_, index) => {
  const level = (index % 7) + 1;
  const anchor = journeys[index % journeys.length];
  return {
    level,
    label: `${anchor.city} · ${anchor.season}`
  };
});

const passportStamps = journeys.map((trip) => ({
  title: `${trip.city.toUpperCase()} · ${trip.year}`,
  note: `${trip.country} · ${trip.poi[0]}`,
  mood: trip.mood
}));

const tagFilters = ['全部', 'Citywalk', '美食之旅', '自驾', '徒步', '文化朝圣', '家庭', '情侣'];

function latLngToPosition(lat, lng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

function renderMap() {
  const map = document.getElementById('world-map');
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
  const sorted = [...journeys].sort((a, b) => new Date(b.start) - new Date(a.start));

  sorted.forEach((trip) => {
    const card = document.createElement('div');
    card.className = 'timeline-card';
    card.innerHTML = `
      <header>
        <div>
          <strong>${trip.title}</strong>
          <p class="subtle">${trip.location} · ${trip.season} ${trip.year}</p>
        </div>
        <span class="badge">${trip.start} → ${trip.end}</span>
      </header>
      <p>${trip.mood}</p>
      <p class="subtle">POI: ${trip.poi.join(' / ')}</p>
    `;
    container.appendChild(card);
  });
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  journeys.forEach((trip) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${trip.heroImage}" alt="${trip.city} hero" loading="lazy" />
      <div class="meta">
        <strong>${trip.city}</strong>
        <p class="subtle">${trip.country} · ${trip.season} ${trip.year}</p>
        <p>${trip.mood}</p>
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
    item.innerHTML = `<strong>${trip.city}</strong><p>${trip.highlights.join(' · ')}</p>`;
    highlights.appendChild(item);
  });
}

function renderStories() {
  const stories = document.getElementById('stories');
  journeys.forEach((trip) => {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `
      <p class="eyebrow">${trip.year} · ${trip.season}</p>
      <h4>${trip.title}</h4>
      <p class="subtle">${trip.location} · ${trip.start} → ${trip.end}</p>
      <p>${trip.mood}</p>
    `;
    stories.appendChild(card);
  });
}

function calcStats() {
  const countries = new Set(journeys.map((t) => t.country));
  const continents = new Set(journeys.map((t) => t.continent));
  const totalDistance = journeys.reduce((sum, trip) => sum + trip.distance, 0);
  const revisitCount = journeys.filter((trip) => trip.revisit).length;
  const modes = journeys.flatMap((trip) => trip.transport);
  const modeCount = modes.reduce((acc, mode) => {
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});

  return { countries, continents, totalDistance, revisitCount, modeCount };
}

function renderStats() {
  const grid = document.getElementById('stats-grid');
  const { countries, continents, totalDistance, revisitCount, modeCount } = calcStats();

  const stats = [
    { title: '已去国家数量', value: `${countries.size}/197`, desc: '世界地图点亮进度', progress: (countries.size / 197) * 100 },
    { title: '已去大洲数量', value: continents.size, desc: '从亚洲到北美洲的足迹', progress: (continents.size / 7) * 100 },
    { title: '总里程数', value: `${totalDistance.toLocaleString()} km`, desc: '飞机/自驾/火车的累计距离', progress: 100 },
    { title: '重访率', value: `${revisitCount} 次二刷`, desc: '那些念念不忘的城市', progress: (revisitCount / journeys.length) * 100 }
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

  function paintCards(filter) {
    cardsContainer.innerHTML = '';
    journeys
      .filter((trip) => filter === '全部' || trip.theme.includes(filter) || trip.companions.includes(filter))
      .forEach((trip) => {
        const card = document.createElement('div');
        card.className = 'tag-card';
        card.innerHTML = `
          <p class="eyebrow">${trip.companions.join(' · ')}</p>
          <h4>${trip.title}</h4>
          <p class="subtle">${trip.theme.join(' / ')}</p>
          <p>推荐指数：${'★'.repeat(trip.rating)}${'☆'.repeat(5 - trip.rating)}</p>
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
  const pairs = [
    {
      label: '京都 · 2022',
      src: 'https://images.unsplash.com/photo-1504788363733-507549153474?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: '京都 · 2016',
      src: 'https://images.unsplash.com/photo-1470123808288-1e59739d9357?auto=format&fit=crop&w=800&q=80'
    }
  ];

  pairs.forEach((item) => {
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

function renderHighLightsList() {
  const highlights = document.getElementById('highlights');
  const exif = document.createElement('p');
  exif.className = 'small';
  exif.textContent = 'EXIF 自动提取：拍摄时间与 GPS 坐标已写入时间轴，无需手动输入。';
  highlights.appendChild(exif);
}

function init() {
  renderMap();
  renderTimeline();
  renderGallery();
  renderHighlights();
  renderHighLightsList();
  renderStories();
  renderStats();
  renderAchievements();
  renderTags();
  renderPassport();
  renderThenNow();
  renderHeatmap('heatmap', heatmapData);
  renderMiniHeatmap();
}

document.addEventListener('DOMContentLoaded', init);
