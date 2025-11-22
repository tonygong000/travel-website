# 旅迹护照（Travel Passport）

一个以「时空坐标 + 记忆叙事」为核心的旅行档案站点示例。页面涵盖地图标记、时间轴、图集、高光时刻、成就系统、护照印章墙和年度热力图
等模块，方便用设计和数据记录旅途。

## 使用方式
1. 进入项目根目录（确保当前目录能看到 `index.html`/`script.js`/`styles.css`）：
   ```bash
   cd travel-website
   ```
2. 在当前目录启动静态服务器（任选其一）：
   - Python: `python -m http.server 8000`
   - Node: `npx serve .`
   如果你在父级目录启动，可加上 `--directory travel-website` 参数，例如 `python -m http.server 8000 --directory travel-website`。
3. 浏览器访问 `http://localhost:8000`（或 `http://localhost:8000/travel-website`，取决于启动路径），即可看到示例页面而非文件列表。

## 主要功能
- **Where & When**：基于经纬度的地图描点 + 时间轴。
- **Memories**：封面图、精选图集、EXIF 自动提取说明、高光时刻与故事卡。
- **Gamification**：国家/大洲统计、里程、重访率、交通方式与成就徽章。
- **Tags & Vibe**：同伴、旅行风格、推荐指数、二刷标记与筛选。
- **创意功能**：护照印章墙、「此时彼刻」对比、GitHub 风格年度热力图。

## 自定义数据
所有示例数据集中在 `script.js` 顶部 `journeys` 数组，可添加或调整经纬度、时间、图像与标签，页面会自动刷新对应模块。
