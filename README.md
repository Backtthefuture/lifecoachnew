# 生活教练AI网站

这是一个基于火山方舟DeepSeek R1 API的生活教练网站，通过与AI对话，获取个人成长建议和指导。

## 项目结构

```
lifecoachnew/
├── README.md          # 项目说明文档
├── index.html         # 网站主页面
├── styles.css         # 网站样式
├── scripts.js         # 前端交互脚本
├── server.js          # Node.js后端服务器
├── package.json       # 项目依赖配置
└── .env               # 环境变量配置（包含API密钥）
```

## 功能特点

- 简洁美观的用户界面
- 实时AI对话功能
- 流式输出响应（打字机效果）
- 历史对话记录保存
- 移动端响应式设计

## 安装与运行

1. 安装依赖：
```
npm install
```

2. 配置环境变量：
创建`.env`文件并添加您的API密钥：
```
API_KEY=your_api_key_here
```

3. 启动服务器：
```
node server.js
```

4. 在浏览器中访问：
```
http://localhost:3000
```

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 后端：Node.js, Express
- API：火山方舟DeepSeek R1

## 注意事项

- API请求超时设置为60秒
- 流式输出已启用
- 温度参数设置为0.6
