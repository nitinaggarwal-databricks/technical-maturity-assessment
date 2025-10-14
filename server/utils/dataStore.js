const fs = require('fs');
const path = require('path');

class DataStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = new Map();
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileData = fs.readFileSync(this.filePath, 'utf8');
        const jsonData = JSON.parse(fileData);
        this.data = new Map(Object.entries(jsonData));
        console.log(`✅ Loaded ${this.data.size} assessments from disk`);
      } else {
        console.log('📝 No existing data file found, starting fresh');
      }
    } catch (error) {
      console.error('Error loading data from disk:', error);
      this.data = new Map();
    }
  }

  saveData() {
    try {
      const jsonData = Object.fromEntries(this.data);
      const dirPath = path.dirname(this.filePath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      fs.writeFileSync(this.filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving data to disk:', error);
    }
  }

  set(key, value) {
    this.data.set(key, value);
    this.saveData();
  }

  get(key) {
    return this.data.get(key);
  }

  has(key) {
    return this.data.has(key);
  }

  delete(key) {
    const result = this.data.delete(key);
    this.saveData();
    return result;
  }

  values() {
    return this.data.values();
  }

  keys() {
    return this.data.keys();
  }

  clear() {
    this.data.clear();
    this.saveData();
  }

  get size() {
    return this.data.size;
  }

  getAll() {
    return Object.fromEntries(this.data);
  }

  entries() {
    return this.data.entries();
  }
}

module.exports = DataStore;

