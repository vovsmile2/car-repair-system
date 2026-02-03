const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const PHOTOS_DIR = path.join(__dirname, 'photos');
const VEHICLE_FILE = path.join(DATA_DIR, '车辆信息.json');
const RECORD_FILE = path.join(DATA_DIR, '维修记录.json');

// 初始化目录和文件
function init() {
  [DATA_DIR, PHOTOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  if (!fs.existsSync(VEHICLE_FILE)) {
    fs.writeFileSync(VEHICLE_FILE, JSON.stringify([]));
  }

  if (!fs.existsSync(RECORD_FILE)) {
    fs.writeFileSync(RECORD_FILE, JSON.stringify([]));
  }
}

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// HTTP服务器
const server = http.createServer((req, res) => {
  // 处理静态文件
  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    serveStatic(req, res);
    return;
  }

  // 处理API请求
  console.log(`API Request: ${req.method} ${req.url}`);
  handleAPI(req, res);
});

// 处理静态文件
function serveStatic(req, res) {
  let filePath = '.' + req.url;

  // 处理根路径
  if (filePath === './') {
    filePath = './public/index.html';
  }
  // 处理图片路径
  else if (req.url.startsWith('/photos/')) {
    const photoPath = decodeURIComponent(req.url.substring(8));
    filePath = path.join(__dirname, 'photos', photoPath);
    console.log('Serving photo:', filePath);
  }
  // 处理其他静态文件
  else {
    filePath = './public' + req.url;
  }

  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error('Error serving file:', filePath, error);
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found: ' + req.url);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

// 处理API请求
function handleAPI(req, res) {
  const url = req.url;
  const method = req.method;

  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 解析请求体
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      // 获取所有车辆
      if (url === '/api/vehicles' && method === 'GET') {
        const vehicles = JSON.parse(fs.readFileSync(VEHICLE_FILE));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, vehicles }));

      // 添加车辆
      } else if (url === '/api/vehicles' && method === 'POST') {
        const data = JSON.parse(body);
        const vehicles = JSON.parse(fs.readFileSync(VEHICLE_FILE));

        if (vehicles.some(v => v.plate === data.plate)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '该车牌号已存在' }));
          return;
        }

        data.firstDate = new Date().toISOString().split('T')[0];
        vehicles.push(data);
        fs.writeFileSync(VEHICLE_FILE, JSON.stringify(vehicles, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: '车辆添加成功' }));

      // 获取维修记录
      } else if (url.startsWith('/api/records') && method === 'GET') {
        const records = JSON.parse(fs.readFileSync(RECORD_FILE));
        let filtered = records.reverse();

        const queryStr = url.split('?')[1] || '';
        const searchParams = new URLSearchParams(queryStr);
        const plate = searchParams.get('plate');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const fuzzy = searchParams.get('fuzzy') === 'true';

        if (plate) {
          const searchPlate = plate.toUpperCase();
          if (fuzzy) {
            // 模糊匹配：车牌号包含搜索字符串
            filtered = filtered.filter(r => r.plate.includes(searchPlate));
          } else {
            // 精确匹配：车牌号完全等于搜索字符串
            filtered = filtered.filter(r => r.plate === searchPlate);
          }
        }
        if (startDate) filtered = filtered.filter(r => r.date >= startDate);
        if (endDate) filtered = filtered.filter(r => r.date <= endDate);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, records: filtered }));

      // 添加维修记录（支持多图片上传）
      } else if (url === '/api/records' && method === 'POST') {
        const data = JSON.parse(body);
        data.date = new Date().toISOString().split('T')[0];
        data.plate = data.plate.toUpperCase();

        // 处理单张图片（兼容旧数据）
        if (data.image) {
          const imageBuffer = Buffer.from(data.image.split(',')[1], 'base64');
          const imageName = `${data.plate}_${Date.now()}.jpg`;
          const imagePath = path.join(PHOTOS_DIR, imageName);
          fs.writeFileSync(imagePath, imageBuffer);
          data.imagePath = `/photos/${imageName}`;
          delete data.image;
        }

        // 处理多张图片
        if (data.images && data.images.length > 0) {
          data.imagePaths = [];
          data.images.forEach((imgData, index) => {
            const imageBuffer = Buffer.from(imgData.split(',')[1], 'base64');
            const imageName = `${data.plate}_${Date.now()}_${index}.jpg`;
            const imagePath = path.join(PHOTOS_DIR, imageName);
            fs.writeFileSync(imagePath, imageBuffer);
            data.imagePaths.push(`/photos/${imageName}`);
          });
          delete data.images;
        }

        const records = JSON.parse(fs.readFileSync(RECORD_FILE));
        records.push(data);
        fs.writeFileSync(RECORD_FILE, JSON.stringify(records, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: '维修记录添加成功' }));

      // 按月统计收入
      } else if (url.startsWith('/api/stats/monthly') && method === 'GET') {
        const searchParams = new URLSearchParams(url.split('?')[1]);
        const year = searchParams.get('year');
        const records = JSON.parse(fs.readFileSync(RECORD_FILE));

        const monthlyStats = {};
        records.forEach(r => {
          const cost = parseFloat(r.cost) || 0;
          const recordYear = r.date.substring(0, 4);
          const recordMonth = r.date.substring(5, 7);

          if (year && recordYear !== year) return;

          const key = `${recordYear}-${recordMonth}`;
          if (!monthlyStats[key]) {
            monthlyStats[key] = { count: 0, total: 0 };
          }
          monthlyStats[key].count++;
          monthlyStats[key].total += cost;
        });

        const result = Object.keys(monthlyStats)
          .sort()
          .map(key => ({
            month: key,
            count: monthlyStats[key].count,
            total: monthlyStats[key].total.toFixed(2)
          }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, stats: result }));

      } else {
        console.log('Unknown API:', { url, method });
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'API not found', url, method }));
      }
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: error.message }));
    }
  });
}

// 初始化并启动
init();
server.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚗 汽车维修管理系统已启动');
  console.log(`📱 请在浏览器打开: http://localhost:${PORT}`);
  console.log('========================================\n');
});
