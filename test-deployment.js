// 测试Vercel部署的脚本
// 使用方法: node test-deployment.js <部署URL>
// 例如: node test-deployment.js https://lifecoachnew.vercel.app

const axios = require('axios');

// 获取命令行参数中的部署URL
const deployUrl = process.argv[2];
if (!deployUrl) {
  console.error('请提供部署URL作为参数');
  console.error('使用方法: node test-deployment.js <部署URL>');
  process.exit(1);
}

console.log(`开始测试部署: ${deployUrl}`);

// 测试主页
async function testHomepage() {
  console.log('\n测试主页...');
  try {
    const response = await axios.get(deployUrl);
    console.log(`✅ 主页请求成功 (${response.status})`);
    console.log(`页面大小: ${response.data.length} 字节`);
    
    // 简单检查页面内容是否包含关键元素
    if (response.data.includes('<title>AI生活教练</title>')) {
      console.log('✅ 页面标题正确');
    } else {
      console.log('❌ 页面标题不匹配');
    }
    
    if (response.data.includes('id="chat-messages"')) {
      console.log('✅ 聊天界面元素存在');
    } else {
      console.log('❌ 聊天界面元素不存在');
    }
  } catch (error) {
    console.error(`❌ 主页请求失败: ${error.message}`);
    if (error.response) {
      console.error(`状态码: ${error.response.status}`);
    }
  }
}

// 测试API端点
async function testApiEndpoint() {
  console.log('\n测试API端点...');
  const apiUrl = `${deployUrl}/api`;
  
  try {
    // 发送一个简单的测试请求
    const response = await axios.post(apiUrl, {
      model: "deepseek-r1-250120",
      messages: [
        { role: "user", content: "你好，这是一个测试消息。请回复'测试成功'。" }
      ],
      stream: false,
      temperature: 0.6
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30秒超时
    });
    
    console.log(`✅ API请求成功 (${response.status})`);
    console.log('响应数据:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    // 检查响应是否包含预期的字段
    if (response.data.choices && response.data.choices.length > 0) {
      console.log('✅ 响应格式正确');
    } else {
      console.log('❌ 响应格式不正确');
    }
  } catch (error) {
    console.error(`❌ API请求失败: ${error.message}`);
    if (error.response) {
      console.error(`状态码: ${error.response.status}`);
      console.error('错误详情:', error.response.data);
    }
  }
}

// 运行测试
async function runTests() {
  console.log('==== Vercel部署测试 ====');
  console.log(`时间: ${new Date().toLocaleString()}`);
  console.log(`目标URL: ${deployUrl}`);
  
  await testHomepage();
  await testApiEndpoint();
  
  console.log('\n==== 测试完成 ====');
}

runTests();
