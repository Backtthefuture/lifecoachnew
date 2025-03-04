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
├── api/               # Serverless函数目录
│   └── proxy.js       # API代理Serverless函数
├── vercel.json        # Vercel部署配置
├── package.json       # 项目依赖配置
└── .env               # 环境变量配置（包含API密钥）
```

## 功能特点

- 简洁美观的用户界面
- 实时AI对话功能
- 流式输出响应（打字机效果）
- 历史对话记录保存
- 移动端响应式设计
- 支持Vercel云端部署

## 本地安装与运行

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

## Vercel部署指南

### 方法一：使用Vercel CLI

1. 全局安装Vercel CLI：
```
npm install -g vercel
```

2. 在项目目录下登录Vercel：
```
vercel login
```

3. 部署项目：
```
vercel
```

4. 按照提示完成部署流程。

5. 在Vercel控制台添加环境变量：
   - 打开 [Vercel控制台](https://vercel.com/dashboard)
   - 选择您的项目
   - 点击"Settings" > "Environment Variables"
   - 添加环境变量：`API_KEY` = `a411daf6-b1bf-49c3-a8a9-cdedf38b6173`

### 方法二：通过GitHub仓库部署

1. 将代码推送到GitHub仓库。

2. 在Vercel控制台中点击"New Project"。

3. 导入您的GitHub仓库。

4. 配置项目：
   - 框架预设：选择"Other"
   - 构建命令：留空
   - 输出目录：留空

5. 添加环境变量：
   - 名称：`API_KEY`
   - 值：`a411daf6-b1bf-49c3-a8a9-cdedf38b6173`

6. 点击"Deploy"开始部署。

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 后端：Node.js, Express
- API：火山方舟DeepSeek R1
- 部署：支持本地和Vercel云端部署

## 常见问题解决

### API请求超时

如果遇到API请求超时（500或504错误），可能是因为：

1. DeepSeek API响应时间过长：对于复杂问题，AI需要更多时间思考。
   - 解决方案：耐心等待或简化您的问题。

2. Vercel函数执行时间限制：
   - 免费计划的函数执行时间限制为10秒
   - 我们已将配置中的`maxDuration`设置为60秒，但这需要Vercel的付费计划才能生效
   - 解决方案：升级到Vercel的付费计划，或简化AI对话内容

### 环境变量问题

如果收到"未配置API密钥"的错误，请确保：

1. 在Vercel控制台中正确添加了`API_KEY`环境变量
2. 部署后重新构建项目，以使环境变量生效

## 贡献与反馈

欢迎通过GitHub Issues提交问题和建议。
