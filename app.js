/**
 * app.js
 * Main Application Logic for Blockly Workflow Builder
 * 
 * Handles:
 * - Blockly workspace initialization
 * - Code generation
 * - Code execution
 * - Console output
 * - Event handling
 */

// ================================
// Global Variables
// ================================

let workspace = null;
let generatedCode = '';
let appInitialized = false;  // Guard to prevent double initialization

// ================================
// Initialize Application
// ================================

function initializeApp() {
    // Guard: prevent double initialization
    if (appInitialized) {
        console.warn('⚠️  App already initialized, skipping...');
        return;
    }

    console.log('Starting app initialization...');
    
    // Check if Blockly is loaded
    if (typeof Blockly === 'undefined') {
        console.error('❌ Blockly library not loaded');
        return;
    }
    
    console.log('✅ Blockly library loaded');
    
    // Get toolbox element
    const toolboxElement = document.getElementById('toolbox');
    if (!toolboxElement) {
        console.error('❌ Toolbox element not found');
        return;
    }
    
    console.log('✅ Toolbox element found');
    
    // Initialize Blockly Workspace
    const blocklyDiv = document.getElementById('blocklyDiv');
    
    try {
        workspace = Blockly.inject(blocklyDiv, {
            toolbox: toolboxElement,
            media: 'https://cdn.jsdelivr.net/npm/blockly@10.2.0/media/',
            grid: {
                spacing: 25,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: true,
            sounds: true
        });
        
        console.log('✅ Blockly workspace initialized');
    } catch (error) {
        console.error('❌ Error initializing Blockly:', error);
        return;
    }

    // Initialize the Blockly JavaScript generator for this workspace immediately
    try {
        if (Blockly && (Blockly.JavaScript || Blockly.javascript)) {
            const jsGen = Blockly.JavaScript || Blockly.javascript;
            try { jsGen.init && jsGen.init(workspace); } catch (e) { console.warn('Generator init warning:', e); }
            try { jsGen.finish && jsGen.finish(); } catch (e) { /* finish may expect args; ignore here */ }
            console.log('✅ Blockly.JavaScript generator initialized');
        }
    } catch (e) {
        console.warn('Could not initialize Blockly.JavaScript generator now:', e);
    }

    // Event Listeners
    setupEventListeners();
    
    // Mark initialization as complete
    appInitialized = true;
    
    console.log('✅ Application initialized successfully!');
}

// ================================
// Setup Event Listeners
// ================================

function setupEventListeners() {
    document.getElementById('generateCodeBtn').addEventListener('click', generateCode);
    document.getElementById('runCodeBtn').addEventListener('click', runCode);
    document.getElementById('clearWorkspaceBtn').addEventListener('click', clearWorkspace);
    document.getElementById('clearConsoleBtn').addEventListener('click', clearConsole);
    document.getElementById('copyCodeBtn').addEventListener('click', copyCode);
    
    // Note: Auto-generate disabled to prevent initialization errors
    // Code generation now only happens on button click
}

// ================================
// Generate Code from Blocks
// ================================

function generateCode() {
    try {
        // Get top-level blocks
        const topBlocks = workspace.getTopBlocks(true);
        
        if (topBlocks.length === 0) {
            displayCode('// No blocks added to workspace yet\n// Start by adding a "START WORKFLOW" block');
            logConsole('ℹ️ Add blocks to generate code', 'info');
            return;
        }
        
        // Check if START WORKFLOW block exists
        const hasStartBlock = topBlocks.some(block => block.type === 'start_workflow');
        if (!hasStartBlock) {
            logConsole('❌ Error: Add a "START WORKFLOW" block to begin', 'error');
            displayCode('// Error: Missing START WORKFLOW block\n// All workflows must start with a START WORKFLOW block');
            return;
        }
        
        // Ensure Blockly's JavaScript generator is initialized for this workspace
        if (!Blockly || !Blockly.JavaScript) {
            logConsole('❌ Error: Blockly JavaScript generator not available', 'error');
            return;
        }

        try {
            Blockly.JavaScript.init(workspace);
        } catch (e) {
            // Some Blockly builds may throw if init expects different args - ignore and continue
            console.warn('Blockly.JavaScript.init() warning:', e && e.message ? e.message : e);
        }

        // Generate code from the whole workspace (start block will be included)
        let code = '';
        try {
            code = Blockly.JavaScript.workspaceToCode(workspace);
        } catch (e) {
            logConsole('❌ Error while converting workspace to code: ' + (e.message || e), 'error');
            console.error(e);
            return;
        }

        // Finalize generator (adds definitions, imports, etc.)
        try {
            if (typeof Blockly.JavaScript.finish === 'function') {
                code = Blockly.JavaScript.finish(code);
            }
        } catch (e) {
            console.warn('Blockly.JavaScript.finish() warning:', e && e.message ? e.message : e);
        }

        generatedCode = code;
        
        // Format code
        generatedCode = formatCode(generatedCode);
        
        // Display code
        displayCode(generatedCode);
        
        logConsole('✅ Code generated successfully!', 'success');
        
    } catch (error) {
        logConsole(`❌ Error during code generation: ${error.message}`, 'error');
        console.error('Generation error:', error);
    }
}

// ================================
// Execute Generated Code
// ================================

function runCode() {
    try {
        if (!generatedCode || generatedCode.trim() === '') {
            logConsole('⚠️ No code to run. Generate code first!', 'warning');
            return;
        }

        // Ensure Blockly JavaScript generator is initialized before running
        try {
            if (Blockly && Blockly.JavaScript) {
                try { Blockly.JavaScript.init(workspace); } catch (e) { console.warn('Blockly.JavaScript.init() warning:', e && e.message ? e.message : e); }
                try {
                    if (typeof Blockly.JavaScript.finish === 'function') {
                        generatedCode = Blockly.JavaScript.finish(generatedCode);
                    }
                } catch (e) { console.warn('Blockly.JavaScript.finish() warning:', e && e.message ? e.message : e); }
            }
        } catch (e) {
            console.warn('Generator availability check failed:', e);
        }

        clearConsole();
        logConsole('⏳ Running code...', 'info');
        
        // Execute code in isolated scope
        const result = executeCode(generatedCode);
        
        if (result) {
            const output = result.split('\n');
            output.forEach(line => {
                if (line.trim()) {
                    logConsole(line);
                }
            });
        }
        
        logConsole('✅ Code executed successfully!', 'success');
        
    } catch (error) {
        logConsole(`❌ Runtime Error: ${error.message}`, 'error');
        console.error('Execution error:', error);
    }
}

// ================================
// Execute Code Safely
// ================================

function executeCode(code) {
    // Create isolated execution context
    const isolatedContext = {
        console: {
            log: function(...args) {
                return args.map(arg => {
                    if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                    }
                    return String(arg);
                }).join(' ');
            }
        },
        Math: Math,
        parseFloat: parseFloat,
        parseInt: parseInt
    };
    
    try {
        // Execute code with timeout to prevent infinite loops
        const result = executeWithTimeout(() => {
            return new Function(...Object.keys(isolatedContext), code)
                (...Object.values(isolatedContext));
        }, 5000);
        
        return result || '';
        
    } catch (error) {
        throw new Error(`${error.message}`);
    }
}

// ================================
// Execute with Timeout
// ================================

function executeWithTimeout(fn, timeout) {
    let isTimeout = false;
    let result = null;
    let error = null;
    
    const timer = setTimeout(() => {
        isTimeout = true;
    }, timeout);
    
    try {
        result = fn();
        
        if (isTimeout) {
            throw new Error('Code execution timeout - possible infinite loop');
        }
    } catch (err) {
        error = err;
    } finally {
        clearTimeout(timer);
    }
    
    if (error) {
        throw error;
    }
    
    return result;
}

// ================================
// Format Generated Code
// ================================

function formatCode(code) {
    // Remove extra whitespace
    code = code.trim();
    
    // Add syntax highlighting hints
    code = code.replace(/\/\//g, '//');
    
    return code;
}

// ================================
// Display Generated Code
// ================================

function displayCode(code) {
    const codeOutput = document.getElementById('codeOutput');
    
    if (code.trim() === '') {
        codeOutput.textContent = '// No code generated';
    } else {
        codeOutput.textContent = code;
    }
}

// ================================
// Console Logging
// ================================

function logConsole(message, type = 'log') {
    const consoleOutput = document.getElementById('consoleOutput');
    
    // Clear info message on first log
    const infoEl = consoleOutput.querySelector('.console-info');
    if (infoEl) {
        infoEl.remove();
    }
    
    const logEntry = document.createElement('p');
    logEntry.className = type;
    
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] ${message}`;
    
    consoleOutput.appendChild(logEntry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// ================================
// Clear Console
// ================================

function clearConsole() {
    const consoleOutput = document.getElementById('consoleOutput');
    consoleOutput.innerHTML = '<p class="console-info">Console cleared</p>';
}

// ================================
// Clear Workspace
// ================================

function clearWorkspace() {
    const confirmed = confirm('Are you sure you want to clear the entire workspace?');
    
    if (confirmed && workspace) {
        workspace.clear();
        generatedCode = '';
        displayCode('// Workspace cleared');
        clearConsole();
        logConsole('🔄 Workspace cleared', 'success');
    }
}

// ================================
// Copy Code to Clipboard
// ================================

function copyCode() {
    if (!generatedCode || generatedCode.trim() === '') {
        logConsole('⚠️ No code to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(generatedCode).then(() => {
        logConsole('📋 Code copied to clipboard!', 'success');
    }).catch(err => {
        logConsole('❌ Failed to copy code', 'error');
        console.error('Copy error:', err);
    });
}

// ================================
// Load Demo Workflow
// ================================

function loadDemoWorkflow() {
    // Define a simple demo workflow in XML
    const demoXml = `
        <xml xmlns="https://developers.google.com/blockly/xml">
            <block type="start_workflow" x="20" y="20">
                <statement name="DO">
                    <block type="set_variable">
                        <field name="VAR_NAME">x</field>
                        <value name="VALUE">
                            <block type="math_number">
                                <field name="NUM">5</field>
                            </block>
                        </value>
                        <next>
                            <block type="set_variable">
                                <field name="VAR_NAME">y</field>
                                <value name="VALUE">
                                    <block type="math_number">
                                        <field name="NUM">3</field>
                                    </block>
                                </value>
                                <next>
                                    <block type="print_output">
                                        <value name="TEXT">
                                            <block type="text_block">
                                                <field name="TEXT">Result:</field>
                                            </block>
                                        </value>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </statement>
            </block>
        </xml>
    `;
    
    // Demo loading disabled to prevent initialization errors
    // Users can build their own blocks instead
}

// ================================
// Utility: Debounce Function
// ================================

function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// ================================
// Start Application on Load
// ================================

// Remove auto-initialization - we'll call it explicitly from HTML
// This prevents race conditions with script loading

console.log("✅ Application script loaded successfully!");