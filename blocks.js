/**
 * blocks.js
 * Custom Block Definitions for Workflow Builder
 * 
 * Defines all custom blocks:
 * 1. Start Workflow (entry block)
 * 2. Set Variable (name + value)
 * 3. Add Numbers
 * 4. Multiply Numbers
 * 5. If Condition (>, <, ==)
 * 6. Print Output
 */

console.log('🔄 Loading custom blocks...');

// Wait for Blockly to load
if (typeof Blockly === 'undefined') {
    console.error('❌ Blockly not loaded yet!');
} else {
    console.log('✅ Blockly is available');
}

// ================================
// Block Color Palette
// ================================

const BLOCK_COLORS = {
    workflow: 25,      // Blue (0-360 hue)
    math: 30,          // Orange
    logic: 120,        // Green
    io: 290            // Pink
};

// ================================
// 1. START WORKFLOW BLOCK
// ================================

Blockly.Blocks['start_workflow'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("▶️ START WORKFLOW");
        
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("do");
        
        this.setColour(BLOCK_COLORS.workflow);
        this.setTooltip("Entry point for your workflow. All blocks must connect from here.");
        this.setHelpUrl("");
    }
};

// ================================
// 2. SET VARIABLE BLOCK
// ================================

Blockly.Blocks['set_variable'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("📝 SET VARIABLE")
            .appendField(new Blockly.FieldVariable("item"), "VAR_NAME");
        
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("to");
        
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BLOCK_COLORS.workflow);
        this.setTooltip("Assign a value to a variable.");
        this.setHelpUrl("");
    }
};

// ================================
// 3. ADD NUMBERS BLOCK
// ================================

Blockly.Blocks['add_numbers'] = {
    init: function() {
        this.appendValueInput("NUM1")
            .setCheck(null)
            .appendField("➕ ADD");
        
        this.appendValueInput("NUM2")
            .setCheck(null)
            .appendField("and");
        
        this.setOutput(true, null);
        this.setColour(BLOCK_COLORS.math);
        this.setTooltip("Add two numbers together.");
        this.setHelpUrl("");
    }
};

// ================================
// 4. MULTIPLY NUMBERS BLOCK
// ================================

Blockly.Blocks['multiply_numbers'] = {
    init: function() {
        this.appendValueInput("NUM1")
            .setCheck(null)
            .appendField("✖️ MULTIPLY");
        
        this.appendValueInput("NUM2")
            .setCheck(null)
            .appendField("by");
        
        this.setOutput(true, null);
        this.setColour(BLOCK_COLORS.math);
        this.setTooltip("Multiply two numbers together.");
        this.setHelpUrl("");
    }
};

// ================================
// 5. IF CONDITION BLOCK
// ================================

Blockly.Blocks['if_condition'] = {
    init: function() {
        this.appendValueInput("CONDITION_LEFT")
            .setCheck(null)
            .appendField("❓ IF");
        
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                [">", "GREATER"],
                ["<", "LESS"],
                ["==", "EQUAL"]
            ]), "OPERATOR");
        
        this.appendValueInput("CONDITION_RIGHT")
            .setCheck(null);
        
        this.appendStatementInput("DO_TRUE")
            .setCheck(null)
            .appendField("then");
        
        this.appendStatementInput("DO_FALSE")
            .setCheck(null)
            .appendField("else");
        
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BLOCK_COLORS.logic);
        this.setTooltip("Conditional execution: if a condition is true, execute one block, otherwise execute another.");
        this.setHelpUrl("");
    }
};

// ================================
// 6. PRINT OUTPUT BLOCK
// ================================

Blockly.Blocks['print_output'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck(null)
            .appendField("🖨️ PRINT OUTPUT");
        
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BLOCK_COLORS.io);
        this.setTooltip("Display text or value in the console output.");
        this.setHelpUrl("");
    }
};

// ================================
// Additional Blocks for Better UX
// ================================

// Number block (value input)
Blockly.Blocks['math_number'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), "NUM");
        this.setOutput(true, null);
        this.setColour(BLOCK_COLORS.math);
        this.setTooltip("A number.");
        this.setHelpUrl("");
    }
};

// Text block (string input)
Blockly.Blocks['text_block'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('"')
            .appendField(new Blockly.FieldTextInput(""), "TEXT")
            .appendField('"');
        this.setOutput(true, null);
        this.setColour(140);
        this.setTooltip("A text string.");
        this.setHelpUrl("");
    }
};

// Get variable block
Blockly.Blocks['variables_get'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldVariable("item"), "VAR");
        this.setOutput(true, null);
        this.setColour(BLOCK_COLORS.workflow);
        this.setTooltip("Returns the value of the variable.");
        this.setHelpUrl("");
    }
};

console.log("✅ Custom blocks loaded successfully!");
