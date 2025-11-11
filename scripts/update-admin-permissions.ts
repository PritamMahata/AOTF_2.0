/**
 * Update Admin Permissions Script
 * 
 * This script updates existing admin users' permissions to match the current
 * ROLE_PERMISSIONS configuration in src/config/admin-permissions.ts
 * 
 * Usage:
 *   tsx src/scripts/update-admin-permissions.ts
 *   
 * Or to update a specific admin by email:
 *   set ADMIN_EMAIL=admin@example.com
 *   tsx src/scripts/update-admin-permissions.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import * as readline from 'readline';
import Admin from '../src/models/Admin';
import { ROLE_PERMISSIONS, getRoleDisplayName } from '../packages/config/src/admin-permissions';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateAdminPermissions() {
  try {
    console.log('🔄 Admin Permissions Update Script');
    console.log('=' .repeat(50));

    // Connect to database
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const targetEmail = process.env.ADMIN_EMAIL;

    let admins;
    if (targetEmail) {
      console.log(`\n🔍 Finding admin with email: ${targetEmail}`);
      admins = await Admin.find({ email: targetEmail.toLowerCase() });
      
      if (admins.length === 0) {
        console.log(`❌ No admin found with email: ${targetEmail}`);
        process.exit(1);
      }
    } else {
      console.log('\n🔍 Finding all admin users...');
      admins = await Admin.find({});
      
      if (admins.length === 0) {
        console.log('❌ No admin users found in database!');
        console.log('💡 Create an admin first using: npm run seed-admin');
        process.exit(1);
      }

      console.log(`\n📋 Found ${admins.length} admin user(s):`);
      admins.forEach((admin, index) => {
        console.log(`\n  ${index + 1}. ${admin.email}`);
        console.log(`     Role: ${getRoleDisplayName(admin.role)}`);
        console.log(`     Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
      });

      const updateAll = await promptUser('\n❓ Update ALL admins? (yes/no, default: yes): ') || 'yes';
      
      if (updateAll.toLowerCase() !== 'yes' && updateAll.toLowerCase() !== 'y') {
        const emailInput = await promptUser('Enter admin email to update: ');
        admins = await Admin.find({ email: emailInput.toLowerCase() });
        
        if (admins.length === 0) {
          console.log(`❌ No admin found with email: ${emailInput}`);
          process.exit(1);
        }
      }
    }

    console.log('\n🔄 Updating permissions...\n');

    let updatedCount = 0;

    for (const admin of admins) {
      const oldPermissions = { ...admin.permissions };
      const newPermissions = ROLE_PERMISSIONS[admin.role];

      console.log(`\n📝 Updating: ${admin.email}`);
      console.log(`   Role: ${getRoleDisplayName(admin.role)}`);
      console.log('\n   Old Permissions → New Permissions:');
        // Show permission changes
      const allPermissions = new Set([
        ...Object.keys(oldPermissions),
        ...Object.keys(newPermissions),
      ]);

      allPermissions.forEach(perm => {
        const oldValue = oldPermissions[perm as keyof typeof oldPermissions];
        const newValue = newPermissions[perm as keyof typeof newPermissions];
        
        if (oldValue !== newValue) {
          console.log(`   ${perm}: ${oldValue ? '✓' : '✗'} → ${newValue ? '✓' : '✗'} (CHANGED)`);
        } else {
          console.log(`   ${perm}: ${newValue ? '✓' : '✗'}`);
        }
      });

      // Update permissions
      admin.permissions = newPermissions;
      await admin.save();
      updatedCount++;

      console.log(`   ✅ Updated successfully!`);
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully updated ${updatedCount} admin user(s)!`);
    console.log('\n💡 Changes will take effect on next login.');
    console.log('🔐 Admins may need to log out and log back in to see changes.');

  } catch (error) {
    console.error('\n❌ Error updating admin permissions:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    rl.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run the update function
updateAdminPermissions();
