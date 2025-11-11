/**
 * Admin User Seeding Script
 * 
 * This script creates the initial admin user in the database.
 * Run this script once to set up your first admin account.
 * 
 * Usage:
 *   tsx src/scripts/seed-admin.ts
 * 
 * Or with custom values:
 *   ADMIN_EMAIL="your@email.com" ADMIN_PASSWORD="yourpassword" ADMIN_NAME="Your Name" tsx src/scripts/seed-admin.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin';
import * as readline from 'readline';
import { ROLE_PERMISSIONS, getRoleDisplayName, getRoleDescription } from '../packages/config/src/admin-permissions';
import type { AdminRole } from '../packages/config/src/admin-permissions';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Environment variables for custom admin creation
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aottuition.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';
const DEFAULT_ADMIN_ROLE = (process.env.ADMIN_ROLE as AdminRole) || 'super_admin';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academy-of-tutors';

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if any admin already exists
    const existingAdminCount = await Admin.countDocuments();
    
    if (existingAdminCount > 0) {
      console.log('⚠️  Admin users already exist in the database.');
      const shouldContinue = await promptUser('Do you want to create another admin? (yes/no): ');
      
      if (shouldContinue.toLowerCase() !== 'yes' && shouldContinue.toLowerCase() !== 'y') {
        console.log('❌ Admin creation cancelled.');
        process.exit(0);
      }
    }    // Get admin details
    let email = DEFAULT_ADMIN_EMAIL;
    let password = DEFAULT_ADMIN_PASSWORD;
    let name = DEFAULT_ADMIN_NAME;
    let role: AdminRole = DEFAULT_ADMIN_ROLE;

    // If not provided via environment variables, prompt user
    if (!process.env.ADMIN_EMAIL) {
      email = await promptUser(`Enter admin email (default: ${DEFAULT_ADMIN_EMAIL}): `) || DEFAULT_ADMIN_EMAIL;
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log(`❌ Admin with email ${email} already exists!`);
      process.exit(1);
    }

    if (!process.env.ADMIN_PASSWORD) {
      password = await promptUser('Enter admin password (min 8 characters): ');
      if (password.length < 8) {
        console.log('❌ Password must be at least 8 characters long!');
        process.exit(1);
      }
    }

    if (!process.env.ADMIN_NAME) {
      name = await promptUser(`Enter admin name (default: ${DEFAULT_ADMIN_NAME}): `) || DEFAULT_ADMIN_NAME;
    }

    // Role selection
    if (!process.env.ADMIN_ROLE) {
      console.log('\n📋 Available Admin Roles:');
      console.log('  1. Super Admin - ' + getRoleDescription('super_admin'));
      console.log('  2. Support Admin - ' + getRoleDescription('support_admin'));
      const roleChoice = await promptUser('\nSelect role (1 or 2, default: 1): ') || '1';
      
      if (roleChoice === '2') {
        role = 'support_admin';
      } else {
        role = 'super_admin';
      }
    }

    // Get permissions based on role
    const permissions = ROLE_PERMISSIONS[role];    // Create admin user
    console.log('\n📝 Creating admin user...');
    
    const admin = new Admin({
      email: email.toLowerCase(),
      password: password, // Will be hashed by the pre-save hook
      name: name,
      role: role,
      permissions: permissions,
      isActive: true,
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${getRoleDisplayName(admin.role)}`);
    console.log(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    console.log('\n🔑 Permissions:');
    Object.entries(admin.permissions).forEach(([key, value]) => {
      console.log(`   ${key}: ${value ? '✓' : '✗'}`);
    });
    console.log('\n🔐 You can now login at: /admin/login');
    console.log('\n⚠️  Important: Keep your admin credentials secure!');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run the seeding function
seedAdmin();
