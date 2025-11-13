class CalculatorModes {
  constructor() {
    this.currentMode = 'scientific';
    this.modes = {
      scientific: {
        name: 'Scientific',
        buttons: [
          [
            { label: 'C', action: 'clear', type: 'operator' },
            { label: '⌫', action: 'backspace', type: 'operator' },
            { label: 'π', action: 'constant', value: 'π' },
            { label: 'e', action: 'constant', value: 'e' },
            { label: '(', action: 'parenthesis', value: '(' },
            { label: ')', action: 'parenthesis', value: ')' }
          ],
          [
            { label: 'sin', action: 'function', value: 'sin(' },
            { label: 'cos', action: 'function', value: 'cos(' },
            { label: 'tan', action: 'function', value: 'tan(' },
            { label: 'asin', action: 'function', value: 'asin(' },
            { label: 'acos', action: 'function', value: 'acos(' },
            { label: 'atan', action: 'function', value: 'atan(' }
          ],
          [
            { label: 'sinh', action: 'function', value: 'sinh(' },
            { label: 'cosh', action: 'function', value: 'cosh(' },
            { label: 'tanh', action: 'function', value: 'tanh(' },
            { label: 'log', action: 'function', value: 'log(' },
            { label: 'ln', action: 'function', value: 'ln(' },
            { label: '10ˣ', action: 'function', value: '10^' }
          ],
          [
            { label: 'x²', action: 'function', value: '^2' },
            { label: 'x³', action: 'function', value: '^3' },
            { label: 'xʸ', action: 'operator', value: '^' },
            { label: '√', action: 'function', value: 'sqrt(' },
            { label: '³√', action: 'function', value: 'cbrt(' },
            { label: 'eˣ', action: 'function', value: 'exp(' }
          ],
          [
            { label: '7', action: 'number', value: '7' },
            { label: '8', action: 'number', value: '8' },
            { label: '9', action: 'number', value: '9' },
            { label: '÷', action: 'operator', value: '/', type: 'operator' },
            { label: '%', action: 'percentage', value: '%' },
            { label: '!', action: 'function', value: '!' }
          ],
          [
            { label: '4', action: 'number', value: '4' },
            { label: '5', action: 'number', value: '5' },
            { label: '6', action: 'number', value: '6' },
            { label: '×', action: 'operator', value: '*', type: 'operator' },
            { label: '|x|', action: 'function', value: 'abs(' },
            { label: 'rand', action: 'function', value: 'rand()' }
          ],
          [
            { label: '1', action: 'number', value: '1' },
            { label: '2', action: 'number', value: '2' },
            { label: '3', action: 'number', value: '3' },
            { label: '-', action: 'operator', value: '-', type: 'operator' },
            { label: 'deg/rad', action: 'toggleAngle', type: 'function' }
          ],
          [
            { label: '0', action: 'number', value: '0' },
            { label: '.', action: 'decimal', value: '.' },
            { label: '±', action: 'negate', value: 'negate' },
            { label: '+', action: 'operator', value: '+', type: 'operator' },
            { label: '=', action: 'equals', type: 'equals' }
          ]
        ]
      },
      programmer: {
        name: 'Programmer',
        buttons: [
          [
            { label: 'DEC', action: 'programmerMode', value: 'dec' },
            { label: 'BIN', action: 'programmerMode', value: 'bin' },
            { label: 'OCT', action: 'programmerMode', value: 'oct' },
            { label: 'HEX', action: 'programmerMode', value: 'hex' },
            { label: 'C', action: 'clear', type: 'operator' },
            { label: '⌫', action: 'backspace', type: 'operator' }
          ],
          [
            { label: 'AND', action: 'bitwise', value: '&' },
            { label: 'OR', action: 'bitwise', value: '|' },
            { label: 'XOR', action: 'bitwise', value: '^' },
            { label: 'NOT', action: 'bitwise', value: '~' },
            { label: '<<', action: 'bitwise', value: '<<' },
            { label: '>>', action: 'bitwise', value: '>>' }
          ],
          [
            { label: '7', action: 'number', value: '7' },
            { label: '8', action: 'number', value: '8' },
            { label: '9', action: 'number', value: '9' },
            { label: 'A', action: 'hexDigit', value: 'A' },
            { label: 'B', action: 'hexDigit', value: 'B' },
            { label: '(', action: 'parenthesis', value: '(' }
          ],
          [
            { label: '4', action: 'number', value: '4' },
            { label: '5', action: 'number', value: '5' },
            { label: '6', action: 'number', value: '6' },
            { label: 'C', action: 'hexDigit', value: 'C' },
            { label: 'D', action: 'hexDigit', value: 'D' },
            { label: ')', action: 'parenthesis', value: ')' }
          ],
          [
            { label: '1', action: 'number', value: '1' },
            { label: '2', action: 'number', value: '2' },
            { label: '3', action: 'number', value: '3' },
            { label: 'E', action: 'hexDigit', value: 'E' },
            { label: 'F', action: 'hexDigit', value: 'F' },
            { label: '÷', action: 'operator', value: '/', type: 'operator' }
          ],
          [
            { label: '0', action: 'number', value: '0' },
            { label: '=', action: 'equals', type: 'equals' },
            { label: '×', action: 'operator', value: '*', type: 'operator' }
          ]
        ]
      },
      matrix: {
        name: 'Matrix',
        buttons: [
          [
            { label: '7', action: 'number', value: '7' },
            { label: '8', action: 'number', value: '8' },
            { label: '9', action: 'number', value: '9' },
            { label: '[', action: 'matrix', value: '[' },
            { label: ']', action: 'matrix', value: ']' },
            { label: 'C', action: 'clear', type: 'operator' }
          ],
          [
            { label: '4', action: 'number', value: '4' },
            { label: '5', action: 'number', value: '5' },
            { label: '6', action: 'number', value: '6' },
            { label: ';', action: 'matrix', value: ';' },
            { label: '⌫', action: 'backspace', type: 'operator' }
          ],
          [
            { label: '1', action: 'number', value: '1' },
            { label: '2', action: 'number', value: '2' },
            { label: '3', action: 'number', value: '3' },
            { label: '+', action: 'matrixOp', value: '+' },
            { label: '-', action: 'matrixOp', value: '-' }
          ],
          [
            { label: '0', action: 'number', value: '0' },
            { label: '.', action: 'decimal', value: '.' },
            { label: '×', action: 'matrixOp', value: '*' },
            { label: 'det', action: 'matrixFunc', value: 'det(' },
            { label: 'T', action: 'matrixFunc', value: 'transpose(' }
          ],
          [
            { label: '=', action: 'equals', type: 'equals' }
          ]
        ]
      },
      statistics: {
        name: 'Statistics',
        buttons: [
          [
            { label: '7', action: 'number', value: '7' },
            { label: '8', action: 'number', value: '8' },
            { label: '9', action: 'number', value: '9' },
            { label: 'Data', action: 'stats', value: 'data' },
            { label: 'C', action: 'clear', type: 'operator' }
          ],
          [
            { label: '4', action: 'number', value: '4' },
            { label: '5', action: 'number', value: '5' },
            { label: '6', action: 'number', value: '6' },
            { label: 'Mean', action: 'statsFunc', value: 'mean(' },
            { label: '⌫', action: 'backspace', type: 'operator' }
          ],
          [
            { label: '1', action: 'number', value: '1' },
            { label: '2', action: 'number', value: '2' },
            { label: '3', action: 'number', value: '3' },
            { label: 'Median', action: 'statsFunc', value: 'median(' },
            { label: 'Var', action: 'statsFunc', value: 'variance(' }
          ],
          [
            { label: '0', action: 'number', value: '0' },
            { label: '.', action: 'decimal', value: '.' },
            { label: 'Std', action: 'statsFunc', value: 'std(' },
            { label: '=', action: 'equals', type: 'equals' }
          ]
        ]
      },
      graph: {
        name: 'Graph',
        buttons: [
          [
            { label: 'sin', action: 'function', value: 'sin(' },
            { label: 'cos', action: 'function', value: 'cos(' },
            { label: 'tan', action: 'function', value: 'tan(' },
            { label: 'x', action: 'variable', value: 'x' },
            { label: 'C', action: 'clear', type: 'operator' },
            { label: '⌫', action: 'backspace', type: 'operator' }
          ],
          [
            { label: 'log', action: 'function', value: 'log(' },
            { label: 'ln', action: 'function', value: 'ln(' },
            { label: '√', action: 'function', value: 'sqrt(' },
            { label: 'x²', action: 'function', value: '^2' },
            { label: '^', action: 'operator', value: '^' },
            { label: '(', action: 'parenthesis', value: '(' }
          ],
          [
            { label: '7', action: 'number', value: '7' },
            { label: '8', action: 'number', value: '8' },
            { label: '9', action: 'number', value: '9' },
            { label: ')', action: 'parenthesis', value: ')' },
            { label: '÷', action: 'operator', value: '/', type: 'operator' },
            { label: 'Plot', action: 'graph', value: 'plot' }
          ],
          [
            { label: '4', action: 'number', value: '4' },
            { label: '5', action: 'number', value: '5' },
            { label: '6', action: 'number', value: '6' },
            { label: '×', action: 'operator', value: '*', type: 'operator' },
            { label: '+', action: 'operator', value: '+', type: 'operator' },
            { label: '-', action: 'operator', value: '-', type: 'operator' }
          ],
          [
            { label: '1', action: 'number', value: '1' },
            { label: '2', action: 'number', value: '2' },
            { label: '3', action: 'number', value: '3' },
            { label: 'Clear', action: 'graph', value: 'clear' },
            { label: 'Reset', action: 'graph', value: 'reset' }
          ],
          [
            { label: '0', action: 'number', value: '0' },
            { label: '.', action: 'decimal', value: '.' },
            { label: '=', action: 'equals', type: 'equals' }
          ]
        ]
      }
    };
  }
  
  // Get buttons for a specific mode
  getButtons(mode) {
    return this.modes[mode] ? this.modes[mode].buttons : this.modes.scientific.buttons;
  }
  
  // Get mode name
  getModeName(mode) {
    return this.modes[mode] ? this.modes[mode].name : 'Scientific';
  }
  
  // Set current mode
  setMode(mode) {
    if (this.modes[mode]) {
      this.currentMode = mode;
      return true;
    }
    return false;
  }
  
  // Get current mode
  getCurrentMode() {
    return this.currentMode;
  }
  
  // Get all available modes
  getAvailableModes() {
    return Object.keys(this.modes);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalculatorModes;
}