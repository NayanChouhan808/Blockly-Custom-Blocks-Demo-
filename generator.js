/**
 * generator.js
 * JavaScript Code Generation for Custom Blocks
 *
 * Registers generators on `Blockly.JavaScript['block_type']` so they integrate
 * with `Blockly.JavaScript.init`, `workspaceToCode`, and `finish`.
 */

console.log('🔄 Loading Blockly JavaScript generators...');

if (typeof Blockly === 'undefined' || !Blockly.JavaScript) {
    console.error('❌ Blockly or Blockly.JavaScript is not available. Generators not registered.');
} else {
    const jsGen = Blockly.JavaScript;

    // Helper: safely escape strings for code
    function escapeString(str) {
        return String(str)
            .replace(/\\/g, '\\\\')
            .replace(/\"/g, '\\"')
            .replace(/\n/g, '\\n');
    }

    // START WORKFLOW (statement)
    jsGen['start_workflow'] = function(block) {
        const stmts = jsGen.statementToCode(block, 'DO') || '';
        const body = stmts ? stmts : '    // empty workflow\n';

        const code = `// ===== WORKFLOW START =====\n(function() {\n    const __variables = {};\n    const __output = [];\n    const __console = {\n        log: function(...args) { __output.push(args.join(' ')); }\n    };\n\n${body}\n    return __output.join('\\n');\n})();\n`;
        return code || '';  // Ensure return is never undefined
    };

    // SET VARIABLE (statement)
    jsGen['set_variable'] = function(block) {
        const varName = block.getFieldValue('VAR_NAME') || 'variable';
        const value = jsGen.valueToCode(block, 'VALUE', jsGen.ORDER_ATOMIC) || '0';
        const code = `__variables['${varName}'] = ${value};\n__console.log('✓ Variable "${varName}" set to:', __variables['${varName}']);\n`;
        return code || '';  // Ensure return is never undefined
    };

    // ADD NUMBERS (value)
    jsGen['add_numbers'] = function(block) {
        const a = jsGen.valueToCode(block, 'NUM1', jsGen.ORDER_ADDITION) || '0';
        const b = jsGen.valueToCode(block, 'NUM2', jsGen.ORDER_ADDITION) || '0';
        const code = `(${a} + ${b})`;
        return [code || '0', jsGen.ORDER_ADDITION];  // Ensure return[0] is never undefined
    };

    // MULTIPLY NUMBERS (value)
    jsGen['multiply_numbers'] = function(block) {
        const a = jsGen.valueToCode(block, 'NUM1', jsGen.ORDER_MULTIPLICATION) || '0';
        const b = jsGen.valueToCode(block, 'NUM2', jsGen.ORDER_MULTIPLICATION) || '0';
        const code = `(${a} * ${b})`;
        return [code || '0', jsGen.ORDER_MULTIPLICATION];  // Ensure return[0] is never undefined
    };

    // IF CONDITION (statement)
    jsGen['if_condition'] = function(block) {
        const left = jsGen.valueToCode(block, 'CONDITION_LEFT', jsGen.ORDER_ATOMIC) || '0';
        const right = jsGen.valueToCode(block, 'CONDITION_RIGHT', jsGen.ORDER_ATOMIC) || '0';
        const operator = block.getFieldValue('OPERATOR') || 'GREATER';
        let op = '>';
        if (operator === 'LESS') op = '<';
        if (operator === 'EQUAL') op = '===';

        const branchTrue = jsGen.statementToCode(block, 'DO_TRUE') || '';
        const branchFalse = jsGen.statementToCode(block, 'DO_FALSE') || '';

        let code = `if (${left} ${op} ${right}) {\n`;
        code += branchTrue ? branchTrue : '    // empty\n';
        code += `} else {\n`;
        code += branchFalse ? branchFalse : '    // empty\n';
        code += `}\n`;
        return code || '';  // Ensure return is never undefined
    };

    // PRINT OUTPUT (statement)
    jsGen['print_output'] = function(block) {
        const text = jsGen.valueToCode(block, 'TEXT', jsGen.ORDER_ATOMIC) || '""';
        return `__console.log(${text});\n` || '';  // Ensure return is never undefined
    };

    // MATH NUMBER (value)
    jsGen['math_number'] = function(block) {
        const num = block.getFieldValue('NUM') || '0';
        const code = Number(num) || 0;
        return [String(code) || '0', jsGen.ORDER_ATOMIC];  // Ensure return[0] is never undefined
    };

    // TEXT BLOCK (value)
    jsGen['text_block'] = function(block) {
        const txt = block.getFieldValue('TEXT') || '';
        const code = '"' + escapeString(txt) + '"';
        return [code || '""', jsGen.ORDER_ATOMIC];  // Ensure return[0] is never undefined
    };

    // GET VARIABLE (value)
    jsGen['variables_get'] = function(block) {
        const name = block.getFieldValue('VAR') || 'item';
        const code = `__variables['${name}']`;
        return [code || '__variables["item"]', jsGen.ORDER_ATOMIC];  // Ensure return[0] is never undefined
    };

    console.log('✅ Blockly.JavaScript generators registered');
}
