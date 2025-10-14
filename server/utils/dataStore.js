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
        console.log(`📁 Data file location: ${this.filePath}`);
        console.log(`💾 File size: ${(fs.statSync(this.filePath).size / 1024).toFixed(2)} KB`);
      } else {
        console.log('📝 No existing data file found, starting fresh');
        console.log(`📁 Will create new file at: ${this.filePath}`);
      }
    } catch (error) {
      console.error('❌ Error loading data from disk:', error);
      console.error('❌ File path:', this.filePath);
      
      // Try to recover from backup if available
      const backupPath = this.filePath + '.backup';
      if (fs.existsSync(backupPath)) {
        console.log('🔄 Attempting to restore from backup...');
        try {
          const backupData = fs.readFileSync(backupPath, 'utf8');
          const jsonData = JSON.parse(backupData);
          this.data = new Map(Object.entries(jsonData));
          console.log(`✅ Restored ${this.data.size} assessments from backup`);
          // Save the restored data to main file
          this.saveData();
          return;
        } catch (backupError) {
          console.error('❌ Failed to restore from backup:', backupError);
        }
      }
      
      this.data = new Map();
    }
  }

  saveData() {
    try {
      const jsonData = Object.fromEntries(this.data);
      const dirPath = path.dirname(this.filePath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        console.log(`📁 Creating data directory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Create backup of existing file before overwriting
      if (fs.existsSync(this.filePath)) {
        const backupPath = this.filePath + '.backup';
        try {
          fs.copyFileSync(this.filePath, backupPath);
        } catch (backupError) {
          console.warn('⚠️  Failed to create backup:', backupError.message);
        }
      }
      
      // Write to temporary file first, then rename (atomic operation)
      const tempPath = this.filePath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(jsonData, null, 2), 'utf8');
      fs.renameSync(tempPath, this.filePath);
      
      console.log(`💾 Saved ${this.data.size} assessments to disk successfully`);
    } catch (error) {
      console.error('❌ CRITICAL: Error saving data to disk:', error);
      console.error('❌ File path:', this.filePath);
      console.error('❌ Directory writable:', this.isDirectoryWritable(path.dirname(this.filePath)));
      
      // Alert but don't crash - data is still in memory
      console.error('⚠️  DATA IS ONLY IN MEMORY - WILL BE LOST ON RESTART!');
    }
  }

  isDirectoryWritable(dirPath) {
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
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

