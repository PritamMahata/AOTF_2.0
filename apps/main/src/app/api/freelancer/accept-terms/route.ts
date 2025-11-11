import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Freelancer from '@aotf/models/Freelancer';

interface AcceptTermsRequest {
  freelancerId: string;
  termsAgreed: boolean;
}

function validateInput(data: unknown): data is AcceptTermsRequest {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.freelancerId === 'string' &&
    typeof obj.termsAgreed === 'boolean' &&
    obj.freelancerId.length > 0
  );
}

function validateFreelancerId(freelancerId: string): boolean {
  // Validate freelancer ID format (AOF-XXXXXXXX)
  const freelancerIdPattern = /^AOF-[A-Z0-9]{8}$/;
  return freelancerIdPattern.test(freelancerId);
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate input
    if (!validateInput(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters' },
        { status: 400 }
      );
    }
    
    const { freelancerId, termsAgreed } = body;
    
    // Validate freelancer ID format
    if (!validateFreelancerId(freelancerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid freelancer ID format' },
        { status: 400 }
      );
    }
    
    // Find freelancer
    const freelancer = await Freelancer.findOne({ freelancerId });
    if (!freelancer) {
      return NextResponse.json(
        { success: false, error: 'Freelancer not found' },
        { status: 404 }
      );
    }

    // Check if terms already accepted
    if (freelancer.termsAgreed && freelancer.termsAgreedAt) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Terms already accepted',
          freelancerId,
          termsAgreed: freelancer.termsAgreed
        }
      );
    }
    
    // Update freelancer with terms agreement using atomic operation
    const updatedFreelancer = await Freelancer.findOneAndUpdate(
      { freelancerId },
      {
        $set: {
          termsAgreed: 'term-1',
          termsAgreedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedFreelancer) {
      return NextResponse.json(
        { success: false, error: 'Failed to update terms agreement' },
        { status: 500 }
      );
    }

    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      console.log('Terms accepted for freelancer:', freelancerId);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Terms accepted successfully',
      freelancerId,
      termsAgreed: true
    });
    
  } catch (error) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error accepting terms:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to accept terms' },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
