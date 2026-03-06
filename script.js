
# script.js - Updated with AI Chat functionality
script_js = '''// RASDEV IDE - Main JavaScript with AI Chat

// File storage
const files = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RASDEV Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to RASDEV</h1>
        <p>This is your development environment</p>
        <button class="btn" onclick="showMessage()">Click Me</button>
    </div>
    <script src="script.js"><\/script>
</body>
</html>`,
    
    'style.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container {
    background: white;
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

p {
    color: #666;
    margin-bottom: 2rem;
}

.btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.3s;
}

.btn:hover {
    transform: scale(1.05);
}`,
    
    'script.js': `function showMessage() {
    alert('Hello from RASDEV! 🚀');
    console.log('Button clicked at:', new Date().toLocaleString());
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('RASDEV app initialized!');
});`,
    
    'README.md': `# RASDEV Project

This is a sample project created with RASDEV IDE.

## Features
- Live preview
- Code editing
- Terminal access
- AI Assistant

## Getting Started
1. Edit the files
2. Click Run
3. Ask AI for help!`
};

// AI Chat State
let currentAIModel = 'gpt4';
let aiChatHistory = [];
let isAIChatOpen = false;

// IDE State
let currentFile = 'index.html';
let openTabs = ['index.html'];
let isTerminalMinimized = false;

// AI Responses (Simulated)
const aiResponses = {
    'hello': "👋 Hello! I'm your AI coding assistant. How can I help you today?",
    'hi': "Hi there! Ready to help you code. What are you working on?",
    'help': "I can help you with:\n• Writing and debugging code\n• Explaining programming concepts\n• Code review and optimization\n• Generating documentation\n• Answering technical questions\n\nJust tell me what you need!",
    'debug': "I can help debug your code. Please share:\n1. The error message you're seeing\n2. The relevant code snippet\n3. What you expected to happen",
    'explain': "I'd be happy to explain! Which concept or code would you like me to clarify?",
    'optimize': "I can help optimize your code. Please share the code you'd like me to review.",
    'default': "I understand. Let me help you with that. Could you provide more details or share the specific code you're working with?"
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updatePreview();
    setupResizers();
    setupEventListeners();
    setupAIChat();
    updateCursorPosition();
});

// Setup event listeners
function setupEventListeners() {
    const editor = document.getElementById('editor');
    
    // Auto-save on input
    editor.addEventListener('input', () => {
        files[currentFile] = editor.value;
        if (currentFile.endsWith('.html')) {
            updatePreview();
        }
        updateCursorPosition();
    });
    
    // Cursor position update
    editor.addEventListener('keyup', updateCursorPosition);
    editor.addEventListener('click', updateCursorPosition);
    
    // Keyboard shortcuts
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 2;
        }
        
        // Ctrl/Cmd + S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            addTerminalLine('File saved ✓', 'success');
        }
        
        // Ctrl/Cmd + Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
    });
    
    // Terminal tabs
    document.querySelectorAll('.terminal-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Setup AI Chat
function setupAIChat() {
    const aiInput = document.getElementById('aiInput');
    
    // Auto-resize textarea
    aiInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Send on Enter (Shift+Enter for new line)
    aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage();
        }
    });
}

// Toggle AI Chat
function toggleAIChat() {
    const aiSidebar = document.getElementById('aiSidebar');
    const aiBtn = document.querySelector('.ai-btn');
    const resizer3 = document.getElementById('resizer3');
    
    isAIChatOpen = !isAIChatOpen;
    
    if (isAIChatOpen) {
        aiSidebar.classList.add('open');
        aiBtn.classList.add('active');
        resizer3.classList.remove('hidden');
        document.getElementById('aiInput').focus();
    } else {
        aiSidebar.classList.remove('open');
        aiBtn.classList.remove('active');
        resizer3.classList.add('hidden');
    }
}

// Change AI Model
function changeAIModel() {
    const select = document.getElementById('aiModel');
    currentAIModel = select.value;
    
    const modelNames = {
        'gpt4': 'GPT-4',
        'gpt35': 'GPT-3.5',
        'claude': 'Claude 3',
        'gemini': 'Gemini Pro',
        'codellama': 'Code Llama'
    };
    
    addSystemMessage(`🤖 Switched to ${modelNames[currentAIModel]} model`);
}

// Send AI Message
function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addUserMessage(message);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI response
    setTimeout(() => {
        removeTypingIndicator();
        generateAIResponse(message);
    }, 1500 + Math.random() * 1000);
}

// Add user message to chat
function addUserMessage(text) {
    const container = document.getElementById('aiChatContainer');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message user';
    messageDiv.innerHTML = `
        <div class="ai-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="ai-content">
            <p>${escapeHtml(text)}</p>
        </div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
    
    // Save to history
    aiChatHistory.push({ role: 'user', content: text });
}

// Add AI message to chat
function addAIMessage(text) {
    const container = document.getElementById('aiChatContainer');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message';
    messageDiv.innerHTML = `
        <div class="ai-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="ai-content">
            ${formatAIResponse(text)}
        </div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
    
    // Save to history
    aiChatHistory.push({ role: 'assistant', content: text });
}

// Add system message
function addSystemMessage(text) {
    const container = document.getElementById('aiChatContainer');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message system';
    messageDiv.style.opacity = '0.7';
    messageDiv.innerHTML = `
        <div class="ai-avatar" style="background: var(--bg-tertiary);">
            <i class="fas fa-info" style="color: var(--text-secondary);"></i>
        </div>
        <div class="ai-content" style="background: var(--bg-tertiary); font-size: 12px;">
            <p>${text}</p>
        </div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const container = document.getElementById('aiChatContainer');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="ai-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="ai-content typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    container.appendChild(typingDiv);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// Generate AI Response
function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    let response = aiResponses['default'];
    
    // Check for keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = aiResponses['hello'];
    } else if (lowerMessage.includes('help')) {
        response = aiResponses['help'];
    } else if (lowerMessage.includes('debug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
        response = aiResponses['debug'];
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how to')) {
        response = aiResponses['explain'];
    } else if (lowerMessage.includes('optimize') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
        response = aiResponses['optimize'];
    } else if (lowerMessage.includes('html')) {
        response = "HTML (HyperText Markup Language) is the standard markup language for web pages. Here's a basic structure:\n\n<code>&lt;!DOCTYPE html&gt;<br>&lt;html&gt;<br>&nbsp;&nbsp;&lt;head&gt;<br>&nbsp;&nbsp;&nbsp;&nbsp;&lt;title&gt;Page Title&lt;/title&gt;<br>&nbsp;&nbsp;&lt;/head&gt;<br>&nbsp;&nbsp;&lt;body&gt;<br>&nbsp;&nbsp;&nbsp;&nbsp;&lt;h1&gt;Hello World&lt;/h1&gt;<br>&nbsp;&nbsp;&lt;/body&gt;<br>&lt;/html&gt;</code>";
    } else if (lowerMessage.includes('css')) {
        response = "CSS (Cascading Style Sheets) is used to style HTML elements. You can use it to control layout, colors, fonts, and more.\n\nExample:\n<code>body {<br>&nbsp;&nbsp;background: #f0f0f0;<br>&nbsp;&nbsp;font-family: Arial;<br>}</code>";
    } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
        response = "JavaScript is a programming language that enables interactive web pages.\n\nExample function:\n<code>function greet(name) {<br>&nbsp;&nbsp;return 'Hello, ' + name + '!';<br>}<br><br>console.log(greet('World'));</code>";
    } else if (lowerMessage.includes('code') || lowerMessage.includes('write')) {
        response = "I can help you write code! What specific functionality do you need? For example:\n• A navigation menu\n• A form validation\n• An API call\n• A responsive layout";
    }
    
    addAIMessage(response);
}

// Format AI Response (convert newlines to HTML)
function formatAIResponse(text) {
    // Convert code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Convert inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert newlines to <br> or <p> tags
    const paragraphs = text.split('\n\n');
    return paragraphs.map(p => {
        if (p.startsWith('<pre>')) return p;
        if (p.startsWith('•')) {
            const items = p.split('\n').map(item => `<li>${item.substring(2)}</li>`).join('');
            return `<ul>${items}</ul>`;
        }
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll chat to bottom
function scrollToBottom() {
    const container = document.getElementById('aiChatContainer');
    container.scrollTop = container.scrollHeight;
}

// Clear AI Chat
function clearAIChat() {
    const container = document.getElementById('aiChatContainer');
    container.innerHTML = `
        <div class="ai-message system">
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-content">
                <p>👋 Hello! I'm your AI coding assistant. I can help you with:</p>
                <ul>
                    <li>Writing & debugging code</li>
                    <li>Explaining concepts</li>
                    <li>Code review & optimization</li>
                    <li>Generating documentation</li>
                </ul>
                <p>How can I help you today?</p>
            </div>
        </div>
    `;
    aiChatHistory = [];
}

// Attach file to AI chat
function attachFile() {
    const fileNames = Object.keys(files).join(', ');
    const message = `📎 Currently open files: ${fileNames}\n\nWhich file would you like me to review?`;
    addSystemMessage(message);
}

// Toggle folder
function toggleFolder(element) {
    const icon = element.querySelector('.fa-caret-down, .fa-caret-right');
    const nextElement = element.nextElementSibling;
    
    if (icon.classList.contains('fa-caret-right')) {
        icon.classList.remove('fa-caret-right');
        icon.classList.add('fa-caret-down');
        element.classList.add('open');
        if (nextElement) nextElement.classList.remove('hidden');
    } else {
        icon.classList.remove('fa-caret-down');
        icon.classList.add('fa-caret-right');
        element.classList.remove('open');
        if (nextElement) nextElement.classList.add('hidden');
    }
}

// Open file
function openFile(filename) {
    files[currentFile] = document.getElementById('editor').value;
    currentFile = filename;
    
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    const fileElement = document.querySelector(`[data-file="${filename}"]`);
    if (fileElement) fileElement.classList.add('active');
    
    if (!openTabs.includes(filename)) {
        openTabs.push(filename);
        addTab(filename);
    }
    
    updateActiveTab(filename);
    document.getElementById('editor').value = files[filename];
    updateFileType(filename);
    
    if (filename.endsWith('.html')) {
        updatePreview();
    }
}

// Add tab
function addTab(filename) {
    const tabsContainer = document.getElementById('tabs');
    const extension = filename.split('.').pop();
    
    const iconMap = {
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt',
        'js': 'fab fa-js',
        'md': 'fab fa-markdown'
    };
    
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.setAttribute('data-file', filename);
    tab.innerHTML = `
        <i class="${iconMap[extension] || 'fas fa-file'}"></i>
        <span>${filename}</span>
        <i class="fas fa-times close-tab" onclick="closeTab(event, '${filename}')"></i>
    `;
    
    tab.addEventListener('click', (e) => {
        if (!e.target.classList.contains('close-tab')) {
            switchTab(filename);
        }
    });
    
    tabsContainer.appendChild(tab);
}

// Switch tab
function switchTab(filename) {
    files[currentFile] = document.getElementById('editor').value;
    currentFile = filename;
    document.getElementById('editor').value = files[filename];
    updateActiveTab(filename);
    updateFileType(filename);
    
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    const fileItem = document.querySelector(`[data-file="${filename}"]`);
    if (fileItem) fileItem.classList.add('active');
    
    if (filename.endsWith('.html')) {
        updatePreview();
    }
}

// Update active tab
function updateActiveTab(filename) {
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab.getAttribute('data-file') === filename) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// Close tab
function closeTab(event, filename) {
    event.stopPropagation();
    const index = openTabs.indexOf(filename);
    openTabs.splice(index, 1);
    
    const tab = document.querySelector(`.tab[data-file="${filename}"]`);
    if (tab) tab.remove();
    
    if (currentFile === filename && openTabs.length > 0) {
        switchTab(openTabs[0]);
    }
}

// Update preview
function updatePreview() {
    const code = document.getElementById('editor').value;
    const preview = document.getElementById('preview');
    
    if (currentFile.endsWith('.html')) {
        let fullHTML = code;
        
        if (files['style.css'] && !code.includes('<link')) {
            fullHTML = code.replace('</head>', `<style>${files['style.css']}</style></head>`);
        }
        
        if (files['script.js'] && !code.includes('<script')) {
            fullHTML = fullHTML.replace('</body>', `<script>${files['script.js']}<\/script></body>`);
        }
        
        const blob = new Blob([fullHTML], { type: 'text/html' });
        preview.src = URL.createObjectURL(blob);
    }
}

// Refresh preview
function refreshPreview() {
    updatePreview();
    addTerminalLine('Preview refreshed', 'info');
}

// Run code
function runCode() {
    updatePreview();
    addTerminalLine('🏃 Running application...', 'info');
    
    setTimeout(() => {
        addTerminalLine('✓ Server started at http://localhost:3000', 'success');
        addTerminalLine('✓ Build completed successfully!', 'success');
        addTerminalLine(`⏱️  Compiled in ${(Math.random() * 100 + 50).toFixed(0)}ms`, 'info');
    }, 500);
}

// Add terminal line
function addTerminalLine(text, type = 'normal') {
    const terminal = document.getElementById('terminal');
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    if (type === 'success') {
        line.innerHTML = `<span style="color: #4ade80;">${text}</span>`;
    } else if (type === 'error') {
        line.innerHTML = `<span style="color: #f87171;">${text}</span>`;
    } else if (type === 'info') {
        line.innerHTML = `<span style="color: #60a5fa;">${text}</span>`;
    } else if (type === 'output') {
        line.innerHTML = `<span class="output">${text}</span>`;
    } else {
        line.innerHTML = `
            <span class="prompt">➜</span>
            <span class="path">my-project</span>
            <span style="color: var(--text-secondary);">${text}</span>
        `;
    }
    
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

// Clear terminal
function clearTerminal() {
    const terminal = document.getElementById('terminal');
    terminal.innerHTML = `
        <div class="terminal-line">
            <span class="prompt">➜</span>
            <span class="path">~</span>
        </div>
    `;
}

// Toggle terminal
function toggleTerminal() {
    const terminal = document.getElementById('terminalSection');
    isTerminalMinimized = !isTerminalMinimized;
    
    if (isTerminalMinimized) {
        termin
