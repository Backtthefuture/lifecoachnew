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
      console.error('API密钥未配置');
      return res.status(500).json({ error: '未配置API密钥，请在Vercel控制台添加API_KEY环境变量' });
    }

    // 获取请求体
    const requestData = req.body;
    
    if (!requestData || !requestData.messages) {
      return res.status(400).json({ error: '请求格式不正确，缺少messages字段' });
    }
    
    // 检查是否为流式请求
    const isStreamRequest = requestData.stream === true;

    // 如果是流式请求，设置适当的响应头
    if (isStreamRequest) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }

    console.log(`开始请求DeepSeek API，流式输出: ${isStreamRequest}, 消息数: ${requestData.messages.length}`);

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
    console.log('DeepSeek API请求成功');

    // 处理流式响应
    if (isStreamRequest) {
      // 将API响应流直接传递给客户端
      response.data.on('data', (chunk) => {
        res.write(chunk);
      });

      response.data.on('end', () => {
        console.log('流式响应完成');
        res.end();
      });

      // 处理错误
      response.data.on('error', (err) => {
        console.error('流处理错误:', err);
        // 尝试向客户端发送错误信息
        try {
          res.write(`data: {"error": "流处理错误: ${err.message}"}\n\n`);
          res.end();
        } catch (writeErr) {
          console.error('无法写入错误响应:', writeErr);
          res.end();
        }
      });
    } else {
      // 处理非流式响应
      console.log('非流式响应完成');
      return res.status(200).json(response.data);
    }
  } catch (error) {
    console.error('API请求错误:', error);
    
    // 返回详细的错误信息
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message || '未知错误';
    
    // 尝试提供更具体的错误信息
    let detailedError = '请求处理失败';
    
    if (error.code === 'ECONNABORTED') {
      detailedError = '请求超时，DeepSeek API响应时间过长';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      detailedError = '无法连接到DeepSeek API服务器';
    } else if (statusCode === 401) {
      detailedError = 'API密钥无效或未授权';
    } else if (statusCode === 429) {
      detailedError = 'API请求次数超限，请稍后再试';
    }
    
    return res.status(statusCode).json({
      error: errorMessage,
      details: detailedError,
      trace: error.toString()
    });
  }
};
