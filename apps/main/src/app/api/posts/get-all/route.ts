import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Post from '@aotf/models/Post';
import Guardian from '@aotf/models/Guardian';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: Record<string, unknown> = {};

    // Status filter
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      filterQuery.status = status;
    }

    // Subject filter
    const subject = searchParams.get('subject');
    if (subject && subject !== 'all') {
      filterQuery.subject = subject;
    }

    // Class filter
    const className = searchParams.get('className');
    if (className && className !== 'all') {
      filterQuery.className = className;
    }

    // Board filter
    const board = searchParams.get('board');
    if (board && board !== 'all') {
      filterQuery.board = board;
    }

    // Class Type filter
    const classType = searchParams.get('classType');
    if (classType && classType !== 'all') {
      filterQuery.classType = classType;
    }

    // Frequency filter
    const frequency = searchParams.get('frequency');
    if (frequency && frequency !== 'all') {
      filterQuery.frequencyPerWeek = frequency;
    }

    // Budget range filter
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    if (minBudget || maxBudget) {
      filterQuery.monthlyBudget = {};
      if (minBudget) {
        (filterQuery.monthlyBudget as Record<string, number>).$gte = parseInt(minBudget, 10);
      }
      if (maxBudget) {
        (filterQuery.monthlyBudget as Record<string, number>).$lte = parseInt(maxBudget, 10);
      }
    }

    // Search query - search across multiple fields
    const search = searchParams.get('search');
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filterQuery.$or = [
        { postId: searchRegex },
        { subject: searchRegex },
        { className: searchRegex },
        { board: searchRegex },
        { name: searchRegex },
        { notes: searchRegex },
        { preferredTime: searchRegex }
      ];
    }

    // Get paginated posts with filters
    const posts = await Post.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain objects for easier manipulation
    
    // Populate guardian names for posts that don't have a name but have guardianId
    const postsWithNames = await Promise.all(
      posts.map(async (post) => {
        // If post already has a name, use it
        if (post.name) {
          return post;
        }
        
        // If post has guardianId, fetch guardian name
        if (post.guardianId) {
          try {
            const guardian = await Guardian.findOne({ guardianId: post.guardianId }).select('name').lean();
            if (guardian && typeof guardian === 'object' && 'name' in guardian && guardian.name) {
              return { ...post, name: guardian.name as string };
            }
          } catch (err) {
            console.error(`Failed to fetch guardian for guardianId ${post.guardianId}:`, err);
          }
        }
        
        // Default to "Anonymous Guardian" if no name found
        return { ...post, name: 'Anonymous Guardian' };
      })
    );
    
    // Get total count for pagination metadata with filters
    const totalCount = await Post.countDocuments(filterQuery);

    return NextResponse.json({
      success: true,
      posts: postsWithNames,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + postsWithNames.length < totalCount,
        limit
      }
    });

  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    console.error('Get all posts API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch posts',
        details: message 
      },
      { status: 500 }
    );
  }
}
