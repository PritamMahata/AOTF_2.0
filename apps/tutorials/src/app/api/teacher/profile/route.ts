import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';
import { requireTeacherAuth } from '@aotf/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Authenticate teacher
    const authResult = await requireTeacherAuth(request);
    
    if (!authResult.success || !authResult.teacher) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const teacher = authResult.teacher;

    // Transform the data to match the frontend interface
    const teacherProfile = {
      role: 'teacher',
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      whatsappNumber: teacher.whatsappNumber || '',
      location: teacher.location,
      avatar: teacher.avatar || '',
      experience: teacher.experience || '',
      qualifications: teacher.qualifications || '',
      subjects: teacher.subjectsTeaching || [],
      teachingMode: teacher.teachingMode || 'both',
      bio: teacher.bio || '',
      hourlyRate: teacher.hourlyRate || '',
      availability: teacher.availability || '',
      rating: teacher.rating || 0,
      totalGuardians: teacher.totalGuardians || 0,
      teacherId: teacher.teacherId,
      registrationFeeStatus: teacher.registrationFeeStatus,
      razorpayPaymentId: teacher.razorpayPaymentId || '',
      razorpayOrderId: teacher.razorpayOrderId || '',
      paymentVerifiedAt: teacher.paymentVerifiedAt,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    };

    return NextResponse.json({ 
      success: true, 
      teacher: teacherProfile 
    });

  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Authenticate teacher
    const authResult = await requireTeacherAuth(request);
    
    if (!authResult.success || !authResult.teacher) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const teacher = authResult.teacher;
    
    // Parse request body
    const updateData = await request.json();

    // Map and filter allowed fields
    const fieldMapping: Record<string, string> = {
      'subjectsTeaching': 'subjectsTeaching',
      'subjects': 'subjectsTeaching', // Support both field names
    };

    const allowedFields = [
      'name', 'email', 'phone', 'whatsappNumber', 'location', 'experience', 
      'qualifications', 'subjectsTeaching', 'teachingMode', 
      'bio', 'hourlyRate', 'availability', 'avatar'
    ];

    const filteredData: Record<string, unknown> = {};
    
    Object.keys(updateData).forEach(field => {
      // Map field name if needed
      const dbField = fieldMapping[field] || field;
      
      // Only include if it's an allowed field
      if (allowedFields.includes(dbField)) {
        filteredData[dbField] = updateData[field];
      }
    });

    // Update teacher
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { _id: teacher._id },
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Return updated profile
    const teacherProfile = {
      role: 'teacher',
      name: updatedTeacher.name,
      email: updatedTeacher.email,
      phone: updatedTeacher.phone,
      whatsappNumber: updatedTeacher.whatsappNumber || '',
      location: updatedTeacher.location,
      avatar: updatedTeacher.avatar || '',
      experience: updatedTeacher.experience || '',
      qualifications: updatedTeacher.qualifications || '',
      subjects: updatedTeacher.subjectsTeaching || [],
      teachingMode: updatedTeacher.teachingMode || 'both',
      bio: updatedTeacher.bio || '',
      hourlyRate: updatedTeacher.hourlyRate || '',
      availability: updatedTeacher.availability || '',
      rating: updatedTeacher.rating || 0,
      totalGuardians: updatedTeacher.totalGuardians || 0,
      teacherId: updatedTeacher.teacherId,
      registrationFeeStatus: updatedTeacher.registrationFeeStatus,
      razorpayPaymentId: updatedTeacher.razorpayPaymentId || '',
      razorpayOrderId: updatedTeacher.razorpayOrderId || '',
      paymentVerifiedAt: updatedTeacher.paymentVerifiedAt,
      createdAt: updatedTeacher.createdAt,
      updatedAt: updatedTeacher.updatedAt
    };

    return NextResponse.json({ 
      success: true, 
      teacher: teacherProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating teacher profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}