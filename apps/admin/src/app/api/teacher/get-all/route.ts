import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Search parameter
    const search = searchParams.get('search') || '';

    // Build query with search filter
    const query: Record<string, unknown> = {};
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { teacherId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { location: searchRegex },
        { phone: searchRegex },
        { qualifications: searchRegex }
      ];
    }

    // Get paginated teachers with their details
    const teachers = await Teacher.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination metadata
    const totalCount = await Teacher.countDocuments(query);

    return NextResponse.json({
      success: true,
      teachers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + teachers.length < totalCount,
        limit
      }
    });

  } catch (error) {
    const err = error as Error;
    console.error('Get all teachers API error:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch teachers',
        details: err.message 
      },
      { status: 500 }
    );
  }
}
