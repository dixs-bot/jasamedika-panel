const fs = require('fs').promises;
const path = require('path');

class Storage {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir);
    } catch (error) {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async readFile(filename) {
    await this.ensureDataDir();
    const filePath = path.join(this.dataDir, filename);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeFile(filename, data) {
    await this.ensureDataDir();
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async appendToFile(filename, item) {
    const data = await this.readFile(filename);
    data.push(item);
    await this.writeFile(filename, data);
    return item;
  }

  async findInFile(filename, predicate) {
    const data = await this.readFile(filename);
    return data.find(predicate);
  }

  async filterInFile(filename, predicate) {
    const data = await this.readFile(filename);
    return data.filter(predicate);
  }

  async updateInFile(filename, id, updates) {
    const data = await this.readFile(filename);
    const index = data.findIndex(item => item.id === id || item.idUser === id || item.idEmployee === id);
    
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    data[index] = { ...data[index], ...updates };
    await this.writeFile(filename, data);
    return data[index];
  }

  async deleteFromFile(filename, id) {
    const data = await this.readFile(filename);
    const index = data.findIndex(item => item.id === id || item.idUser === id || item.idEmployee === id);
    
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    const deleted = data.splice(index, 1)[0];
    await this.writeFile(filename, data);
    return deleted;
  }

  generateId(prefix = 'id') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }
}

module.exports = new Storage();