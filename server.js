const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'data.db');
let db;

function getDb() {
  if (!db) {
    const exists = fs.existsSync(DB_PATH);
    db = new sqlite3.Database(DB_PATH);
    if (!exists) {
      console.log('Creating new database at', DB_PATH);
    }
  }
  return db;
}

function run(dbInstance, sql, params = []) {
  return new Promise((resolve, reject) => {
    dbInstance.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(dbInstance, sql, params = []) {
  return new Promise((resolve, reject) => {
    dbInstance.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(dbInstance, sql, params = []) {
  return new Promise((resolve, reject) => {
    dbInstance.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

const sampleJourneys = [
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

function normalizeRow(row) {
  const parseJson = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  };

  return {
    ...row,
    poi: parseJson(row.poi),
    gallery: parseJson(row.gallery),
    highlights: parseJson(row.highlights),
    companions: parseJson(row.companions),
    theme: parseJson(row.theme),
    transport: parseJson(row.transport),
    revisit: Boolean(row.revisit)
  };
}

async function seedDatabase(dbInstance) {
  await run(
    dbInstance,
    `CREATE TABLE IF NOT EXISTS journeys (
      id TEXT PRIMARY KEY,
      title TEXT,
      location TEXT,
      country TEXT,
      continent TEXT,
      city TEXT,
      poi TEXT,
      lat REAL,
      lng REAL,
      start TEXT,
      end TEXT,
      season TEXT,
      year INTEGER,
      heroImage TEXT,
      gallery TEXT,
      highlights TEXT,
      companions TEXT,
      theme TEXT,
      transport TEXT,
      rating INTEGER,
      revisit INTEGER,
      distance INTEGER,
      mood TEXT
    )`
  );

  const existing = await get(dbInstance, 'SELECT COUNT(*) as count FROM journeys');
  if (existing && existing.count > 0) return;

  for (const trip of sampleJourneys) {
    await run(
      dbInstance,
      `INSERT OR REPLACE INTO journeys (
        id, title, location, country, continent, city, poi, lat, lng, start, end, season, year,
        heroImage, gallery, highlights, companions, theme, transport, rating, revisit, distance, mood
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trip.id,
        trip.title,
        trip.location,
        trip.country,
        trip.continent,
        trip.city,
        JSON.stringify(trip.poi),
        trip.lat,
        trip.lng,
        trip.start,
        trip.end,
        trip.season,
        trip.year,
        trip.heroImage,
        JSON.stringify(trip.gallery),
        JSON.stringify(trip.highlights),
        JSON.stringify(trip.companions),
        JSON.stringify(trip.theme),
        JSON.stringify(trip.transport),
        trip.rating,
        trip.revisit ? 1 : 0,
        trip.distance,
        trip.mood
      ]
    );
  }
  console.log('Seeded journeys table with sample data.');
}

async function initDb() {
  const dbInstance = getDb();
  await seedDatabase(dbInstance);
  return dbInstance;
}

async function listJourneys() {
  const rows = await all(getDb(), 'SELECT * FROM journeys ORDER BY start DESC');
  return rows.map(normalizeRow);
}

async function addJourney(payload) {
  const journey = {
    ...payload,
    poi: payload.poi || [],
    gallery: payload.gallery || [],
    highlights: payload.highlights || [],
    companions: payload.companions || [],
    theme: payload.theme || [],
    transport: payload.transport || [],
    revisit: payload.revisit ? 1 : 0
  };

  const required = ['id', 'title', 'location', 'country', 'continent', 'city', 'lat', 'lng', 'start', 'end'];
  const missing = required.filter((field) => journey[field] === undefined || journey[field] === null || journey[field] === '');
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }

  await run(
    getDb(),
    `INSERT OR REPLACE INTO journeys (
      id, title, location, country, continent, city, poi, lat, lng, start, end, season, year,
      heroImage, gallery, highlights, companions, theme, transport, rating, revisit, distance, mood
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      journey.id,
      journey.title,
      journey.location,
      journey.country,
      journey.continent,
      journey.city,
      JSON.stringify(journey.poi),
      journey.lat,
      journey.lng,
      journey.start,
      journey.end,
      journey.season || '',
      journey.year || new Date(journey.start).getFullYear(),
      journey.heroImage || '',
      JSON.stringify(journey.gallery),
      JSON.stringify(journey.highlights),
      JSON.stringify(journey.companions),
      JSON.stringify(journey.theme),
      JSON.stringify(journey.transport),
      journey.rating || 0,
      journey.revisit ? 1 : 0,
      journey.distance || 0,
      journey.mood || ''
    ]
  );

  const [inserted] = await all(getDb(), 'SELECT * FROM journeys WHERE id = ?', [journey.id]);
  return normalizeRow(inserted);
}

async function updateJourney(id, payload) {
  const existingRow = await get(getDb(), 'SELECT * FROM journeys WHERE id = ?', [id]);
  if (!existingRow) {
    const error = new Error('Journey not found');
    error.status = 404;
    throw error;
  }

  const existing = normalizeRow(existingRow);

  const journey = {
    ...existing,
    ...payload,
    id,
    poi: payload.poi || existing.poi || [],
    gallery: payload.gallery || existing.gallery || [],
    highlights: payload.highlights || existing.highlights || [],
    companions: payload.companions || existing.companions || [],
    theme: payload.theme || existing.theme || [],
    transport: payload.transport || existing.transport || [],
    revisit: payload.revisit !== undefined ? (payload.revisit ? 1 : 0) : existing.revisit
  };

  const required = ['id', 'title', 'location', 'country', 'continent', 'city', 'lat', 'lng', 'start', 'end'];
  const missing = required.filter((field) => journey[field] === undefined || journey[field] === null || journey[field] === '');
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }

  await run(
    getDb(),
    `UPDATE journeys
     SET title = ?, location = ?, country = ?, continent = ?, city = ?, poi = ?, lat = ?, lng = ?, start = ?, end = ?, season = ?,
         year = ?, heroImage = ?, gallery = ?, highlights = ?, companions = ?, theme = ?, transport = ?, rating = ?, revisit = ?,
         distance = ?, mood = ?
     WHERE id = ?`,
    [
      journey.title,
      journey.location,
      journey.country,
      journey.continent,
      journey.city,
      JSON.stringify(journey.poi),
      journey.lat,
      journey.lng,
      journey.start,
      journey.end,
      journey.season || '',
      journey.year || new Date(journey.start).getFullYear(),
      journey.heroImage || '',
      JSON.stringify(journey.gallery),
      JSON.stringify(journey.highlights),
      JSON.stringify(journey.companions),
      JSON.stringify(journey.theme),
      JSON.stringify(journey.transport),
      journey.rating || 0,
      journey.revisit ? 1 : 0,
      journey.distance || 0,
      journey.mood || '',
      id
    ]
  );

  const [updated] = await all(getDb(), 'SELECT * FROM journeys WHERE id = ?', [id]);
  return normalizeRow(updated);
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname)));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/journeys', async (req, res, next) => {
    try {
      const journeys = await listJourneys();
      res.json({ journeys });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/journeys', async (req, res, next) => {
    try {
      const saved = await addJourney(req.body);
      res.status(201).json({ journey: saved });
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/journeys/:id', async (req, res, next) => {
    try {
      const saved = await updateJourney(req.params.id, req.body);
      res.json({ journey: saved });
    } catch (error) {
      next(error);
    }
  });

  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Server error' });
  });

  app.listen(PORT, () => {
    console.log(`Travel Passport server running at http://localhost:${PORT}`);
  });
}

if (process.argv.includes('--init-only')) {
  initDb()
    .then(() => {
      console.log('Database initialized.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize database', error);
      process.exit(1);
    });
} else {
  startServer();
}
