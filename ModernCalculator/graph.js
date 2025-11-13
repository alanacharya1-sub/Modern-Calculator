class GraphingCalculator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Coordinate system settings
    this.xMin = -10;
    this.xMax = 10;
    this.yMin = -10;
    this.yMax = 10;
    
    // Zoom and pan settings
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Graphs storage
    this.graphs = [];
    this.colors = ['#FF6B6B', '#4D9DE0', '#2EC4B6', '#FF9F1C', '#6A0572'];
    
    // Initialize
    this.setupEventListeners();
    this.draw();
  }
  
  setupEventListeners() {
    // Zoom with mouse wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomIntensity = 0.1;
      const wheel = e.deltaY < 0 ? 1 : -1;
      const zoom = Math.exp(wheel * zoomIntensity);
      
      // Get mouse position relative to canvas
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Convert to graph coordinates
      const graphX = this.screenToGraphX(mouseX);
      const graphY = this.screenToGraphY(mouseY);
      
      // Apply zoom
      this.scale *= zoom;
      
      // Adjust offset to zoom towards mouse position
      this.offsetX = graphX - (graphX - this.offsetX) * zoom;
      this.offsetY = graphY - (graphY - this.offsetY) * zoom;
      
      this.draw();
    });
    
    // Pan with mouse drag
    let isDragging = false;
    let lastX, lastY;
    
    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        // Convert screen delta to graph coordinates
        const graphDeltaX = deltaX * (this.xMax - this.xMin) / (this.width * this.scale);
        const graphDeltaY = -deltaY * (this.yMax - this.yMin) / (this.height * this.scale);
        
        this.offsetX -= graphDeltaX;
        this.offsetY -= graphDeltaY;
        
        lastX = e.clientX;
        lastY = e.clientY;
        
        this.draw();
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      isDragging = false;
    });
  }
  
  // Add a function to graph
  addFunction(funcString, colorIndex = null) {
    try {
      // Create a function from the string
      // Note: In a real implementation, you would want to use a safer parser
      const func = new Function('x', `return ${funcString.replace(/(\d)([a-zA-Z])/g, '$1*$2')}`);
      
      // Assign a color
      const color = this.colors[colorIndex % this.colors.length] || this.colors[this.graphs.length % this.colors.length];
      
      // Add to graphs array
      this.graphs.push({
        func: func,
        funcString: funcString,
        color: color
      });
      
      this.draw();
      return true;
    } catch (error) {
      console.error('Error adding function:', error);
      return false;
    }
  }
  
  // Remove all graphs
  clearGraphs() {
    this.graphs = [];
    this.draw();
  }
  
  // Reset view
  resetView() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.draw();
  }
  
  // Draw everything
  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background
    this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--display-bg') || '#d0d0d0';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Save context
    this.ctx.save();
    
    // Apply transformations
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.scale, -this.scale); // Negative y scale to flip y-axis
    this.ctx.translate(-this.offsetX, -this.offsetY);
    
    // Draw grid
    this.drawGrid();
    
    // Draw axes
    this.drawAxes();
    
    // Draw graphs
    this.drawGraphs();
    
    // Restore context
    this.ctx.restore();
    
    // Draw legend
    this.drawLegend();
  }
  
  // Draw coordinate grid
  drawGrid() {
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 0.5 / this.scale;
    
    // Calculate grid spacing based on zoom level
    const gridSize = Math.pow(10, Math.floor(Math.log10(10 / this.scale)));
    
    // Vertical grid lines
    const startX = Math.ceil((this.xMin - this.offsetX) / gridSize) * gridSize;
    const endX = Math.floor((this.xMax - this.offsetX) / gridSize) * gridSize;
    
    for (let x = startX; x <= endX; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.yMin - this.offsetY);
      this.ctx.lineTo(x, this.yMax - this.offsetY);
      this.ctx.stroke();
    }
    
    // Horizontal grid lines
    const startY = Math.ceil((this.yMin - this.offsetY) / gridSize) * gridSize;
    const endY = Math.floor((this.yMax - this.offsetY) / gridSize) * gridSize;
    
    for (let y = startY; y <= endY; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.xMin - this.offsetX, y);
      this.ctx.lineTo(this.xMax - this.offsetX, y);
      this.ctx.stroke();
    }
  }
  
  // Draw coordinate axes
  drawAxes() {
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.lineWidth = 1.5 / this.scale;
    
    // X-axis
    this.ctx.beginPath();
    this.ctx.moveTo(this.xMin - this.offsetX, 0);
    this.ctx.lineTo(this.xMax - this.offsetX, 0);
    this.ctx.stroke();
    
    // Y-axis
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.yMin - this.offsetY);
    this.ctx.lineTo(0, this.yMax - this.offsetY);
    this.ctx.stroke();
    
    // Draw axis labels
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.font = `${12 / this.scale}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    // X-axis labels
    const xGridSize = Math.pow(10, Math.floor(Math.log10(10 / this.scale)));
    const xStart = Math.ceil((this.xMin - this.offsetX) / xGridSize) * xGridSize;
    const xEnd = Math.floor((this.xMax - this.offsetX) / xGridSize) * xGridSize;
    
    for (let x = xStart; x <= xEnd; x += xGridSize) {
      if (Math.abs(x) > 0.001) { // Skip label at origin
        this.ctx.fillText(x.toFixed(1), x, 0.5 / this.scale);
      }
    }
    
    // Y-axis labels
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    
    const yGridSize = Math.pow(10, Math.floor(Math.log10(10 / this.scale)));
    const yStart = Math.ceil((this.yMin - this.offsetY) / yGridSize) * yGridSize;
    const yEnd = Math.floor((this.yMax - this.offsetY) / yGridSize) * yGridSize;
    
    for (let y = yStart; y <= yEnd; y += yGridSize) {
      if (Math.abs(y) > 0.001) { // Skip label at origin
        this.ctx.fillText(y.toFixed(1), -0.5 / this.scale, y);
      }
    }
  }
  
  // Draw all graphs
  drawGraphs() {
    for (const graph of this.graphs) {
      this.drawGraph(graph);
    }
  }
  
  // Draw a single graph
  drawGraph(graph) {
    this.ctx.strokeStyle = graph.color;
    this.ctx.lineWidth = 2 / this.scale;
    this.ctx.beginPath();
    
    const step = (this.xMax - this.xMin) / (this.width * 2); // Adaptive step size
    
    let firstPoint = true;
    for (let x = this.xMin - this.offsetX; x <= this.xMax - this.offsetX; x += step) {
      try {
        const y = graph.func(x);
        
        // Skip if result is not a finite number
        if (!isFinite(y)) {
          firstPoint = true;
          continue;
        }
        
        if (firstPoint) {
          this.ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          this.ctx.lineTo(x, y);
        }
      } catch (error) {
        // Skip points that cause errors
        firstPoint = true;
      }
    }
    
    this.ctx.stroke();
  }
  
  // Draw legend
  drawLegend() {
    if (this.graphs.length === 0) return;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillRect(10, 10, 200, 20 + this.graphs.length * 20);
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('Graphs:', 20, 25);
    
    for (let i = 0; i < this.graphs.length; i++) {
      const graph = this.graphs[i];
      
      // Draw color box
      this.ctx.fillStyle = graph.color;
      this.ctx.fillRect(20, 35 + i * 20, 15, 15);
      
      // Draw function string
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillText(graph.funcString, 40, 47 + i * 20);
    }
  }
  
  // Convert screen coordinates to graph coordinates
  screenToGraphX(screenX) {
    return (screenX - this.width / 2) / this.scale + this.offsetX;
  }
  
  screenToGraphY(screenY) {
    return -(screenY - this.height / 2) / this.scale + this.offsetY;
  }
  
  // Convert graph coordinates to screen coordinates
  graphToScreenX(graphX) {
    return (graphX - this.offsetX) * this.scale + this.width / 2;
  }
  
  graphToScreenY(graphY) {
    return (-graphY + this.offsetY) * this.scale + this.height / 2;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GraphingCalculator;
}