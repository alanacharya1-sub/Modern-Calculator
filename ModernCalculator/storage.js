class CalculatorStorage {
  constructor() {
    this.storageKey = 'scientificCalculator';
  }
  
  save(key, data) {
    try {
      const storedData = this.getAllData();
      storedData[key] = data;
      localStorage.setItem(this.storageKey, JSON.stringify(storedData));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }
  
  load(key, defaultValue = null) {
    try {
      const storedData = this.getAllData();
      return storedData[key] !== undefined ? storedData[key] : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  }
  
  // Get all stored data
  getAllData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return {};
    }
  }
  
  // Clear specific data
  clear(key) {
    try {
      const storedData = this.getAllData();
      delete storedData[key];
      localStorage.setItem(this.storageKey, JSON.stringify(storedData));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage data:', error);
      return false;
    }
  }
  
  // Clear all calculator data
  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing all localStorage data:', error);
      return false;
    }
  }
  
  // Save calculator history
  saveHistory(history) {
    return this.save('history', history);
  }
  
  // Load calculator history
  loadHistory(defaultValue = []) {
    return this.load('history', defaultValue);
  }
  
  // Save memory value
  saveMemory(memory) {
    return this.save('memory', memory);
  }
  
  // Load memory value
  loadMemory(defaultValue = 0) {
    return this.load('memory', defaultValue);
  }
  
  // Save variables
  saveVariables(variables) {
    return this.save('variables', variables);
  }
  
  // Load variables
  loadVariables(defaultValue = {}) {
    return this.load('variables', defaultValue);
  }
  
  // Save settings
  saveSettings(settings) {
    return this.save('settings', settings);
  }
  
  // Load settings
  loadSettings(defaultValue = {}) {
    return this.load('settings', defaultValue);
  }
  
  // Save theme preference
  saveTheme(theme) {
    const settings = this.loadSettings();
    settings.theme = theme;
    return this.saveSettings(settings);
  }
  
  // Load theme preference
  loadTheme(defaultValue = 'light') {
    const settings = this.loadSettings();
    return settings.theme || defaultValue;
  }
  
  // Save angle mode preference
  saveAngleMode(angleMode) {
    const settings = this.loadSettings();
    settings.angleMode = angleMode;
    return this.saveSettings(settings);
  }
  
  // Load angle mode preference
  loadAngleMode(defaultValue = 'deg') {
    const settings = this.loadSettings();
    return settings.angleMode || defaultValue;
  }
  
  // Export history to text file
  exportHistoryToText(history) {
    try {
      let content = 'Calculator History\n';
      content += '==================\n\n';
      
      history.forEach((item, index) => {
        content += `${index + 1}. ${item.expression} = ${item.result}\n`;
      });
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calculator-history.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting history:', error);
      return false;
    }
  }
  
  // Import history from JSON
  importHistoryFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        return this.saveHistory(data);
      }
      return false;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }
  
  // Check if localStorage is available
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Get storage usage information
  getStorageInfo() {
    try {
      const used = JSON.stringify(localStorage).length;
      const limit = 5 * 1024 * 1024; // 5MB typical limit
      const percentage = (used / limit) * 100;
      
      return {
        used: used,
        limit: limit,
        percentage: percentage,
        available: limit - used
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalculatorStorage;
}