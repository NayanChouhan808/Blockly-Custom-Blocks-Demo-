/**
 * generator.js
 * JavaScript Code Generation from Custom Blocks
 * 
 * Converts visual blocks into executable JavaScript code
 */

console.log('🔄 Loading code generator...');

// ================================
// Initialize JavaScript Code Generator
// ================================

// Use the correct Blockly generator reference
const javascriptGenerator = Blockly.JavaScript || Blockly.javascript;

// ================================
// 1. START WORKFLOW Generator
// ================================

javascriptGenerator.forBlock['start_workflow'] = function(block) {
    const statements_do = javascriptGenerator.statementToCode(block, 'DO');
    
    const code = `
// ===== WORKFLOW START =====
(function() {
    const __variables = {};
    const __output = [];
    const __console = {
        log: function(...args) {
            __output.push(args.join(' '));
        }
    };

${statements_do || '    // Empty workflow'}

    return __output.join('\\n');
})();
`;
    
    return code;
};

// ================================
// 2. SET VARIABLE Generator
// ================================

javascriptGenerator.forBlock['set_variable'] = function(block) {
    const var_name = block.getField('VAR_NAME').getValue();
    const value_code = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC);
    
    let code = `    __variables['${var_name}'] = ${value_code};\n`;
    code += `    __console.log('✓ Variable "${var_name}" set to:', __variables['${var_name}']);\n`;
    
    return code;
};

// ================================
// 3. ADD NUMBERS Generator
// ================================

javascriptGenerator.forBlock['add_numbers'] = function(block) {
    const num1_code = javascriptGenerator.valueToCode(block, 'NUM1', javascriptGenerator.ORDER_ADDITIVE);
    const num2_code = javascriptGenerator.valueToCode(block, 'NUM2', javascriptGenerator.ORDER_ADDITIVE);
    
    const code = `(${num1_code} + ${num2_code})`;
    
    return [code, javascriptGenerator.ORDER_ADDITIVE];
};

// ================================
// 4. MULTIPLY NUMBERS Generator
// ================================

javascriptGenerator.forBlock['multiply_numbers'] = function(block) {
    const num1_code = javascriptGenerator.valueToCode(block, 'NUM1', javascriptGenerator.ORDER_MULTIPLICATIVE);
    const num2_code = javascriptGenerator.valueToCode(block, 'NUM2', javascriptGenerator.ORDER_MULTIPLICATIVE);
    
    const code = `(${num1_code} * ${num2_code})`;
    
    return [code, javascriptGenerator.ORDER_MULTIPLICATIVE];
};

// ================================
// 5. IF CONDITION Generator
// ================================

javascriptGenerator.forBlock['if_condition'] = function(block) {
    const condition_left = javascriptGenerator.valueToCode(block, 'CONDITION_LEFT', javascriptGenerator.ORDER_RELATIONAL);
    const condition_right = javascriptGenerator.valueToCode(block, 'CONDITION_RIGHT', javascriptGenerator.ORDER_RELATIONAL);
    const operator_value = block.getFieldValue('OPERATOR');
    
    let operator_symbol = '>';
    if (operator_value === 'LESS') operator_symbol = '<';
    if (operator_value === 'EQUAL') operator_symbol = '===';
    
    const statements_true = javascriptGenerator.statementToCode(block, 'DO_TRUE');
    const statements_false = javascriptGenerator.statementToCode(block, 'DO_FALSE');
    
    let code = `    if (${condition_left} ${operator_symbol} ${condition_right}) {\n`;
    code += statements_true || '        // empty block\n';
    code += `    } else {\n`;
    code += statements_false || '        // empty block\n';
    code += `    }\n`;
    
    return code;
};

// ================================
// 6. PRINT OUTPUT Generator
// ================================

javascriptGenerator.forBlock['print_output'] = function(block) {
    const text_code = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC);
    
    const code = `    __console.log(${text_code});\n`;
    
    return code;
};

// ================================
// Additional Blocks Generators
// ================================

// Number generator
javascriptGenerator.forBlock['math_number'] = function(block) {
    const num = parseFloat(block.getField('NUM').getValue());
    return [String(num), javascriptGenerator.ORDER_ATOMIC];
};

// Text generator
javascriptGenerator.forBlock['text_block'] = function(block) {
    const text = block.getField('TEXT').getValue();
    const code = `"${text.replace(/"/g, '\\"')}"`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

// Variables get generator
javascriptGenerator.forBlock['variables_get'] = function(block) {
    const var_name = block.getField('VAR').getValue();
    const code = `__variables['${var_name}']`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

console.log("✅ Code generator loaded successfully!");
