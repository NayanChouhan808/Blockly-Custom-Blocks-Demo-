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

// ================================
// Initialize Application
// ================================

function initializeApp() {
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
            media: 'https://cdn.jsdelivr.net/npm/blockly@11.3.2/media/',
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

    // Event Listeners
    setupEventListeners();
    
    // Load demo blocks if workspace is empty
    loadDemoWorkflow();
    
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
    
    // Auto-generate code when workspace changes
    workspace.addChangeListener(debounce(() => {
        if (workspace.getTopBlocks().length > 0) {
            generateCode();
        }
    }, 500));
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
        
        // Generate code from START block
        const startBlock = topBlocks.find(block => block.type === 'start_workflow');
        
        // Get the correct generator
        const generator = Blockly.JavaScript || Blockly.javascript;
        if (!generator) {
            logConsole('❌ Error: JavaScript generator not available', 'error');
            return;
        }
        
        generatedCode = generator.blockToCode(startBlock);
        
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
    
    if (confirmed) {
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
                                            <block type="text">
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
    
    // Load demo only if workspace is empty
    if (workspace.getTopBlocks().length === 0) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(demoXml, 'text/xml');
            Blockly.Xml.domToWorkspace(xmlDoc.firstElementChild, workspace);
        } catch (error) {
            console.warn('Could not load demo workflow:', error);
        }
    }
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