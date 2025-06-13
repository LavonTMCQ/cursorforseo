#!/usr/bin/env tsx

/**
 * Database Deployment Script
 * Pushes Prisma schema to production database
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

async function deployDatabase() {
  console.log('🚀 Starting database deployment...');
  
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('📊 Database URL found');
    console.log('🔄 Pushing Prisma schema to database...');
    
    // Push the schema to the database
    execSync('pnpm prisma db push', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    console.log('✅ Database schema deployed successfully!');
    console.log('🎯 Database is ready for production use');
    
  } catch (error) {
    console.error('❌ Database deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deployDatabase();
