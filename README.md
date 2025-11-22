# 旅迹护照（Travel Passport）

一个以「时空坐标 + 记忆叙事」为核心的旅行档案站点示例。页面涵盖地图标记、时间轴、图集、高光时刻、成就系统、护照印章墙和年度热力图
等模块，方便用设计和数据记录旅途。已接入 Node.js + SQLite 的简易 API，可在界面中读取数据库数据并支持新增旅程。

## 使用方式（动态版）
1. 进入项目根目录：
   ```bash
   cd travel-website
   ```
2. 安装依赖并初始化数据库（会写入示例旅程数据）：
   ```bash
   npm install
   npm run seed
   ```
3. 启动带 API 的本地服务：
   ```bash
   npm start
   ```
   浏览器访问 `http://localhost:3000`，页面将通过 `/api/journeys` 动态读取数据库中的旅程数据。
4. 新增旅程（可选）：向 `http://localhost:3000/api/journeys` 发送 `POST` 请求，JSON 结构参考示例字段（必填：`id`、`title`、`location`、`country`、`continent`、`city`、`lat`、`lng`、`start`、`end`）。

> 如果仍想查看静态版本，可用 Python/Node 静态服务器直接打开，但因为缺少 API 会显示“无法加载旅程数据”。

## 主要功能
- **Where & When**：基于经纬度的地图描点 + 时间轴。
- **Memories**：封面图、精选图集、EXIF 自动提取说明、高光时刻与故事卡。
- **Gamification**：国家/大洲统计、里程、重访率、交通方式与成就徽章。
- **Tags & Vibe**：同伴、旅行风格、推荐指数、二刷标记与筛选。
- **创意功能**：护照印章墙、「此时彼刻」对比、GitHub 风格年度热力图。

## 自定义数据
- 默认示例数据会在数据库为空时自动写入（运行 `npm run seed` 或首次 `npm start`）。
- 你可以通过 `POST /api/journeys` 写入新的旅程记录，或直接用 SQLite GUI/CLI 修改 `data.db`。
- 前端页面会实时从 `/api/journeys` 拉取数据，无需改动 `script.js`。
