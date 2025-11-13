class ScientificCalculator {
  constructor() {
    this.currentInput = '';
    this.previousInput = '';
    this.operation = null;
    this.resetNextInput = false;
    this.history = [];
    this.angleMode = 'deg';
    this.currentMode = 'scientific';
    this.fullExpression = '';
    
    this.parser = new ExpressionParser();
    this.modes = new CalculatorModes();
    this.storage = new CalculatorStorage();
    
    this.initializeElements();
    this.attachEventListeners();
    this.loadFromStorage();
    this.updateDisplay();
    this.populateButtons();
    
    this.attachKeyboardListeners();
  }
  
  initializeElements() {
    this.singleDisplay = document.getElementById('singleDisplay');
    this.buttonsGrid = document.getElementById('buttonsGrid');
    this.historyList = document.getElementById('historyList');
    this.themeToggle = document.getElementById('themeToggle');
    this.graphContainer = document.getElementById('graphContainer');
    this.graphCanvas = document.getElementById('graphCanvas');
    this.resetGraphBtn = document.getElementById('resetGraph');
    this.clearGraphBtn = document.getElementById('clearGraph');
    
    this.menuToggle = document.getElementById('menuToggle');
    this.slideMenu = document.getElementById('slideMenu');
    this.closeMenu = document.getElementById('closeMenu');
    
    this.menuOverlay = document.createElement('div');
    this.menuOverlay.className = 'menu-overlay';
    document.body.appendChild(this.menuOverlay);
  }
  
  attachEventListeners() {
    // Theme toggle
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Slide menu toggle
    this.menuToggle.addEventListener('click', () => this.toggleMenu());
    this.closeMenu.addEventListener('click', () => this.toggleMenu());
    this.menuOverlay.addEventListener('click', () => this.toggleMenu());
    
    // Mode selection - updated to use slide menu
    document.querySelectorAll('.menu-item').forEach(button => {
      button.addEventListener('click', (e) => this.switchMode(e.target.closest('.menu-item').dataset.mode));
    });
    
    // Clear history
    document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
    
    // Graph buttons
    if (this.resetGraphBtn) {
      this.resetGraphBtn.addEventListener('click', () => {
        if (this.graph) this.graph.resetView();
      });
    }
    
    if (this.clearGraphBtn) {
      this.clearGraphBtn.addEventListener('click', () => {
        if (this.graph) this.graph.clearGraphs();
      });
    }
  }
  
  attachKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      // Prevent default behavior for keys we're handling
      if (/[0-9+\-*/.=]|Enter|Backspace|Escape/.test(e.key)) {
        e.preventDefault();
      }
      
      switch (e.key) {
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          this.inputNumber(e.key);
          break;
        case '+':
          this.inputOperator('+');
          break;
        case '-':
          this.inputOperator('-');
          break;
        case '*':
          this.inputOperator('*');
          break;
        case '/':
          // Check if we're inputting a fraction
          if (e.shiftKey) {
            this.inputFraction();
          } else {
            this.inputOperator('/');
          }
          break;
        case '.':
          this.inputDecimal();
          break;
        case '=':
        case 'Enter':
          this.calculate();
          break;
        case 'Backspace':
          this.backspace();
          break;
        case 'Escape':
          this.clear();
          break;
        case '(': case ')':
          this.inputParenthesis(e.key);
          break;
        case '^':
          this.inputOperator('^');
          break;
        case 'p': case 'P':
          if (e.ctrlKey) {
            // Ctrl+P for π
            this.inputConstant('π');
          }
          break;
      }
      
      this.updateDisplay();
    });
  }
  
  populateButtons() {
    const buttons = this.getButtonsForMode(this.currentMode);
    this.buttonsGrid.innerHTML = '';
    
    buttons.forEach(row => {
      row.forEach(btn => {
        const button = document.createElement('button');
        button.className = `calc-btn ${btn.type || ''}`;
        button.textContent = btn.label;
        button.dataset.action = btn.action;
        if (btn.value !== undefined) button.dataset.value = btn.value;
        button.addEventListener('click', (e) => this.handleButtonClick(e));
        this.buttonsGrid.appendChild(button);
      });
    });
  }
  
  getButtonsForMode(mode) {
    return this.modes.getButtons(mode);
  }
  
  handleButtonClick(event) {
    const button = event.target;
    const action = button.dataset.action;
    const value = button.dataset.value;
    
    switch (action) {
      case 'number':
        this.inputNumber(value);
        break;
      case 'operator':
        this.inputOperator(value);
        break;
      case 'function':
        this.inputFunction(value);
        break;
      case 'constant':
        this.inputConstant(value);
        break;
      case 'parenthesis':
        this.inputParenthesis(value);
        break;
      case 'decimal':
        this.inputDecimal();
        break;
      case 'equals':
        this.calculate();
        break;
      case 'clear':
        this.clear();
        break;
      case 'backspace':
        this.backspace();
        break;
      case 'negate':
        this.negate();
        break;
      case 'percentage':
        this.percentage();
        break;
      case 'toggleAngle':
        this.toggleAngleMode();
        break;
      case 'graph':
        this.handleGraphAction(value);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }
  
  inputNumber(number) {
    if (this.resetNextInput) {
      this.currentInput = '';
      this.previousInput = '';
      this.operation = null;
      this.fullExpression = '';
      this.resetNextInput = false;
    }
    
    this.currentInput += number;
    this.fullExpression += number;
    this.updateDisplay();
  }
  
  inputOperator(operator) {
    // If there's already a current input or previous input, calculate first
    if (this.currentInput !== '' || this.previousInput !== '') {
      // Only calculate if we have a complete expression (previous + operation + current)
      if (this.previousInput !== '' && this.operation !== null && this.currentInput !== '') {
        this.calculate();
      } else if (this.currentInput !== '') {
        // Move current input to previous when starting a new operation
        this.previousInput = this.currentInput;
        this.currentInput = '';
      }
    }
    
    this.operation = operator;
    this.fullExpression += operator;
    this.resetNextInput = false; // Don't reset on operator input
    this.updateDisplay();
  }
  
  inputFunction(func) {
    if (this.resetNextInput) {
      this.currentInput = '';
      this.fullExpression = '';
      this.resetNextInput = false;
    }
    
    // Handle postfix functions like factorial
    if (func === '!') {
      this.currentInput += '!';
      this.fullExpression += '!';
      this.updateDisplay();
      return;
    }
    
    // Handle functions that go after the number
    if (func === '^2') {
      this.currentInput += '^2';
      this.fullExpression += '^2';
      this.updateDisplay();
      return;
    }
    
    // Handle prefix functions
    this.currentInput += func;
    this.fullExpression += func;
    this.updateDisplay();
  }
  
  inputConstant(constant) {
    if (this.resetNextInput) {
      this.currentInput = '';
      this.fullExpression = '';
      this.resetNextInput = false;
    }
    
    this.currentInput += constant;
    this.fullExpression += constant;
    this.updateDisplay();
  }
  
  inputParenthesis(parenthesis) {
    if (this.resetNextInput) {
      this.currentInput = '';
      this.fullExpression = '';
      this.resetNextInput = false;
    }
    
    this.currentInput += parenthesis;
    this.fullExpression += parenthesis;
    this.updateDisplay();
  }
  
  inputDecimal() {
    if (this.resetNextInput) {
      this.currentInput = '';
      this.fullExpression = '';
      this.resetNextInput = false;
    }
    
    // If current input is empty, start with "0."
    if (this.currentInput === '') {
      this.currentInput = '0.';
      this.fullExpression += '0.';
    } else if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
      this.fullExpression += '.';
    }
    
    this.updateDisplay();
  }
  
  calculate() {
    try {
      // If we have a complete expression (previous + operation + current), evaluate it
      if (this.previousInput !== '' && this.operation !== null && this.currentInput !== '') {
        const expression = this.previousInput + this.operation + this.currentInput;
        const result = this.evaluateExpression(expression);
        
        // Add to history
        this.addToHistory(expression, result);
        
        // Update state
        this.currentInput = result.toString();
        this.previousInput = '';
        this.operation = null;
        this.fullExpression = result.toString();
        this.resetNextInput = true;
      } 
      // If we just have a current input with no operation, evaluate it directly
      else if (this.currentInput !== '' && this.operation === null && this.previousInput === '') {
        const result = this.evaluateExpression(this.currentInput);
        this.addToHistory(this.currentInput, result);
        this.currentInput = result.toString();
        this.fullExpression = result.toString();
        this.resetNextInput = true;
      }
    } catch (error) {
      this.currentInput = 'Error';
      this.fullExpression = 'Error';
      this.resetNextInput = true;
      // Clear the expression state on error
      this.previousInput = '';
      this.operation = null;
    }
    this.updateDisplay();
  }
  
  // Evaluate expression using the custom parser
  evaluateExpression(expression) {
    try {
      // Handle empty expressions
      if (!expression || expression.trim() === '') {
        return 0;
      }
      
      // Use the custom parser for evaluation
      const result = this.parser.evaluate(expression);
      
      // Handle very large numbers by formatting them
      if (Math.abs(result) > 1e15) {
        return result.toExponential(10);
      }
      
      // Handle very small numbers close to zero
      if (Math.abs(result) < 1e-10 && result !== 0) {
        return result.toExponential(10);
      }
      
      return result;
    } catch (error) {
      console.error('Evaluation error:', error);
      throw new Error(`Evaluation error: ${error.message}`);
    }
  }
  
  clear() {
    this.currentInput = '';
    this.previousInput = '';
    this.operation = null;
    this.fullExpression = '';
    this.resetNextInput = false;
    this.updateDisplay();
  }
  
  backspace() {
    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
      this.fullExpression = this.fullExpression.slice(0, -1);
    } else {
      this.currentInput = '';
      // Only remove last character from fullExpression if it's not empty
      if (this.fullExpression.length > 0) {
        this.fullExpression = this.fullExpression.slice(0, -1);
      }
    }
    this.updateDisplay();
  }
  
  negate() {
    if (this.currentInput !== '') {
      if (this.currentInput.startsWith('-')) {
        this.currentInput = this.currentInput.slice(1);
        // Remove the minus sign from fullExpression as well
        if (this.fullExpression.startsWith('-')) {
          this.fullExpression = this.fullExpression.slice(1);
        }
      } else {
        this.currentInput = '-' + this.currentInput;
        this.fullExpression = '-' + this.fullExpression;
      }
    }
    this.updateDisplay();
  }
  
  percentage() {
    try {
      const value = parseFloat(this.currentInput);
      this.currentInput = (value / 100).toString();
      this.fullExpression = this.currentInput;
    } catch (error) {
      this.currentInput = 'Error';
      this.fullExpression = 'Error';
    }
    this.updateDisplay();
  }
  
  toggleAngleMode() {
    this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
    this.updateDisplay();
  }
  
  // History functions
  addToHistory(expression, result) {
    this.history.unshift({
      expression: expression,
      result: result
    });
    
    // Limit history to 50 items
    if (this.history.length > 50) {
      this.history.pop();
    }
    
    this.updateHistoryDisplay();
    this.saveToStorage();
  }
  
  clearHistory() {
    this.history = [];
    this.updateHistoryDisplay();
    this.saveToStorage();
  }
  
  // Display functions
  updateDisplay() {
    // Show the full expression being built
    this.singleDisplay.textContent = this.fullExpression === '' ? '0' : this.fullExpression;
    
    // Handle very long expressions by truncating for display
    if (this.singleDisplay.textContent.length > 20) {
      this.singleDisplay.textContent = this.singleDisplay.textContent.slice(0, 17) + '...';
    }
    
    // Update angle mode indicator
    const angleButton = document.querySelector('[data-action="toggleAngle"]');
    if (angleButton) {
      angleButton.textContent = this.angleMode === 'deg' ? 'deg' : 'rad';
    }
  }
  
  updateHistoryDisplay() {
    this.historyList.innerHTML = '';
    this.history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-expression">${item.expression}</div>
        <div class="history-result">= ${item.result}</div>
      `;
      div.addEventListener('click', () => {
        this.currentInput = item.result.toString();
        this.resetNextInput = false;
        this.updateDisplay();
      });
      this.historyList.appendChild(div);
    });
  }
  
  // Theme functions
  toggleTheme() {
    document.body.classList.toggle('dark-theme');
    this.themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    this.saveToStorage();
  }
  
  // Menu functions
  toggleMenu() {
    this.slideMenu.classList.toggle('open');
    this.menuOverlay.classList.toggle('open');
  }
  
  // Mode switching
  switchMode(mode) {
    if (!this.modes.setMode(mode)) {
      console.error('Invalid mode:', mode);
      return;
    }
    
    this.currentMode = mode;
    
    // Show/hide graph container based on mode
    if (mode === 'graph' && this.graphContainer) {
      this.graphContainer.style.display = 'block';
      // Initialize graph if not already done
      if (!this.graph) {
        this.graph = new GraphingCalculator('graphCanvas');
      }
    } else if (this.graphContainer) {
      this.graphContainer.style.display = 'none';
    }
    
    // Update active button in slide menu
    document.querySelectorAll('.menu-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      }
    });
    
    // Close the menu
    this.toggleMenu();
    
    // Repopulate buttons
    this.populateButtons();
    
    // Update display
    this.updateDisplay();
  }
  
  // Graph functions
  handleGraphAction(action) {
    switch (action) {
      case 'plot':
        if (this.graph && this.currentInput) {
          this.graph.addFunction(this.currentInput);
          this.clear();
        }
        break;
      case 'clear':
        if (this.graph) {
          this.graph.clearGraphs();
        }
        break;
      case 'reset':
        if (this.graph) {
          this.graph.resetView();
        }
        break;
    }
  }
  
  // Storage functions
  saveToStorage() {
    try {
      this.storage.saveHistory(this.history);
      
      const settings = {
        angleMode: this.angleMode
      };
      this.storage.saveSettings(settings);
      
      const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      this.storage.saveTheme(theme);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }
  
  loadFromStorage() {
    try {
      this.history = this.storage.loadHistory([]);
      
      const settings = this.storage.loadSettings({});
      this.angleMode = settings.angleMode || 'deg';
      
      const theme = this.storage.loadTheme('light');
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        this.themeToggle.textContent = '☀️';
      }
      
      this.updateHistoryDisplay();
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.calculator = new ScientificCalculator();
});