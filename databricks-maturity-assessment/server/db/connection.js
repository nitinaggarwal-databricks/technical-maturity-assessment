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
    this.isInitializing = false;
    this.schemaInitialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize database connection pool
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    // If already initializing, wait for that to complete
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this._doInitialize();
    
    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
    }
  }

  async _doInitialize() {
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

      // Run schema initialization (only once)
      if (!this.schemaInitialized) {
        await this.initializeSchema();
        this.schemaInitialized = true;
      }

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error.message);
      console.error('⚠️  Falling back to file-based storage');
      // Mark as initialized even when PostgreSQL fails (file-based fallback)
      this.isInitialized = true;
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

      // Run migrations
      await this.runMigrations();

    } catch (error) {
      console.error('❌ Failed to initialize schema:', error.message);
      throw error;
    }
  }

  /**
   * Run all SQL migration files in the migrations/ directory
   */
  async runMigrations() {
    try {
      const migrationsDir = path.join(__dirname, 'migrations');
      
      // Check if migrations directory exists
      if (!fs.existsSync(migrationsDir)) {
        console.log('ℹ️  No migrations directory found, skipping migrations');
        return;
      }

      // Get all .sql files in migrations directory
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Run in alphabetical order (001, 002, etc.)

      if (files.length === 0) {
        console.log('ℹ️  No migration files found');
        return;
      }

      console.log(`🔄 Running ${files.length} migration(s)...`);

      for (const file of files) {
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        try {
          await this.pool.query(migrationSQL);
          console.log(`  ✅ ${file}`);
        } catch (error) {
          // If error is "already exists", it's okay - migration was already run
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`  ⏭️  ${file} (already applied)`);
          } else {
            console.error(`  ❌ ${file}: ${error.message}`);
            // Continue with other migrations even if one fails
          }
        }
      }

      console.log('✅ Migrations completed');

    } catch (error) {
      console.error('❌ Failed to run migrations:', error.message);
      // Don't throw - allow app to continue even if migrations fail
    }
  }

  /**
   * Execute a query
   */
  async query(text, params) {
    if (!this.isInitialized || !this.pool) {
      throw new Error('PostgreSQL not available. Using file-based storage.');
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






