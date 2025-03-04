// Serverless函数，用于代理API请求
const axios = require('axios');

// 设置API请求的基本URL
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

module.exports = async (req, res) => {
  // 设置CORS头，允许前端访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只处理POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    // 获取API密钥，优先使用环境变量
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: '未配置API密钥' });
    }

    // 获取请求体
    const requestData = req.body;
    
    // 检查是否为流式请求
    const isStreamRequest = requestData.stream === true;

    // 如果是流式请求，设置适当的响应头
    if (isStreamRequest) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }

    // 创建API请求配置
    const config = {
      method: 'post',
      url: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: requestData,
      timeout: 60000, // 设置超时为60秒
      responseType: isStreamRequest ? 'stream' : 'json'
    };

    // 发送请求到火山方舟API
    const response = await axios(config);

    // 处理流式响应
    if (isStreamRequest) {
      // 将API响应流直接传递给客户端
      response.data.on('data', (chunk) => {
        res.write(chunk);
      });

      response.data.on('end', () => {
        res.end();
      });

      // 处理错误
      response.data.on('error', (err) => {
        console.error('流处理错误:', err);
        res.end();
      });
    } else {
      // 处理非流式响应
      return res.status(200).json(response.data);
    }
  } catch (error) {
    console.error('API请求错误:', error);
    
    // 返回错误信息
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message || '未知错误';
    
    return res.status(statusCode).json({
      error: errorMessage,
      details: error.toString()
    });
  }
};
