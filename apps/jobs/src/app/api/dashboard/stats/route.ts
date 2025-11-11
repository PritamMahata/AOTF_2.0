import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Teacher from '@aotf/models/Teacher';

export async function GET() {
  try {
    await connectToDatabase();

    // Get total teachers
    const totalTeachers = await Teacher.countDocuments();
    
    // Get teachers with paid registration fees
    const paidTeachers = await Teacher.countDocuments({ 
      registrationFeeStatus: 'paid' 
    });
    
    // Get pending payments
    const pendingPayments = await Teacher.countDocuments({ 
      registrationFeeStatus: 'pending' 
    });
    
    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await Teacher.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Calculate total revenue (assuming ₹50 per paid teacher)
    const totalRevenue = paidTeachers * 50;
    
    // Get recent teacher registrations for activity feed
    const recentTeachers = await Teacher.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('teacherId termsAgreed registrationFeeStatus createdAt');

    // Transform recent teachers into activity format
    const recentActivity = recentTeachers.map((teacher, idx) => ({
      id: teacher._id.toString(),
      type: 'teacher_registration' as const,
      message: `New teacher registered: ${teacher.teacherId}`,
      timestamp: teacher.createdAt.toISOString(),
      status: teacher.registrationFeeStatus === 'paid' ? 'success' as const : 
              teacher.registrationFeeStatus === 'pending' ? 'pending' as const : 
              'failed' as const,
      index: idx
    }));

    // Add some sample payment activities
    const paymentActivities = recentTeachers
      .filter(teacher => teacher.registrationFeeStatus === 'paid')
      .slice(0, 5)
      .map((teacher, idx) => ({
        id: `payment-${teacher._id.toString()}`,
        type: 'payment' as const,
        message: `Payment received: ₹50 registration fee from ${teacher.teacherId}`,
        timestamp: new Date(teacher.createdAt.getTime() + 60000).toISOString(), // 1 minute after registration
        status: 'success' as const,
        index: idx
      }));

    const allActivities = [...recentActivity, ...paymentActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Get terms distribution
    const term1Count = await Teacher.countDocuments({ 
      termsAgreed: 'term-1' 
    });
    
    // const term2Count = await Teacher.countDocuments({ 
    //   termsAgreed: 'term-2' 
    // });

    const stats = {
      totalTeachers,
      totalGuardians: 1243, // Placeholder - implement when guardian model is created
      activeConnections: Math.floor(paidTeachers * 0.6), // Estimate active connections
      totalRevenue,
      pendingPayments,
      recentRegistrations,
      termsDistribution: {
        term1: term1Count,
        // term2: term2Count
      }
    };

    return NextResponse.json({
      success: true,
      stats,
      recentActivity: allActivities
    });

  } catch (error: unknown) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
