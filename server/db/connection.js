const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * PostgreSQL Database Connection Manager
 * Handles connection pooling and database initialization
 */
class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
  }

  /**
   * Initialize database connection pool
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Railway provides DATABASE_URL automatically when you provision PostgreSQL
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        console.warn('⚠️  DATABASE_URL not found - PostgreSQL not configured');
        console.warn('⚠️  Falling back to file-based storage');
        return false;
      }

      console.log('🔌 Connecting to PostgreSQL database...');
      
      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      // Test connection
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      console.log('✅ PostgreSQL connected successfully');
      console.log(`⏰ Database time: ${result.rows[0].now}`);

      // Run schema initialization
      await this.initializeSchema();

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error.message);
      console.error('⚠️  Falling back to file-based storage');
      return false;
    }
  }

  /**
   * Initialize database schema (create tables if they don't exist)
   */
  async initializeSchema() {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      console.log('📋 Initializing database schema...');
      await this.pool.query(schema);
      console.log('✅ Database schema initialized');

    } catch (error) {
      console.error('❌ Failed to initialize schema:', error.message);
      throw error;
    }
  }

  /**
   * Execute a query
   */
  async query(text, params) {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`⚠️  Slow query (${duration}ms): ${text.substring(0, 100)}...`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Query error:', error.message);
      console.error('Query:', text);
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return await this.pool.connect();
  }

  /**
   * Close all database connections
   */
  async close() {
    if (this.pool) {
      console.log('🔌 Closing database connections...');
      await this.pool.end();
      this.isInitialized = false;
      console.log('✅ Database connections closed');
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.rows[0].health === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const assessmentCount = await this.query('SELECT COUNT(*) as count FROM assessments');
      const activeCount = await this.query("SELECT COUNT(*) as count FROM assessments WHERE status = 'in_progress'");
      const completedCount = await this.query("SELECT COUNT(*) as count FROM assessments WHERE status = 'completed'");
      
      return {
        total: parseInt(assessmentCount.rows[0].count),
        active: parseInt(activeCount.rows[0].count),
        completed: parseInt(completedCount.rows[0].count),
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  }
}

// Export singleton instance
const db = new DatabaseConnection();

module.exports = db;






