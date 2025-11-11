/**
 * Migration Script: Backfill Guardian IDs for Existing Posts
 * 
 * This script updates all existing posts in the database to include the guardianId
 * by matching the post's userId (email) with the Guardian collection.
 * 
 * Usage:
 * 1. Run directly: npx tsx src/scripts/backfill-guardian-ids.ts
 * 2. Or via Node: node --loader ts-node/esm src/scripts/backfill-guardian-ids.ts
 */

import connectToDatabase from '../src/lib/mongodb';
import Post from '../src/models/Post';
import Guardian from '../src/models/Guardian';
import User from '../src/models/User';

async function backfillGuardianIds() {
  console.log('🚀 Starting guardian ID backfill migration...\n');

  try {
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    // Find all posts that don't have a guardianId
    const postsWithoutGuardianId = await Post.find({ 
      $or: [
        { guardianId: { $exists: false } },
        { guardianId: null },
        { guardianId: '' }
      ]
    });

    console.log(`📊 Found ${postsWithoutGuardianId.length} posts without guardian IDs\n`);

    if (postsWithoutGuardianId.length === 0) {
      console.log('✨ All posts already have guardian IDs assigned. Nothing to do!');
      process.exit(0);
    }

    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    // Process each post
    for (const post of postsWithoutGuardianId) {
      try {
        // Try to find guardian by userId (which contains email)
        let email = post.userId;
        
        // If userId is a MongoDB ObjectId, lookup the User collection
        if (!email?.includes('@')) {
          const user = await User.findById(post.userId);
          if (user) {
            email = user.email;
          }
        }

        if (!email) {
          console.log(`⚠️  Post ${post.postId}: No email found for userId ${post.userId}`);
          notFoundCount++;
          continue;
        }

        // Find guardian by email
        const guardian = await Guardian.findOne({ email: email.toLowerCase() });

        if (guardian) {
          // Update post with guardianId
          await Post.updateOne(
            { _id: post._id },
            { $set: { guardianId: guardian.guardianId } }
          );
          
          console.log(`✅ Post ${post.postId}: Linked to guardian ${guardian.guardianId} (${guardian.name})`);
          successCount++;
        } else {
          console.log(`⚠️  Post ${post.postId}: No guardian found for email ${email}`);
          notFoundCount++;
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ Post ${post.postId}: Error - ${error.message}`);
        } else {
          console.error(`❌ Post ${post.postId}: Unknown error`, error);
        }
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} posts`);
    console.log(`⚠️  Guardian not found: ${notFoundCount} posts`);
    console.log(`❌ Errors: ${errorCount} posts`);
    console.log(`📊 Total processed: ${postsWithoutGuardianId.length} posts`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log('🎉 Migration completed successfully!\n');
    } else {
      console.log('⚠️  No posts were updated. Please review the logs above.\n');
    }

    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Migration failed:', error.message);
    } else {
      console.error('❌ Migration failed:', error);
    }
    process.exit(1);
  }
}

// Run the migration
backfillGuardianIds();
