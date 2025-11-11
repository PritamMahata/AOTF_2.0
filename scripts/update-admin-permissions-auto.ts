/**
 * Update Admin Permissions Script (Auto Mode)
 * 
 * This script automatically updates ALL admin users' permissions to match
 * the current ROLE_PERMISSIONS configuration without prompting.
 * 
 * Usage:
 *   npm run update:admin-permissions-auto
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin';
import { ROLE_PERMISSIONS, getRoleDisplayName } from '../packages/config/src/admin-permissions';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academy-of-tutors';

async function updateAdminPermissions() {
  try {
    console.log('🔄 Admin Permissions Update Script (Auto Mode)');
    console.log('=' .repeat(50));

    // Connect to database
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Finding all admin users...');
    const admins = await Admin.find({});
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in database!');
      console.log('💡 Create an admin first using: npm run seed:admin');
      process.exit(1);
    }

    console.log(`\n📋 Found ${admins.length} admin user(s):`);
    admins.forEach((admin, index) => {
      console.log(`\n  ${index + 1}. ${admin.email}`);
      console.log(`     Role: ${getRoleDisplayName(admin.role)}`);
      console.log(`     Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log('\n🔄 Updating all admins automatically...\n');

    let updatedCount = 0;

    for (const admin of admins) {
      const oldPermissions = { ...admin.permissions };
      const newPermissions = ROLE_PERMISSIONS[admin.role];

      console.log(`\n📝 Updating: ${admin.email}`);
      console.log(`   Role: ${getRoleDisplayName(admin.role)}`);
      console.log('\n   Permission Changes:');
      
      // Show permission changes
      const allPermissions = new Set([
        ...Object.keys(oldPermissions),
        ...Object.keys(newPermissions),
      ]);

      let hasChanges = false;
      allPermissions.forEach(perm => {
        const oldValue = oldPermissions[perm as keyof typeof oldPermissions];
        const newValue = newPermissions[perm as keyof typeof newPermissions];
        
        if (oldValue !== newValue) {
          console.log(`   ${perm}: ${oldValue ? '✓' : '✗'} → ${newValue ? '✓' : '✗'} ⚠️ CHANGED`);
          hasChanges = true;
        } else {
          console.log(`   ${perm}: ${newValue ? '✓' : '✗'}`);
        }
      });

      if (!hasChanges) {
        console.log('   ℹ️ No changes needed - already up to date');
      }

      // Update permissions
      admin.permissions = newPermissions;
      await admin.save();
      updatedCount++;

      console.log(`   ✅ Updated successfully!`);
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully updated ${updatedCount} admin user(s)!`);
    console.log('\n💡 Changes will take effect on next login.');
    console.log('🔐 Admins need to log out and log back in to see changes.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Log out from admin panel');
    console.log('   2. Clear browser cookies/localStorage (or use Incognito)');
    console.log('   3. Log back in');
    console.log('   4. Test access to restricted pages');

  } catch (error) {
    console.error('\n❌ Error updating admin permissions:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run the update function
updateAdminPermissions();
