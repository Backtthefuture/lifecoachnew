// 导入必要的模块
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
require('dotenv').config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 提供静态文件
app.use(express.static(path.join(__dirname)));

// 创建代理中间件，用于转发API请求到火山方舟
const apiProxy = createProxyMiddleware('/api', {
  target: 'https://ark.cn-beijing.volces.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api/v3/chat/completions'
  },
  // 设置超时时间为120秒，比API请求超时时间(60秒)更长，确保有足够时间处理请求
  timeout: 120000,
  onProxyReq: (proxyReq, req, res) => {
    // 添加必要的请求头
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Authorization', `Bearer ${process.env.API_KEY}`);
    
    // 如果有请求体，需要重写请求体
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // 写入请求体
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('代理请求错误:', err);
    res.status(500).send('代理请求出错: ' + err.message);
  }
});

// 使用代理中间件处理API请求
app.use('/api', apiProxy);

// 创建一个简单的API端点，用于测试服务器是否正常运行
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器运行正常' });
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
