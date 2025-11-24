#!/usr/bin/env node

/**
 * Generate bcrypt password hashes for test users
 * Run: node generate-test-user-hashes.js
 */

const bcrypt = require('bcrypt');

const passwords = {
  admin: 'admin123',
  author: 'author123',
  consumer: 'consumer123'
};

async function generateHashes() {
  console.log('\n🔐 Generating bcrypt hashes for test users...\n');
  
  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${role.toUpperCase()}:`);
    console.log(`  Password: ${password}`);
    console.log(`  Hash: ${hash}`);
    console.log('');
  }
  
  console.log('✅ Done! Copy these hashes to your migration file.\n');
}

generateHashes().catch(console.error);


