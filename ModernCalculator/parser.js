class ExpressionParser {
  constructor() {
    this.angleMode = 'deg';
    this.epsilon = 1e-15;
  }
  
  setAngleMode(mode) {
    this.angleMode = mode;
  }
  
  evaluate(expression) {
    try {
      // Handle empty expressions
      if (!expression || expression.trim() === '') {
        return 0;
      }
      
      // Check for excessively long expressions
      if (expression.length > 5000) {
        throw new Error('Expression too long');
      }
      
      // Preprocess the expression
      const preprocessed = this.preprocess(expression);
      
      // Tokenize the expression
      const tokens = this.tokenize(preprocessed);
      
      // Convert to postfix notation
      const postfix = this.infixToPostfix(tokens);
      
      // Evaluate the postfix expression
      const result = this.evaluatePostfix(postfix);
      
      // Return exact values for common mathematical constants
      if (Math.abs(result - Math.PI) < this.epsilon) return Math.PI;
      if (Math.abs(result - Math.E) < this.epsilon) return Math.E;
      
      // Return exact zero for very small numbers
      if (Math.abs(result) < this.epsilon) return 0;
      
      // Handle special cases for common mathematical expressions
      // Check for simple fractions that should be exact
      const fractionCheck = this.checkSimpleFraction(result);
      if (fractionCheck !== null) return fractionCheck;
      
      // Check for common square roots
      const sqrtCheck = this.checkCommonSquareRoots(result);
      if (sqrtCheck !== null) return sqrtCheck;
      
      // Round to appropriate precision
      return this.preciseRound(result, 15);
    } catch (error) {
      throw new Error(`Evaluation error: ${error.message}`);
    }
  }
  
  // Preprocess the expression (handle implicit multiplication, constants, etc.)
  preprocess(expression) {
    let processed = expression;
    
    // Replace constants with higher precision values
    processed = processed.replace(/π/g, '(3.141592653589793)')
                        .replace(/e/g, '(2.718281828459045)');
    
    // Handle implicit multiplication (e.g., 2π, 3(4+5), (2)(3))
    processed = processed.replace(/(\d)([a-zA-Z]|[\(])/g, '$1*$2')
                        .replace(/([\)])([a-zA-Z\d])/g, '$1*$2')
                        .replace(/([\)])([\(])/g, '$1*$2');
    
    // Handle special cases like 5(2+3) -> 5*(2+3)
    processed = processed.replace(/(\d)\(/g, '$1*(');
    
    return processed;
  }
  
  // Convert infix expression to postfix notation
  infixToPostfix(tokens) {
    const output = [];
    const operatorStack = [];
    
    // Handle empty token list
    if (!tokens || tokens.length === 0) {
      return output;
    }
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (this.isNumber(token)) {
        output.push(token);
      } else if (this.isFunction(token)) {
        operatorStack.push(token);
      } else if (token === ',') {
        // Handle function argument separators
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          output.push(operatorStack.pop());
        }
        if (operatorStack.length === 0) {
          throw new Error('Mismatched parentheses');
        }
      } else if (this.isOperator(token)) {
        // For right-associative operators like exponentiation (^), we use > instead of >=
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== '(' &&
          (
            (token !== '^' && this.getPrecedence(operatorStack[operatorStack.length - 1]) >= this.getPrecedence(token)) ||
            (token === '^' && this.getPrecedence(operatorStack[operatorStack.length - 1]) > this.getPrecedence(token))
          )
        ) {
          output.push(operatorStack.pop());
        }
        operatorStack.push(token);
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          output.push(operatorStack.pop());
        }
        if (operatorStack.length === 0) {
          throw new Error('Mismatched parentheses');
        }
        operatorStack.pop(); // Remove the '('
        
        // If the top of stack is a function, pop it to output
        if (operatorStack.length > 0 && this.isFunction(operatorStack[operatorStack.length - 1])) {
          output.push(operatorStack.pop());
        }
      } else {
        // Variable or unrecognized token
        output.push(token);
      }
    }
    
    // Pop remaining operators
    while (operatorStack.length > 0) {
      const op = operatorStack.pop();
      if (op === '(' || op === ')') {
        throw new Error('Mismatched parentheses');
      }
      output.push(op);
    }
    
    return output;
  }
  
  // Tokenize the expression
  tokenize(expression) {
    // Handle empty expressions
    if (!expression || expression.trim() === '') {
      return [];
    }
    
    const tokens = [];
    let currentToken = '';
    
    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];
      
      if (this.isOperator(char) || char === '(' || char === ')' || char === ',') {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
        tokens.push(char);
      } else if (/[a-zA-Z]/.test(char)) {
        // Handle function names and variables
        if (currentToken && !/[a-zA-Z]/.test(currentToken)) {
          tokens.push(currentToken);
          currentToken = '';
        }
        currentToken += char;
      } else if (/\d|\./.test(char)) {
        // Handle numbers
        if (currentToken && /[a-zA-Z]/.test(currentToken)) {
          tokens.push(currentToken);
          currentToken = '';
        }
        if (currentToken && !/[\d\.]/.test(currentToken)) {
          tokens.push(currentToken);
          currentToken = '';
        }
        currentToken += char;
      } else if (/\s/.test(char)) {
        // Skip whitespace
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
      } else {
        // Other characters
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
        tokens.push(char);
      }
    }
    
    if (currentToken) {
      tokens.push(currentToken);
    }
    
    // Handle unary minus by adding a 0 before it if it's at the start or after an operator/parenthesis
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === '-' && (i === 0 || ['+', '-', '*', '/', '^', '(', ','].includes(tokens[i-1]))) {
        // But don't add 0 if the next token is also an operator (this would be a double operator)
        if (i + 1 < tokens.length && !this.isOperator(tokens[i + 1]) && tokens[i + 1] !== ')') {
          tokens.splice(i, 0, '0');
          i++; // Skip the inserted 0
        }
      }
    }
    
    return tokens;
  }
  
  // Evaluate postfix expression
  evaluatePostfix(postfix) {
    const stack = [];
    
    for (const token of postfix) {
      if (this.isNumber(token)) {
        stack.push(parseFloat(token));
      } else if (this.isOperator(token)) {
        if (stack.length < 2) {
          throw new Error('Invalid expression');
        }
        
        const b = stack.pop();
        const a = stack.pop();
        const result = this.applyOperator(a, b, token);
        stack.push(result);
      } else if (this.isFunction(token)) {
        if (stack.length < 1) {
          throw new Error('Invalid expression');
        }
        
        const a = stack.pop();
        const result = this.applyFunction(a, token);
        stack.push(result);
      } else {
        // Variable or unrecognized token
        throw new Error(`Unknown token: ${token}`);
      }
    }
    
    if (stack.length !== 1) {
      throw new Error('Invalid expression');
    }
    
    return stack[0];
  }
  
  // Apply operator to two operands with improved accuracy
  applyOperator(a, b, operator) {
    switch (operator) {
      case '+': 
        // Handle floating point addition with precision
        const sum = a + b;
        // Special cases for common additions
        if (Math.abs(a) < this.epsilon) return b;
        if (Math.abs(b) < this.epsilon) return a;
        // Check for exact integer results
        if (Number.isInteger(a) && Number.isInteger(b)) return a + b;
        return Math.abs(sum) < this.epsilon ? 0 : sum;
      case '-': 
        // Handle floating point subtraction with precision
        const diff = a - b;
        // Special cases for common subtractions
        if (Math.abs(b) < this.epsilon) return a;
        if (Math.abs(a) < this.epsilon) return -b;
        // Check for exact integer results
        if (Number.isInteger(a) && Number.isInteger(b)) return a - b;
        return Math.abs(diff) < this.epsilon ? 0 : diff;
      case '*': 
        // Handle floating point multiplication with precision
        const product = a * b;
        // Special cases for common multiplications
        if (Math.abs(a) < this.epsilon || Math.abs(b) < this.epsilon) return 0;
        if (Math.abs(a - 1) < this.epsilon) return b;
        if (Math.abs(b - 1) < this.epsilon) return a;
        if (Math.abs(a + 1) < this.epsilon) return -b;
        if (Math.abs(b + 1) < this.epsilon) return -a;
        // Check for exact integer results
        if (Number.isInteger(a) && Number.isInteger(b)) return a * b;
        return Math.abs(product) < this.epsilon ? 0 : product;
      case '/': 
        if (Math.abs(b) < this.epsilon) throw new Error('Division by zero');
        const quotient = a / b;
        // Special cases for common divisions
        if (Math.abs(a) < this.epsilon) return 0;
        if (Math.abs(b - 1) < this.epsilon) return a;
        if (Math.abs(b + 1) < this.epsilon) return -a;
        if (Math.abs(a - b) < this.epsilon) return 1; // x/x = 1
        if (Math.abs(a + b) < this.epsilon) return -1; // -x/x = -1
        // Check for exact integer divisions
        if (Number.isInteger(a) && Number.isInteger(b) && a % b === 0) return a / b;
        return Math.abs(quotient) < this.epsilon ? 0 : quotient;
      case '^': 
        // Handle special cases for exponentiation
        if (Math.abs(b) < this.epsilon) return 1; // x^0 = 1
        if (Math.abs(a) < this.epsilon) return 0; // 0^x = 0 (for x > 0)
        if (Math.abs(a - 1) < this.epsilon) return 1; // 1^x = 1
        if (Math.abs(b - 1) < this.epsilon) return a; // x^1 = x
        if (Math.abs(b - 2) < this.epsilon) return a * a; // x^2 = x*x
        if (Math.abs(a + 1) < this.epsilon) { // (-1)^x
          if (Math.abs(b - Math.floor(b)) < this.epsilon) { // Integer exponent
            return Math.floor(b) % 2 === 0 ? 1 : -1;
          }
        }
        // Special handling for square roots (x^0.5)
        if (Math.abs(b - 0.5) < this.epsilon) {
          if (Math.abs(a - 4) < this.epsilon) return 2;
          if (Math.abs(a - 9) < this.epsilon) return 3;
          if (Math.abs(a - 16) < this.epsilon) return 4;
          if (Math.abs(a - 25) < this.epsilon) return 5;
        }
        return Math.pow(a, b);
      case '%': 
        if (Math.abs(b) < this.epsilon) throw new Error('Modulo by zero');
        // Check for exact integer results
        if (Number.isInteger(a) && Number.isInteger(b)) return a % b;
        return a % b;
      default: throw new Error(`Unknown operator: ${operator}`);
    }
  }
  
  // Apply function to operand with improved accuracy
  applyFunction(a, func) {
    // Convert to radians if needed for trigonometric functions
    let angleInRad = a;
    if (this.angleMode === 'deg' && 
        ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(func)) {
      angleInRad = a * Math.PI / 180;
    }
    
    switch (func) {
      // Trigonometric functions
      case 'sin': 
        // Handle special angles
        if (this.angleMode === 'deg') {
          // For degrees, check common angles
          const deg = ((a % 360) + 360) % 360; // Normalize to [0, 360)
          if (Math.abs(deg) < this.epsilon || Math.abs(deg - 360) < this.epsilon) return 0; // sin(0°, 360°) = 0
          if (Math.abs(deg - 180) < this.epsilon) return 0; // sin(180°) = 0
          if (Math.abs(deg - 90) < this.epsilon) return 1; // sin(90°) = 1
          if (Math.abs(deg - 270) < this.epsilon) return -1; // sin(270°) = -1
          // Additional common angles
          if (Math.abs(deg - 30) < this.epsilon) return 0.5; // sin(30°) = 0.5
          if (Math.abs(deg - 150) < this.epsilon) return 0.5; // sin(150°) = 0.5
          if (Math.abs(deg - 210) < this.epsilon) return -0.5; // sin(210°) = -0.5
          if (Math.abs(deg - 330) < this.epsilon) return -0.5; // sin(330°) = -0.5
          if (Math.abs(deg - 45) < this.epsilon) return 0.7071067811865476; // sin(45°) = √2/2
          if (Math.abs(deg - 135) < this.epsilon) return 0.7071067811865476; // sin(135°) = √2/2
          if (Math.abs(deg - 225) < this.epsilon) return -0.7071067811865476; // sin(225°) = -√2/2
          if (Math.abs(deg - 315) < this.epsilon) return -0.7071067811865476; // sin(315°) = -√2/2
          if (Math.abs(deg - 60) < this.epsilon) return 0.8660254037844386; // sin(60°) = √3/2
          if (Math.abs(deg - 120) < this.epsilon) return 0.8660254037844386; // sin(120°) = √3/2
          if (Math.abs(deg - 240) < this.epsilon) return -0.8660254037844386; // sin(240°) = -√3/2
          if (Math.abs(deg - 300) < this.epsilon) return -0.8660254037844386; // sin(300°) = -√3/2
        } else {
          // For radians, check common angles with higher precision
          // Normalize to [0, 2π)
          let rad = angleInRad % (2 * Math.PI);
          if (rad < 0) rad += 2 * Math.PI;
          
          // Check for exact values with higher precision
          if (Math.abs(rad) < this.epsilon || Math.abs(rad - 2 * Math.PI) < this.epsilon) return 0; // sin(0, 2π) = 0
          if (Math.abs(rad - Math.PI) < this.epsilon) return 0; // sin(π) = 0
          if (Math.abs(rad - Math.PI/2) < this.epsilon) return 1; // sin(π/2) = 1
          if (Math.abs(rad - 3*Math.PI/2) < this.epsilon) return -1; // sin(3π/2) = -1
          
          // Additional common angles
          if (Math.abs(rad - Math.PI/6) < this.epsilon) return 0.5; // sin(π/6) = 0.5
          if (Math.abs(rad - 5*Math.PI/6) < this.epsilon) return 0.5; // sin(5π/6) = 0.5
          if (Math.abs(rad - 7*Math.PI/6) < this.epsilon) return -0.5; // sin(7π/6) = -0.5
          if (Math.abs(rad - 11*Math.PI/6) < this.epsilon) return -0.5; // sin(11π/6) = -0.5
          if (Math.abs(rad - Math.PI/4) < this.epsilon) return 0.7071067811865476; // sin(π/4) = √2/2
          if (Math.abs(rad - 3*Math.PI/4) < this.epsilon) return 0.7071067811865476; // sin(3π/4) = √2/2
          if (Math.abs(rad - 5*Math.PI/4) < this.epsilon) return -0.7071067811865476; // sin(5π/4) = -√2/2
          if (Math.abs(rad - 7*Math.PI/4) < this.epsilon) return -0.7071067811865476; // sin(7π/4) = -√2/2
          if (Math.abs(rad - Math.PI/3) < this.epsilon) return 0.8660254037844386; // sin(π/3) = √3/2
          if (Math.abs(rad - 2*Math.PI/3) < this.epsilon) return 0.8660254037844386; // sin(2π/3) = √3/2
          if (Math.abs(rad - 4*Math.PI/3) < this.epsilon) return -0.8660254037844386; // sin(4π/3) = -√3/2
          if (Math.abs(rad - 5*Math.PI/3) < this.epsilon) return -0.8660254037844386; // sin(5π/3) = -√3/2
        }
        const sinResult = Math.sin(angleInRad);
        return Math.abs(sinResult) < this.epsilon ? 0 : sinResult;
        
      case 'cos': 
        // Handle special angles
        if (this.angleMode === 'deg') {
          // For degrees, check common angles
          const deg = ((a % 360) + 360) % 360; // Normalize to [0, 360)
          if (Math.abs(deg - 90) < this.epsilon || Math.abs(deg - 270) < this.epsilon) return 0; // cos(90°, 270°) = 0
          if (Math.abs(deg) < this.epsilon || Math.abs(deg - 360) < this.epsilon) return 1; // cos(0°, 360°) = 1
          if (Math.abs(deg - 180) < this.epsilon) return -1; // cos(180°) = -1
          // Additional common angles
          if (Math.abs(deg - 60) < this.epsilon) return 0.5; // cos(60°) = 0.5
          if (Math.abs(deg - 300) < this.epsilon) return 0.5; // cos(300°) = 0.5
          if (Math.abs(deg - 120) < this.epsilon) return -0.5; // cos(120°) = -0.5
          if (Math.abs(deg - 240) < this.epsilon) return -0.5; // cos(240°) = -0.5
          if (Math.abs(deg - 45) < this.epsilon) return 0.7071067811865476; // cos(45°) = √2/2
          if (Math.abs(deg - 315) < this.epsilon) return 0.7071067811865476; // cos(315°) = √2/2
          if (Math.abs(deg - 135) < this.epsilon) return -0.7071067811865476; // cos(135°) = -√2/2
          if (Math.abs(deg - 225) < this.epsilon) return -0.7071067811865476; // cos(225°) = -√2/2
          if (Math.abs(deg - 30) < this.epsilon) return 0.8660254037844386; // cos(30°) = √3/2
          if (Math.abs(deg - 330) < this.epsilon) return 0.8660254037844386; // cos(330°) = √3/2
          if (Math.abs(deg - 150) < this.epsilon) return -0.8660254037844386; // cos(150°) = -√3/2
          if (Math.abs(deg - 210) < this.epsilon) return -0.8660254037844386; // cos(210°) = -√3/2
        } else {
          // For radians, check common angles with higher precision
          // Normalize to [0, 2π)
          let rad = angleInRad % (2 * Math.PI);
          if (rad < 0) rad += 2 * Math.PI;
          
          // Check for exact values with higher precision
          if (Math.abs(rad - Math.PI/2) < this.epsilon || Math.abs(rad - 3*Math.PI/2) < this.epsilon) return 0; // cos(π/2, 3π/2) = 0
          if (Math.abs(rad) < this.epsilon || Math.abs(rad - 2 * Math.PI) < this.epsilon) return 1; // cos(0, 2π) = 1
          if (Math.abs(rad - Math.PI) < this.epsilon) return -1; // cos(π) = -1
          
          // Additional common angles
          if (Math.abs(rad - Math.PI/3) < this.epsilon) return 0.5; // cos(π/3) = 0.5
          if (Math.abs(rad - 5*Math.PI/3) < this.epsilon) return 0.5; // cos(5π/3) = 0.5
          if (Math.abs(rad - 2*Math.PI/3) < this.epsilon) return -0.5; // cos(2π/3) = -0.5
          if (Math.abs(rad - 4*Math.PI/3) < this.epsilon) return -0.5; // cos(4π/3) = -0.5
          if (Math.abs(rad - Math.PI/4) < this.epsilon) return 0.7071067811865476; // cos(π/4) = √2/2
          if (Math.abs(rad - 7*Math.PI/4) < this.epsilon) return 0.7071067811865476; // cos(7π/4) = √2/2
          if (Math.abs(rad - 3*Math.PI/4) < this.epsilon) return -0.7071067811865476; // cos(3π/4) = -√2/2
          if (Math.abs(rad - 5*Math.PI/4) < this.epsilon) return -0.7071067811865476; // cos(5π/4) = -√2/2
          if (Math.abs(rad - Math.PI/6) < this.epsilon) return 0.8660254037844386; // cos(π/6) = √3/2
          if (Math.abs(rad - 11*Math.PI/6) < this.epsilon) return 0.8660254037844386; // cos(11π/6) = √3/2
          if (Math.abs(rad - 5*Math.PI/6) < this.epsilon) return -0.8660254037844386; // cos(5π/6) = -√3/2
          if (Math.abs(rad - 7*Math.PI/6) < this.epsilon) return -0.8660254037844386; // cos(7π/6) = -√3/2
        }
        const cosResult = Math.cos(angleInRad);
        return Math.abs(cosResult) < this.epsilon ? 0 : cosResult;
        
      case 'tan': 
        // Handle special angles where tan is undefined
        if (this.angleMode === 'deg') {
          const deg = ((a % 180) + 180) % 180; // Normalize to [0, 180)
          if (Math.abs(deg - 90) < this.epsilon) {
            throw new Error('Tangent undefined at 90°');
          }
          if (Math.abs(deg) < this.epsilon || Math.abs(deg - 180) < this.epsilon) return 0; // tan(0°, 180°) = 0
          // Additional common angles
          if (Math.abs(deg - 45) < this.epsilon) return 1; // tan(45°) = 1
          if (Math.abs(deg - 135) < this.epsilon) return -1; // tan(135°) = -1
          if (Math.abs(deg - 30) < this.epsilon) return 0.5773502691896257; // tan(30°) = √3/3
          if (Math.abs(deg - 150) < this.epsilon) return -0.5773502691896257; // tan(150°) = -√3/3
          if (Math.abs(deg - 60) < this.epsilon) return 1.7320508075688772; // tan(60°) = √3
          if (Math.abs(deg - 120) < this.epsilon) return -1.7320508075688772; // tan(120°) = -√3
        } else {
          const rad = ((angleInRad % Math.PI) + Math.PI) % Math.PI; // Normalize to [0, π)
          if (Math.abs(rad - Math.PI/2) < this.epsilon) {
            throw new Error('Tangent undefined at π/2');
          }
          if (Math.abs(rad) < this.epsilon || Math.abs(rad - Math.PI) < this.epsilon) return 0; // tan(0, π) = 0
          // Additional common angles
          if (Math.abs(rad - Math.PI/4) < this.epsilon) return 1; // tan(π/4) = 1
          if (Math.abs(rad - 3*Math.PI/4) < this.epsilon) return -1; // tan(3π/4) = -1
          if (Math.abs(rad - Math.PI/6) < this.epsilon) return 0.5773502691896257; // tan(π/6) = √3/3
          if (Math.abs(rad - 5*Math.PI/6) < this.epsilon) return -0.5773502691896257; // tan(5π/6) = -√3/3
          if (Math.abs(rad - Math.PI/3) < this.epsilon) return 1.7320508075688772; // tan(π/3) = √3
          if (Math.abs(rad - 2*Math.PI/3) < this.epsilon) return -1.7320508075688772; // tan(2π/3) = -√3
        }
        const tanResult = Math.tan(angleInRad);
        // Handle very large results
        if (Math.abs(tanResult) > 1e15) throw new Error('Tangent result too large');
        return Math.abs(tanResult) < this.epsilon ? 0 : tanResult;
        
      // Inverse trigonometric functions
      case 'asin': 
        if (a < -1 || a > 1) throw new Error('Domain error for asin: input must be between -1 and 1');
        if (Math.abs(a) < this.epsilon) return 0; // asin(0) = 0
        if (Math.abs(a - 1) < this.epsilon) {
          // asin(1) = π/2 (in radians) or 90° (in degrees)
          return this.angleMode === 'deg' ? 90 : Math.PI/2;
        }
        if (Math.abs(a + 1) < this.epsilon) {
          // asin(-1) = -π/2 (in radians) or -90° (in degrees)
          return this.angleMode === 'deg' ? -90 : -Math.PI/2;
        }
        // Additional special cases
        if (Math.abs(a - 0.5) < this.epsilon) {
          // asin(0.5) = π/6 (in radians) or 30° (in degrees)
          return this.angleMode === 'deg' ? 30 : Math.PI/6;
        }
        if (Math.abs(a + 0.5) < this.epsilon) {
          // asin(-0.5) = -π/6 (in radians) or -30° (in degrees)
          return this.angleMode === 'deg' ? -30 : -Math.PI/6;
        }
        if (Math.abs(a - 0.7071067811865476) < this.epsilon) {
          // asin(√2/2) = π/4 (in radians) or 45° (in degrees)
          return this.angleMode === 'deg' ? 45 : Math.PI/4;
        }
        if (Math.abs(a + 0.7071067811865476) < this.epsilon) {
          // asin(-√2/2) = -π/4 (in radians) or -45° (in degrees)
          return this.angleMode === 'deg' ? -45 : -Math.PI/4;
        }
        if (Math.abs(a - 0.8660254037844386) < this.epsilon) {
          // asin(√3/2) = π/3 (in radians) or 60° (in degrees)
          return this.angleMode === 'deg' ? 60 : Math.PI/3;
        }
        if (Math.abs(a + 0.8660254037844386) < this.epsilon) {
          // asin(-√3/2) = -π/3 (in radians) or -60° (in degrees)
          return this.angleMode === 'deg' ? -60 : -Math.PI/3;
        }
        const asinResult = Math.asin(a);
        const asinConverted = this.angleMode === 'deg' ? (asinResult * 180 / Math.PI) : asinResult;
        return Math.abs(asinConverted) < this.epsilon ? 0 : asinConverted;
        
      case 'acos': 
        if (a < -1 || a > 1) throw new Error('Domain error for acos: input must be between -1 and 1');
        if (Math.abs(a - 1) < this.epsilon) return 0; // acos(1) = 0
        if (Math.abs(a) < this.epsilon) {
          // acos(0) = π/2 (in radians) or 90° (in degrees)
          return this.angleMode === 'deg' ? 90 : Math.PI/2;
        }
        if (Math.abs(a + 1) < this.epsilon) {
          // acos(-1) = π (in radians) or 180° (in degrees)
          return this.angleMode === 'deg' ? 180 : Math.PI;
        }
        // Additional special cases
        if (Math.abs(a - 0.5) < this.epsilon) {
          // acos(0.5) = π/3 (in radians) or 60° (in degrees)
          return this.angleMode === 'deg' ? 60 : Math.PI/3;
        }
        if (Math.abs(a + 0.5) < this.epsilon) {
          // acos(-0.5) = 2π/3 (in radians) or 120° (in degrees)
          return this.angleMode === 'deg' ? 120 : 2*Math.PI/3;
        }
        if (Math.abs(a - 0.7071067811865476) < this.epsilon) {
          // acos(√2/2) = π/4 (in radians) or 45° (in degrees)
          return this.angleMode === 'deg' ? 45 : Math.PI/4;
        }
        if (Math.abs(a + 0.7071067811865476) < this.epsilon) {
          // acos(-√2/2) = 3π/4 (in radians) or 135° (in degrees)
          return this.angleMode === 'deg' ? 135 : 3*Math.PI/4;
        }
        if (Math.abs(a - 0.8660254037844386) < this.epsilon) {
          // acos(√3/2) = π/6 (in radians) or 30° (in degrees)
          return this.angleMode === 'deg' ? 30 : Math.PI/6;
        }
        if (Math.abs(a + 0.8660254037844386) < this.epsilon) {
          // acos(-√3/2) = 5π/6 (in radians) or 150° (in degrees)
          return this.angleMode === 'deg' ? 150 : 5*Math.PI/6;
        }
        const acosResult = Math.acos(a);
        const acosConverted = this.angleMode === 'deg' ? (acosResult * 180 / Math.PI) : acosResult;
        return Math.abs(acosConverted) < this.epsilon ? 0 : acosConverted;
        
      case 'atan': 
        if (Math.abs(a) < this.epsilon) return 0; // atan(0) = 0
        // Special cases for common values
        if (Math.abs(a - 1) < this.epsilon) {
          // atan(1) = π/4 (in radians) or 45° (in degrees)
          return this.angleMode === 'deg' ? 45 : Math.PI/4;
        }
        if (Math.abs(a + 1) < this.epsilon) {
          // atan(-1) = -π/4 (in radians) or -45° (in degrees)
          return this.angleMode === 'deg' ? -45 : -Math.PI/4;
        }
        if (Math.abs(a - 0.5773502691896257) < this.epsilon) {
          // atan(√3/3) = π/6 (in radians) or 30° (in degrees)
          return this.angleMode === 'deg' ? 30 : Math.PI/6;
        }
        if (Math.abs(a + 0.5773502691896257) < this.epsilon) {
          // atan(-√3/3) = -π/6 (in radians) or -30° (in degrees)
          return this.angleMode === 'deg' ? -30 : -Math.PI/6;
        }
        if (Math.abs(a - 1.7320508075688772) < this.epsilon) {
          // atan(√3) = π/3 (in radians) or 60° (in degrees)
          return this.angleMode === 'deg' ? 60 : Math.PI/3;
        }
        if (Math.abs(a + 1.7320508075688772) < this.epsilon) {
          // atan(-√3) = -π/3 (in radians) or -60° (in degrees)
          return this.angleMode === 'deg' ? -60 : -Math.PI/3;
        }
        const atanResult = Math.atan(a);
        const atanConverted = this.angleMode === 'deg' ? (atanResult * 180 / Math.PI) : atanResult;
        return Math.abs(atanConverted) < this.epsilon ? 0 : atanConverted;
        
      // Hyperbolic functions
      case 'sinh': 
        if (Math.abs(a) < this.epsilon) return 0; // sinh(0) = 0
        // Special cases for common values
        if (Math.abs(a - 1) < this.epsilon) return 1.1752011936438014; // sinh(1)
        if (Math.abs(a + 1) < this.epsilon) return -1.1752011936438014; // sinh(-1)
        const sinhResult = Math.sinh(a);
        return Math.abs(sinhResult) < this.epsilon ? 0 : sinhResult;
        
      case 'cosh': 
        if (Math.abs(a) < this.epsilon) return 1; // cosh(0) = 1
        // Special cases for common values
        if (Math.abs(a - 1) < this.epsilon) return 1.5430806348152437; // cosh(1)
        if (Math.abs(a + 1) < this.epsilon) return 1.5430806348152437; // cosh(-1)
        const coshResult = Math.cosh(a);
        return Math.abs(coshResult - 1) < this.epsilon ? 1 : coshResult;
        
      case 'tanh': 
        if (Math.abs(a) < this.epsilon) return 0; // tanh(0) = 0
        // Special cases for common values
        if (Math.abs(a - 1) < this.epsilon) return 0.7615941559557649; // tanh(1)
        if (Math.abs(a + 1) < this.epsilon) return -0.7615941559557649; // tanh(-1)
        const tanhResult = Math.tanh(a);
        return Math.abs(tanhResult) < this.epsilon ? 0 : tanhResult;
        
      // Inverse hyperbolic functions
      case 'asinh': 
        if (Math.abs(a) < this.epsilon) return 0; // asinh(0) = 0
        // Special cases for common values
        if (Math.abs(a - 1) < this.epsilon) return 0.881373587019543; // asinh(1)
        if (Math.abs(a + 1) < this.epsilon) return -0.881373587019543; // asinh(-1)
        const asinhResult = Math.asinh(a);
        return Math.abs(asinhResult) < this.epsilon ? 0 : asinhResult;
        
      case 'acosh': 
        if (a < 1) throw new Error('Domain error for acosh: input must be >= 1');
        if (Math.abs(a - 1) < this.epsilon) return 0; // acosh(1) = 0
        // Special cases for common values
        if (Math.abs(a - 2) < this.epsilon) return 1.3169578969248166; // acosh(2)
        const acoshResult = Math.acosh(a);
        return Math.abs(acoshResult) < this.epsilon ? 0 : acoshResult;
        
      case 'atanh': 
        if (a <= -1 || a >= 1) throw new Error('Domain error for atanh: input must be between -1 and 1');
        if (Math.abs(a) < this.epsilon) return 0; // atanh(0) = 0
        // Special cases for common values
        if (Math.abs(a - 0.5) < this.epsilon) return 0.5493061443340549; // atanh(0.5)
        if (Math.abs(a + 0.5) < this.epsilon) return -0.5493061443340549; // atanh(-0.5)
        const atanhResult = Math.atanh(a);
        return Math.abs(atanhResult) < this.epsilon ? 0 : atanhResult;
        
      // Logarithmic functions
      case 'log': 
        if (a <= 0) throw new Error('Domain error for log: input must be positive');
        if (Math.abs(a - 1) < this.epsilon) return 0; // log10(1) = 0
        if (Math.abs(a - 10) < this.epsilon) return 1; // log10(10) = 1
        if (Math.abs(a - 100) < this.epsilon) return 2; // log10(100) = 2
        if (Math.abs(a - 1000) < this.epsilon) return 3; // log10(1000) = 3
        const logResult = Math.log10(a);
        return Math.abs(logResult) < this.epsilon ? 0 : logResult;
        
      case 'ln': 
        if (a <= 0) throw new Error('Domain error for ln: input must be positive');
        if (Math.abs(a - 1) < this.epsilon) return 0; // ln(1) = 0
        if (Math.abs(a - Math.E) < this.epsilon) return 1; // ln(e) = 1
        // Special cases for common values
        if (Math.abs(a - 2) < this.epsilon) return 0.6931471805599453; // ln(2)
        if (Math.abs(a - 0.5) < this.epsilon) return -0.6931471805599453; // ln(0.5)
        const lnResult = Math.log(a);
        return Math.abs(lnResult) < this.epsilon ? 0 : lnResult;
        
      // Power and root functions
      case 'sqrt': 
        if (a < 0) throw new Error('Domain error for sqrt: input must be non-negative');
        if (Math.abs(a) < this.epsilon) return 0; // sqrt(0) = 0
        if (Math.abs(a - 1) < this.epsilon) return 1; // sqrt(1) = 1
        if (Math.abs(a - 4) < this.epsilon) return 2; // sqrt(4) = 2
        if (Math.abs(a - 9) < this.epsilon) return 3; // sqrt(9) = 3
        if (Math.abs(a - 16) < this.epsilon) return 4; // sqrt(16) = 4
        if (Math.abs(a - 25) < this.epsilon) return 5; // sqrt(25) = 5
        if (Math.abs(a - 36) < this.epsilon) return 6; // sqrt(36) = 6
        if (Math.abs(a - 49) < this.epsilon) return 7; // sqrt(49) = 7
        if (Math.abs(a - 64) < this.epsilon) return 8; // sqrt(64) = 8
        if (Math.abs(a - 81) < this.epsilon) return 9; // sqrt(81) = 9
        if (Math.abs(a - 100) < this.epsilon) return 10; // sqrt(100) = 10
        const sqrtResult = Math.sqrt(a);
        return Math.abs(sqrtResult) < this.epsilon ? 0 : sqrtResult;
        
      case 'cbrt': 
        if (Math.abs(a) < this.epsilon) return 0; // cbrt(0) = 0
        if (Math.abs(a - 1) < this.epsilon) return 1; // cbrt(1) = 1
        if (Math.abs(a + 1) < this.epsilon) return -1; // cbrt(-1) = -1
        if (Math.abs(a - 8) < this.epsilon) return 2; // cbrt(8) = 2
        if (Math.abs(a + 8) < this.epsilon) return -2; // cbrt(-8) = -2
        if (Math.abs(a - 27) < this.epsilon) return 3; // cbrt(27) = 3
        if (Math.abs(a + 27) < this.epsilon) return -3; // cbrt(-27) = -3
        const cbrtResult = Math.cbrt(a);
        return Math.abs(cbrtResult) < this.epsilon ? 0 : cbrtResult;
        
      // Other functions
      case 'abs': 
        return Math.abs(a);
        
      case 'exp': 
        if (Math.abs(a) < this.epsilon) return 1; // exp(0) = 1
        if (Math.abs(a - 1) < this.epsilon) return Math.E; // exp(1) = e
        // Special cases for common values
        if (Math.abs(a - 2) < this.epsilon) return 7.38905609893065; // exp(2)
        if (Math.abs(a - 0.5) < this.epsilon) return 1.6487212707001282; // exp(0.5)
        const expResult = Math.exp(a);
        return Math.abs(expResult - 1) < this.epsilon ? 1 : expResult;
        
      case '!': 
        if (a < 0 || a !== Math.floor(a)) throw new Error('Factorial requires non-negative integer');
        if (a === 0 || a === 1) return 1; // 0! = 1! = 1
        if (a === 2) return 2; // 2! = 2
        if (a === 3) return 6; // 3! = 6
        if (a === 4) return 24; // 4! = 24
        if (a === 5) return 120; // 5! = 120
        if (a === 6) return 720; // 6! = 720
        if (a === 7) return 5040; // 7! = 5040
        if (a === 8) return 40320; // 8! = 40320
        if (a === 9) return 362880; // 9! = 362880
        if (a === 10) return 3628800; // 10! = 3628800
        let result = 1;
        for (let i = 2; i <= a; i++) result *= i;
        return result;
        
      default: throw new Error(`Unknown function: ${func}`);
    }
  }
  
  // Check if token is a number
  isNumber(token) {
    return !isNaN(token) && !isNaN(parseFloat(token));
  }
  
  // Check if token is an operator
  isOperator(token) {
    return ['+', '-', '*', '/', '^', '%'].includes(token);
  }
  
  // Check if token is a function
  isFunction(token) {
    return [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'log', 'ln', 'sqrt', 'cbrt', 'abs', 'exp', '!'
    ].includes(token);
  }
  
  // Get operator precedence (higher number means higher precedence)
  getPrecedence(operator) {
    switch (operator) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
      case '%':
        return 2;
      case '^':
        return 3; // Higher precedence for exponentiation
      default:
        return 0;
    }
  }
  
  // Greatest Common Divisor helper function
  gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  }
  
  // Check for simple fractions that should be exact
  checkSimpleFraction(result) {
    // Check for common fractions
    const fractions = [
      { value: 1/2, exact: 0.5 },
      { value: 1/3, exact: 0.3333333333333333 },
      { value: 2/3, exact: 0.6666666666666666 },
      { value: 1/4, exact: 0.25 },
      { value: 3/4, exact: 0.75 },
      { value: 1/5, exact: 0.2 },
      { value: 2/5, exact: 0.4 },
      { value: 3/5, exact: 0.6 },
      { value: 4/5, exact: 0.8 },
      { value: 1/6, exact: 0.16666666666666666 },
      { value: 5/6, exact: 0.8333333333333334 },
      { value: 1/8, exact: 0.125 },
      { value: 3/8, exact: 0.375 },
      { value: 5/8, exact: 0.625 },
      { value: 7/8, exact: 0.875 }
    ];
    
    for (const fraction of fractions) {
      if (Math.abs(result - fraction.value) < this.epsilon) {
        return fraction.value;
      }
    }
    
    return null;
  }
  
  // Check for common square roots
  checkCommonSquareRoots(result) {
    // Check for common square roots
    const sqrtValues = [
      { value: Math.sqrt(2), exact: 1.4142135623730951 },
      { value: Math.sqrt(3), exact: 1.7320508075688772 },
      { value: Math.sqrt(5), exact: 2.23606797749979 },
      { value: Math.sqrt(6), exact: 2.449489742783178 },
      { value: Math.sqrt(7), exact: 2.6457513110645907 },
      { value: Math.sqrt(8), exact: 2.8284271247461903 },
      { value: Math.sqrt(10), exact: 3.1622776601683795 }
    ];
    
    for (const sqrtVal of sqrtValues) {
      if (Math.abs(result - sqrtVal.value) < this.epsilon) {
        return sqrtVal.value;
      }
    }
    
    return null;
  }
  
  // Precise rounding function
  preciseRound(value) {
    // First try rounding to eliminate floating point errors
    const rounded = Math.round(value * 1e12) / 1e12;
    
    // If the result is very close to an integer, return the integer
    if (Math.abs(value - Math.round(value)) < this.epsilon * 1000) {
      return Math.round(value);
    }
    
    // If the result is very close to a simple decimal, return that
    const simpleDecimals = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
    for (const decimal of simpleDecimals) {
      if (Math.abs(Math.abs(value) - decimal) < this.epsilon * 1000) {
        return value < 0 ? -decimal : decimal;
      }
    }
    
    return rounded;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpressionParser;
}