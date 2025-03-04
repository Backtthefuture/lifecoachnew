// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const clearChatButton = document.getElementById('clear-chat');
    const loadingIndicator = document.getElementById('loading-indicator');

    // 系统提示信息 - 定义AI的角色和行为
    const systemPrompt = {
        role: "system",
        content: "你是一位专业的生活教练，你的目标是通过对话帮助用户成长和发展。你应该：1) 倾听用户的问题和困惑；2) 提供有建设性的建议和指导；3) 鼓励用户反思和行动；4) 保持积极、支持性的态度；5) 在适当的时候提出深入的问题，帮助用户更好地了解自己。请确保你的回答简洁明了，重点突出，易于理解和执行。"
    };

    // 存储对话历史
    let conversationHistory = [systemPrompt];

    // 从本地存储加载对话历史
    loadConversationHistory();

    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);

    // 按Enter键发送消息（按Shift+Enter换行）
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 清除对话按钮点击事件
    clearChatButton.addEventListener('click', (e) => {
        e.preventDefault();
        clearChat();
    });

    // 发送消息函数
    function sendMessage() {
        const userMessage = userInput.value.trim();
        
        // 如果用户没有输入任何内容，则不发送
        if (!userMessage) return;
        
        // 显示用户消息
        appendMessage('user', userMessage);
        
        // 清空输入框
        userInput.value = '';
        
        // 添加用户消息到对话历史
        conversationHistory.push({
            role: "user",
            content: userMessage
        });
        
        // 保存对话历史到本地存储
        saveConversationHistory();
        
        // 显示加载指示器
        loadingIndicator.classList.add('active');
        
        // 发送请求到API
        fetchAIResponse(conversationHistory);
    }

    // 从API获取AI响应
    async function fetchAIResponse(messages) {
        try {
            // 准备请求数据
            const requestData = {
                model: "deepseek-r1-250120",
                messages: messages,
                stream: true,  // 启用流式输出
                temperature: 0.6  // 设置温度参数
            };

            // 确定API端点路径
            // 在Vercel部署环境中使用相对路径，在本地开发环境中也可以使用相同路径
            const apiEndpoint = '/api';

            // 发送请求到我们的代理服务器
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            // 检查响应状态
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }

            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = '';
            let aiMessageElement = null;

            // 创建AI消息元素
            aiMessageElement = createMessageElement('ai', '');
            chatMessages.appendChild(aiMessageElement);
            
            // 处理数据流
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                // 解码接收到的数据
                const chunk = decoder.decode(value, { stream: true });
                
                try {
                    // 处理SSE格式的数据
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            const jsonData = JSON.parse(line.substring(6));
                            
                            if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                const content = jsonData.choices[0].delta.content;
                                aiResponseText += content;
                                
                                // 更新AI消息内容
                                const messageContent = aiMessageElement.querySelector('.message-content p');
                                messageContent.innerHTML = formatMessage(aiResponseText);
                                
                                // 滚动到底部
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        }
                    }
                } catch (error) {
                    console.error('解析流数据时出错:', error);
                }
            }

            // 添加完整的AI响应到对话历史
            if (aiResponseText) {
                conversationHistory.push({
                    role: "assistant",
                    content: aiResponseText
                });
                
                // 保存对话历史到本地存储
                saveConversationHistory();
            }

        } catch (error) {
            console.error('获取AI响应时出错:', error);
            appendMessage('ai', '抱歉，我遇到了一些问题。请稍后再试。错误: ' + error.message);
        } finally {
            // 隐藏加载指示器
            loadingIndicator.classList.remove('active');
        }
    }

    // 添加消息到聊天界面
    function appendMessage(sender, text) {
        const messageElement = createMessageElement(sender, text);
        chatMessages.appendChild(messageElement);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 创建消息元素
    function createMessageElement(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.innerHTML = formatMessage(text);
        
        contentDiv.appendChild(paragraph);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }

    // 格式化消息文本（处理换行和链接）
    function formatMessage(text) {
        // 将换行符转换为<br>标签
        let formattedText = text.replace(/\n/g, '<br>');
        
        // 将URL转换为可点击的链接
        formattedText = formattedText.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        return formattedText;
    }

    // 清除聊天历史
    function clearChat() {
        // 确认是否要清除对话
        if (confirm('确定要清除所有对话历史吗？')) {
            // 清除聊天界面
            chatMessages.innerHTML = '';
            
            // 重置对话历史，只保留系统提示
            conversationHistory = [systemPrompt];
            
            // 保存到本地存储
            saveConversationHistory();
            
            // 添加欢迎消息
            appendMessage('ai', '你好！我是你的AI生活教练。我可以帮助你解决生活中的困惑，提供个人成长建议，或者只是聊聊天。请告诉我你今天想聊些什么？');
        }
    }

    // 保存对话历史到本地存储
    function saveConversationHistory() {
        localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    }

    // 从本地存储加载对话历史
    function loadConversationHistory() {
        const savedHistory = localStorage.getItem('conversationHistory');
        
        if (savedHistory) {
            try {
                conversationHistory = JSON.parse(savedHistory);
                
                // 显示历史对话
                conversationHistory.forEach(message => {
                    if (message.role === 'user') {
                        appendMessage('user', message.content);
                    } else if (message.role === 'assistant') {
                        appendMessage('ai', message.content);
                    }
                    // 不显示系统消息
                });
                
            } catch (error) {
                console.error('加载对话历史时出错:', error);
                // 如果出错，使用默认的对话历史
                conversationHistory = [systemPrompt];
            }
        } else {
            // 如果没有保存的历史，使用默认的对话历史
            conversationHistory = [systemPrompt];
        }
    }
});
