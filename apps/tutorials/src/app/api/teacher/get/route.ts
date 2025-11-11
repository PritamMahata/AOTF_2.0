import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }
    
    // Find teacher
    const teacher = await Teacher.findOne({ teacherId: teacherId }); // Changed from uniqueId to teacherId
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      teacher: {
        teacherId: teacher.teacherId,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        location: teacher.location,
        experience: teacher.experience,
        qualifications: teacher.qualifications,
        subjectsTeaching: teacher.subjectsTeaching,
        teachingMode: teacher.teachingMode,
        bio: teacher.bio,
        termsAgreed: teacher.termsAgreed,
        termsAgreedAt: teacher.termsAgreedAt,
        consultancyPaymentType: teacher.consultancyPaymentType,
        registrationFeeStatus: teacher.registrationFeeStatus,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher data' },
      { status: 500 }
    );
  }
}
