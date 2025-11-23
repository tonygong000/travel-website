let journeys = [];
let heatmapData = [];
let passportStamps = [];
let tagFilters = ['全部'];
let recordButtonsBound = false;
let editingJourneyId = '';
let mapState = {
  scale: 1,
  panX: 0,
  panY: 0,
  focus: { lat: 20, lng: 0 },
  selectedCountry: '',
  view: 'world',
  animateRoute: true
};

const mapCache = {
  key: '',
  points: null
};

const focusableCountries = [
  { key: 'usa', label: '美国', lat: 39.8, lng: -98.6, zoom: 3.6 },
  { key: 'china', label: '中国', lat: 35.8, lng: 103.8, zoom: 3.7 },
  { key: 'japan', label: '日本', lat: 37.2, lng: 139.7, zoom: 4.3 },
  { key: 'europe', label: '欧洲', lat: 50.1, lng: 14.4, zoom: 3.4 }
];

function markMapDirty() {
  mapCache.key = '';
  mapCache.points = null;
}

function buildMapCacheKey() {
  return journeys
    .map((trip) => `${trip.id || trip.title || ''}-${trip.start || ''}-${trip.lat || ''}-${trip.lng || ''}`)
    .join('|');
}

function formatTripDate(trip = {}) {
  if (trip.start && trip.end && trip.start !== trip.end) return `${trip.start} → ${trip.end}`;
  return trip.start || trip.end || '';
}

function getMarkerIcon(trip, variant) {
  if (variant === 'start') return '🚩';
  if (variant === 'end') return '🏁';
  if (trip?.icon) return trip.icon;

  const transport = (trip?.transport || [])[0]?.toLowerCase?.() || '';
  const transportIcons = {
    flight: '✈️',
    plane: '✈️',
    train: '🚄',
    rail: '🚆',
    car: '🚗',
    drive: '🚗',
    bus: '🚌',
    boat: '⛵️',
    cruise: '🛳️',
    bike: '🚲',
    walk: '🚶',
    hike: '🥾',
    subway: '🚇'
  };

  return transportIcons[transport] || '📍';
}

function latLngToPosition(lat, lng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

function getChronologicalPoints() {
  const key = buildMapCacheKey();
  if (mapCache.points && mapCache.key === key) return mapCache.points;

  mapCache.points = [...journeys]
    .map((trip) => ({
      ...trip,
      lat: Number(trip.lat),
      lng: Number(trip.lng)
    }))
    .filter((trip) => Number.isFinite(trip.lat) && Number.isFinite(trip.lng))
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .map((trip, index) => {
      const pos = latLngToPosition(trip.lat, trip.lng);
      return {
        ...pos,
        id: trip.id || `trip-${index}`,
        trip,
        label: trip.city || trip.location || '未命名地点',
        date: trip.start || ''
      };
    });

  mapCache.key = key;
  return mapCache.points;
}

function clusterPoints(points) {
  const map = document.getElementById('world-map');
  const width = map?.clientWidth || 100;
  const cellPercent = ((mapState.view === 'country' ? 18 : 12) / Math.max(width, 1)) * 100;
  const grid = new Map();

  points.forEach((point) => {
    const gx = Math.floor(point.x / cellPercent);
    const gy = Math.floor(point.y / cellPercent);
    const key = `${gx},${gy}`;
    const bucket = grid.get(key) || { x: 0, y: 0, points: [] };
    bucket.points.push(point);
    bucket.x += point.x;
    bucket.y += point.y;
    grid.set(key, bucket);
  });

  return Array.from(grid.values()).map((bucket) => ({
    x: bucket.x / bucket.points.length,
    y: bucket.y / bucket.points.length,
    points: bucket.points
  }));
}

function computeBounds(points) {
  if (!points.length) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

function buildSmoothRoutePath(points) {
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
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
  map.innerHTML = `
    <div class="map-inner">
      <svg class="route-layer" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label="旅程路线"></svg>
      <div class="marker-layer" aria-label="旅程标记"></div>
    </div>
    <div class="map-controls" aria-label="地图缩放">
      <button type="button" data-zoom="in" aria-label="放大地图">＋</button>
      <button type="button" data-zoom="out" aria-label="缩小地图">－</button>
      <button type="button" data-animate-route aria-pressed="${mapState.animateRoute}" aria-label="切换路线动画">${
        mapState.animateRoute ? '⏸' : '▶'
      }</button>
      <button type="button" data-fit-bounds aria-label="适配全部足迹">⤢</button>
    </div>
    <div class="map-view-toggle" aria-label="地图视图切换">
      <button type="button" data-view="world" class="active">世界视图</button>
      <button type="button" data-view="country">国家视图</button>
    </div>
    <div class="map-country-chips" aria-label="快捷跳转国家">
      ${focusableCountries
        .map((item) => `<button type="button" data-country="${item.key}">${item.label}</button>`)
        .join('')}
    </div>
  `;
  paintMapGraphics();

  const zoomButtons = map.querySelectorAll('button[data-zoom]');
  zoomButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = btn.dataset.zoom === 'in' ? 0.4 : -0.4;
      setScale(mapState.scale + delta, { origin: { x: 50, y: 50 } });
    });
  });

  const animateToggle = map.querySelector('button[data-animate-route]');
  animateToggle?.addEventListener('click', () => {
    mapState.animateRoute = !mapState.animateRoute;
    animateToggle.setAttribute('aria-pressed', mapState.animateRoute ? 'true' : 'false');
    animateToggle.classList.toggle('active', mapState.animateRoute);
    animateToggle.textContent = mapState.animateRoute ? '⏸' : '▶';
    paintMapGraphics();
  });

  const fitButton = map.querySelector('button[data-fit-bounds]');
  fitButton?.addEventListener('click', fitMapToJourneys);

  bindCountryChips(map);
  bindViewToggle(map);
  bindWheelZoom(map);
  bindDrag(map);
  fitMapToJourneys();
}

function paintMapGraphics() {
  const map = document.getElementById('world-map');
  const mapInner = map?.querySelector('.map-inner');
  const markerLayer = mapInner?.querySelector('.marker-layer');
  const routeLayer = mapInner?.querySelector('.route-layer');
  if (!mapInner || !markerLayer || !routeLayer) return;

  markerLayer.innerHTML = '';
  routeLayer.innerHTML = '';

  const points = getChronologicalPoints();
  if (!points.length) return;

  const routePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  routePath.setAttribute('fill', 'none');
  routePath.setAttribute('stroke', 'url(#routeGradient)');
  routePath.setAttribute('stroke-width', '0.6');
  routePath.setAttribute('stroke-linecap', 'round');
  routePath.setAttribute('stroke-linejoin', 'round');
  routePath.setAttribute('vector-effect', 'non-scaling-stroke');

  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.id = 'routeGradient';
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '0%');

  const stops = [
    { offset: '0%', color: 'var(--accent)' },
    { offset: '50%', color: 'var(--accent-2)' },
    { offset: '100%', color: '#73ffea' }
  ];
  stops.forEach(({ offset, color }) => {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('stop-color', color);
    gradient.appendChild(stop);
  });

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.appendChild(gradient);
  routeLayer.appendChild(defs);

  if (points.length > 1) {
    const d = buildSmoothRoutePath(points);
    routePath.setAttribute('d', d);
    routeLayer.appendChild(routePath);

    if (mapState.animateRoute) {
      const totalLength = routePath.getTotalLength();
      routePath.style.strokeDasharray = totalLength;
      routePath.style.strokeDashoffset = totalLength;
      routePath.style.transition = 'stroke-dashoffset 1.2s ease';
      requestAnimationFrame(() => {
        routePath.style.strokeDashoffset = '0';
      });
    } else {
      routePath.style.strokeDasharray = 'none';
      routePath.style.strokeDashoffset = '0';
    }
  }

  const fragment = document.createDocumentFragment();
  const clusters = clusterPoints(points);
  const startId = points[0].id;
  const endId = points[points.length - 1]?.id;

  clusters.forEach((cluster) => {
    if (cluster.points.length === 1) {
      const point = cluster.points[0];
      const variant = point.id === startId ? 'start' : point.id === endId ? 'end' : 'single';
      fragment.appendChild(buildMarker(point, { variant }));
    } else {
      fragment.appendChild(buildClusterMarker(cluster));
    }
  });

  markerLayer.appendChild(fragment);
}

function buildMarker(point, { variant }) {
  const marker = document.createElement('button');
  marker.className = `marker ${variant === 'single' ? 'is-single' : ''}`;
  marker.type = 'button';
  marker.style.left = `${point.x}%`;
  marker.style.top = `${point.y}%`;
  marker.dataset.id = point.id;
  marker.dataset.variant = variant;
  marker.title = `${point.label} · ${formatTripDate(point.trip)}`;

  const icon = document.createElement('span');
  icon.className = 'marker-icon';
  icon.textContent = getMarkerIcon(point.trip, variant);

  const tooltip = document.createElement('div');
  tooltip.className = 'marker-tooltip';
  tooltip.innerHTML = `<strong>${point.label}</strong><br/>${formatTripDate(point.trip)} · ${point.trip?.country || ''}`;

  const label = document.createElement('div');
  label.className = 'marker-label';
  label.textContent = point.label;

  marker.appendChild(icon);
  marker.appendChild(tooltip);
  marker.appendChild(label);

  marker.addEventListener('click', () => {
    focusOnPosition(point.trip.lat, point.trip.lng, Math.min(5, mapState.scale + 0.9));
  });

  return marker;
}

function buildClusterMarker(cluster) {
  const marker = document.createElement('button');
  marker.className = 'marker cluster-marker';
  marker.type = 'button';
  marker.style.left = `${cluster.x}%`;
  marker.style.top = `${cluster.y}%`;

  const count = document.createElement('div');
  count.className = 'cluster-count';
  count.textContent = cluster.points.length;

  const tooltip = document.createElement('div');
  tooltip.className = 'marker-tooltip';
  tooltip.innerHTML = cluster.points
    .slice(0, 5)
    .map((p) => `<strong>${p.label}</strong> · ${formatTripDate(p.trip)}`)
    .join('<br/>');

  marker.appendChild(count);
  marker.appendChild(tooltip);

  marker.addEventListener('click', () => {
    const avgLat = cluster.points.reduce((sum, p) => sum + p.trip.lat, 0) / cluster.points.length;
    const avgLng = cluster.points.reduce((sum, p) => sum + p.trip.lng, 0) / cluster.points.length;
    focusOnPosition(avgLat, avgLng, Math.min(6, mapState.scale + 1));
  });

  return marker;
}

function setScale(nextScale, options = {}) {
  const map = document.getElementById('world-map');
  const mapInner = map?.querySelector('.map-inner');
  if (!mapInner) return;

  const rect = map.getBoundingClientRect();
  const { origin, pointerX, pointerY } = options;
  const oldScale = mapState.scale;
  const newScale = Math.min(6, Math.max(1, nextScale));

  if (origin && rect.width && rect.height) {
    const worldX = (origin.x - mapState.panX) / (oldScale * 100);
    const worldY = (origin.y - mapState.panY) / (oldScale * 100);
    mapState.panX = origin.x - worldX * newScale * 100;
    mapState.panY = origin.y - worldY * newScale * 100;
  } else if (pointerX !== undefined && pointerY !== undefined && rect.width && rect.height) {
    const originX = ((pointerX - rect.left) / rect.width) * 100;
    const originY = ((pointerY - rect.top) / rect.height) * 100;
    const worldX = (originX - mapState.panX) / (oldScale * 100);
    const worldY = (originY - mapState.panY) / (oldScale * 100);
    mapState.panX = originX - worldX * newScale * 100;
    mapState.panY = originY - worldY * newScale * 100;
  }

  mapState.scale = newScale;
  updateMapTransform();
}

function focusOnPosition(lat, lng, nextScale) {
  const { x, y } = latLngToPosition(lat, lng);
  mapState.focus = { lat, lng };
  mapState.view = 'country';
  mapState.selectedCountry = '';
  mapState.panX = 50 - x * (nextScale || mapState.scale);
  mapState.panY = 50 - y * (nextScale || mapState.scale);
  setScale(nextScale || mapState.scale, { origin: { x: 50, y: 50 } });
  updateViewButtons();
}

function resetWorldView() {
  const points = getChronologicalPoints();
  if (!points.length) {
    mapState.focus = { lat: 20, lng: 0 };
    mapState.view = 'world';
    mapState.selectedCountry = '';
    mapState.panX = 0;
    mapState.panY = 0;
    mapState.scale = 1.2;
    updateViewButtons();
    updateCountryButtons();
    updateMapTransform();
    return;
  }

  const bounds = computeBounds(points);
  if (!bounds) return;
  const padding = 1.2;
  const width = Math.max(bounds.maxX - bounds.minX, 4) * (1 + padding);
  const height = Math.max(bounds.maxY - bounds.minY, 2) * (1 + padding);
  const targetScale = Math.min(6, Math.max(1, Math.min(100 / width, 100 / height)));
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  mapState.focus = { lat: 20, lng: 0 };
  mapState.view = 'world';
  mapState.selectedCountry = '';
  mapState.panX = 50 - centerX * targetScale;
  mapState.panY = 50 - centerY * targetScale;
  mapState.scale = targetScale;
  updateViewButtons();
  updateCountryButtons();
  updateMapTransform();
}

function focusOnCountry(key) {
  const country = focusableCountries.find((c) => c.key === key);
  if (!country) return;
  mapState.selectedCountry = key;
  mapState.view = 'country';
  const { x, y } = latLngToPosition(country.lat, country.lng);
  mapState.focus = { lat: country.lat, lng: country.lng };
  mapState.panX = 50 - x * country.zoom;
  mapState.panY = 50 - y * country.zoom;
  mapState.scale = country.zoom;
  updateViewButtons();
  updateCountryButtons();
  updateMapTransform();
}

function bindCountryChips(map) {
  const chips = map.querySelectorAll('[data-country]');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      focusOnCountry(chip.dataset.country);
    });
  });
}

function bindViewToggle(map) {
  const viewButtons = map.querySelectorAll('[data-view]');
  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.view === 'world') {
        resetWorldView();
      } else if (btn.dataset.view === 'country' && mapState.selectedCountry) {
        focusOnCountry(mapState.selectedCountry);
      }
    });
  });
  updateViewButtons();
}

function updateViewButtons() {
  document.querySelectorAll('.map-view-toggle button').forEach((btn) => {
    const active = btn.dataset.view === mapState.view;
    btn.classList.toggle('active', active);
    if (btn.dataset.view === 'country') {
      btn.disabled = !mapState.selectedCountry;
      btn.textContent = mapState.selectedCountry ? '返回国家视图' : '国家视图';
    }
  });
}

function updateCountryButtons() {
  document.querySelectorAll('.map-country-chips button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.country === mapState.selectedCountry);
  });
}

function bindWheelZoom(map) {
  map.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.1 : -0.1;
      const next = mapState.scale * (1 + delta);
      setScale(next, { pointerX: event.clientX, pointerY: event.clientY });
    },
    { passive: false }
  );
}

function bindDrag(map) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  map.addEventListener('pointerdown', (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    map.querySelector('.map-inner').style.cursor = 'grabbing';
    map.setPointerCapture(event.pointerId);
  });

  map.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    const rect = map.getBoundingClientRect();
    const dx = ((event.clientX - startX) / rect.width) * 100;
    const dy = ((event.clientY - startY) / rect.height) * 100;
    mapState.panX += dx;
    mapState.panY += dy;
    startX = event.clientX;
    startY = event.clientY;
    updateMapTransform();
  });

  map.addEventListener('pointerup', (event) => {
    if (!isDragging) return;
    isDragging = false;
    map.querySelector('.map-inner').style.cursor = 'grab';
    map.releasePointerCapture(event.pointerId);
  });

  map.addEventListener('pointerleave', () => {
    if (!isDragging) return;
    isDragging = false;
    map.querySelector('.map-inner').style.cursor = 'grab';
  });
}

function fitMapToJourneys() {
  const points = getChronologicalPoints();
  if (!points.length) return resetWorldView();

  const bounds = computeBounds(points);
  if (!bounds) return resetWorldView();

  const padding = 1.4;
  const width = Math.max(bounds.maxX - bounds.minX, 4) * (1 + padding);
  const height = Math.max(bounds.maxY - bounds.minY, 2) * (1 + padding);
  const targetScale = Math.min(6, Math.max(1, Math.min(100 / width, 100 / height)));

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  mapState.view = 'world';
  mapState.selectedCountry = '';
  mapState.focus = { lat: 20, lng: 0 };
  mapState.scale = targetScale;
  mapState.panX = 50 - centerX * targetScale;
  mapState.panY = 50 - centerY * targetScale;

  updateViewButtons();
  updateCountryButtons();
  updateMapTransform();
}

function updateMapTransform() {
  const map = document.getElementById('world-map');
  const mapInner = map?.querySelector('.map-inner');
  if (!mapInner) return;
  mapInner.style.transform = `translate(${mapState.panX}%, ${mapState.panY}%) scale(${mapState.scale})`;
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
      <div class="timeline-actions">
        <button class="ghost-btn" data-action="edit-trip" data-id="${trip.id}">修改旅程数据</button>
        <button class="ghost-btn" data-action="upload" data-id="${trip.id}">${trip.mood ? '编辑游记' : '上传游记'}</button>
      </div>
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
      <button class="ghost-btn" data-action="upload" data-id="${trip.id}">${trip.mood ? '编辑游记' : '上传游记'}</button>
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
  markMapDirty();
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
  const headerTitle = document.getElementById('modal-title');
  const headerEyebrow = document.getElementById('modal-eyebrow');
  const submitBtn = document.getElementById('modal-submit');
  const journeyFields = Array.from(form?.querySelectorAll('.journey-field input, .journey-field textarea, .journey-field select') || []);
  const storyField = form?.querySelector('.story-field textarea[name="mood"]');
  const requiredCache = new Map();

  journeyFields.forEach((field) => {
    requiredCache.set(field.name, field.required);
  });

  function fillFormFromJourney(trip) {
    const setValue = (name, value) => {
      const field = form.elements[name];
      if (!field) return;
      if (Array.isArray(value)) field.value = value.join(', ');
      else if (value !== undefined && value !== null) field.value = typeof value === 'boolean' ? value.toString() : value;
    };

    setValue('title', trip.title);
    setValue('id', trip.id);
    setValue('country', trip.country);
    setValue('continent', trip.continent);
    setValue('city', trip.city);
    setValue('location', trip.location);
    setValue('lat', trip.lat);
    setValue('lng', trip.lng);
    setValue('start', trip.start);
    setValue('end', trip.end);
    setValue('season', trip.season);
    setValue('year', trip.year);
    setValue('heroImage', trip.heroImage);
    setValue('poi', trip.poi);
    setValue('gallery', trip.gallery);
    setValue('highlights', trip.highlights);
    setValue('companions', trip.companions);
    setValue('theme', trip.theme);
    setValue('transport', trip.transport);
    setValue('rating', trip.rating);
    setValue('revisit', trip.revisit);
    setValue('distance', trip.distance);
    setValue('mood', trip.mood);
  }

  function setFormVariant(variant) {
    if (!form) return;
    if (variant === 'story') {
      form.classList.add('story-only');
      journeyFields.forEach((field) => {
        field.disabled = true;
        field.required = false;
      });
      if (storyField) {
        storyField.disabled = false;
        storyField.required = false;
      }
    } else {
      form.classList.remove('story-only');
      journeyFields.forEach((field) => {
        field.disabled = false;
        field.required = !!requiredCache.get(field.name);
      });
      if (storyField) {
        storyField.disabled = false;
      }
    }
  }

  function openModal(journeyToEdit, options = {}) {
    form.reset();
    editingJourneyId = journeyToEdit?.id || '';
    const variant = options.variant || (journeyToEdit ? 'story' : 'full');
    form.dataset.mode = journeyToEdit ? 'edit' : 'create';
    form.dataset.variant = variant;
    const idInput = form.elements.id;
    if (journeyToEdit) {
      fillFormFromJourney(journeyToEdit);
      if (idInput) idInput.readOnly = true;
      setFormVariant(variant);
      if (variant === 'story') {
        headerEyebrow.textContent = '更新游记';
        headerTitle.textContent = '上传 / 编辑游记内容';
        submitBtn.textContent = '保存游记内容';
      } else {
        headerEyebrow.textContent = '修改旅程';
        headerTitle.textContent = '更新旅程数据表';
        submitBtn.textContent = '保存旅程数据';
      }
    } else {
      setFormVariant('full');
      if (idInput) {
        idInput.value = `trip-${Date.now()}`;
        idInput.readOnly = false;
      }
      headerEyebrow.textContent = '新旅程';
      headerTitle.textContent = '填写旅程数据表';
      submitBtn.textContent = '完成填写并写入';
    }

    feedback.textContent = '';
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('click', (event) => {
    const recordTrigger = event.target.closest('[data-action="record"]');
    const uploadTrigger = event.target.closest('[data-action="upload"]');
    const editTrigger = event.target.closest('[data-action="edit-trip"]');

    if (recordTrigger) {
      openModal();
    } else if (uploadTrigger) {
      const targetId = uploadTrigger.dataset.id;
      const targetJourney = journeys.find((trip) => trip.id === targetId);
      openModal(targetJourney, { variant: 'story' });
    } else if (editTrigger) {
      const targetId = editTrigger.dataset.id;
      const targetJourney = journeys.find((trip) => trip.id === targetId);
      openModal(targetJourney, { variant: 'full' });
    }
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
      const variant = form.dataset.variant || 'full';
      const mode = form.dataset.mode || 'create';
      let payload;

      if (variant === 'story') {
        const id = editingJourneyId || (formData.get('id') || '').toString().trim();
        if (!id) {
          throw new Error('缺少旅程 ID，无法保存游记内容。');
        }
        payload = { id, mood: formData.get('mood') || '' };
      } else {
        payload = {
          id: (formData.get('id') || '').toString().trim(),
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
      }

      const targetId = mode === 'edit' ? editingJourneyId || payload.id : payload.id;
      const endpoint = mode === 'edit' ? `/api/journeys/${encodeURIComponent(targetId)}` : '/api/journeys';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
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
      feedback.textContent = mode === 'edit' ? '已更新游记内容。' : '写入成功，已刷新最新数据。';
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
