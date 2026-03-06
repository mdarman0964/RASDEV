// RASDEV IDE - Main JavaScript

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

## Getting Started
1. Edit the files
2. Click Run
3. See the magic!`
};

// State
let currentFile = 'index.html';
let openTabs = ['index.html'];
let isTerminalMinimized = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updatePreview();
    setupResizers();
    setupEventListeners();
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
    // Save current content
    files[currentFile] = document.getElementById('editor').value;

    // Update current file
    currentFile = filename;

    // Update file tree active state
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });
    const fileElement = document.querySelector(`[data-file="${filename}"]`);
    if (fileElement) fileElement.classList.add('active');

    // Add tab if not exists
    if (!openTabs.includes(filename)) {
        openTabs.push(filename);
        addTab(filename);
    }

    // Update active tab
    updateActiveTab(filename);

    // Load content
    document.getElementById('editor').value = files[filename];

    // Update file type indicator
    updateFileType(filename);

    // Update preview if HTML
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

    // Update file tree
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
        // Create a complete HTML document with linked files
        let fullHTML = code;

        // Inject CSS if exists
        if (files['style.css'] && !code.includes('<link')) {
            fullHTML = code.replace('</head>', `<style>${files['style.css']}</style></head>`);
        }

        // Inject JS if exists
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
        terminal.style.height = '40px';
    } else {
        terminal.style.height = 'var(--terminal-height)';
    }
}

// Toggle preview
function togglePreview() {
    const previewPane = document.getElementById('previewPane');
    const resizer2 = document.getElementById('resizer2');

    previewPane.classList.toggle('hidden');
    resizer2.classList.toggle('hidden');
}

// Create new file
function createNewFile() {
    const filename = prompt('Enter file name (e.g., app.js, style.css):');
    if (filename && !files[filename]) {
        files[filename] = '';

        // Add to file tree
        const fileTree = document.getElementById('rootFiles');
        const div = document.createElement('div');
        div.className = 'file-item';
        div.setAttribute('data-file', filename);
        div.onclick = () => openFile(filename);

        const extension = filename.split('.').pop();
        const iconMap = {
            'html': 'html-icon fab fa-html5',
            'css': 'css-icon fab fa-css3-alt',
            'js': 'js-icon fab fa-js',
            'md': 'md-icon fab fa-markdown'
        };

        div.innerHTML = `
            <i class="${iconMap[extension] || 'fas fa-file file-icon'}"></i>
            <span>${filename}</span>
        `;

        fileTree.appendChild(div);
        openFile(filename);

        addTerminalLine(`Created new file: ${filename}`, 'success');
    } else if (files[filename]) {
        alert('File already exists!');
    }
}

// Update cursor position
function updateCursorPosition() {
    const editor = document.getElementById('editor');
    const text = editor.value.substring(0, editor.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;

    document.getElementById('cursorPos').textContent = `Ln ${line}, Col ${col}`;
}

// Update file type indicator
function updateFileType(filename) {
    const extension = filename.split('.').pop().toUpperCase();
    document.getElementById('fileType').textContent = extension;
}

// Setup resizers
function setupResizers() {
    const resizer1 = document.getElementById('resizer1');
    const resizer2 = document.getElementById('resizer2');
    const sidebar = document.getElementById('sidebar');
    const previewPane = document.getElementById('previewPane');

    let isResizing = false;
    let currentResizer = null;

    resizer1.addEventListener('mousedown', (e) => {
        isResizing = true;
        currentResizer = 'sidebar';
        document.body.style.cursor = 'col-resize';
    });

    resizer2.addEventListener('mousedown', (e) => {
        isResizing = true;
        currentResizer = 'preview';
        document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        if (currentResizer === 'sidebar') {
            const newWidth = Math.max(200, Math.min(400, e.clientX));
            sidebar.style.width = newWidth + 'px';
        } else if (currentResizer === 'preview') {
            const newWidth = Math.max(300, Math.min(600, window.innerWidth - e.clientX));
            previewPane.style.width = newWidth + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        currentResizer = null;
        document.body.style.cursor = 'default';
    });
}

// Window resize handler
window.addEventListener('resize', () => {
    // Adjust layout on window resize
});

// Prevent accidental tab close
window.addEventListener('beforeunload', (e) => {
    if (Object.keys(files).some(f => files[f] !== '')) {
        e.preventDefault();
        e.returnValue = '';
    }
});
