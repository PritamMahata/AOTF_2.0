import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Guardian from '@aotf/models/Guardian';

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
        { guardianId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { location: searchRegex },
        { phone: searchRegex },
        { grade: searchRegex }
      ];
    }

    // Get paginated guardians with their details
    const guardians = await Guardian.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination metadata
    const totalCount = await Guardian.countDocuments(query);

    return NextResponse.json({
      success: true,
      guardians,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + guardians.length < totalCount,
        limit
      }
    });

  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    console.error('Get all guardians API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch guardians',
        details: message
      },
      { status: 500 }
    );
  }
}
