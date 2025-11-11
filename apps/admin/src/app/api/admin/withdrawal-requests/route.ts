import { NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Application from '@aotf/models/Application';

// GET: List all withdrawal requests
export async function GET() {
  await connectToDatabase();
  const requests = await Application.find({ status: 'withdrawal-requested' })
    .populate('teacherId', 'name teacherId')
    .lean();
  // Map teacher name/id for display
  const mapped = requests.map((r) => {
    // Type guard for populated teacherId
    const teacher = (r.teacherId && typeof r.teacherId === 'object' && 'teacherId' in r.teacherId && 'name' in r.teacherId)
      ? { teacherId: String(r.teacherId.teacherId), name: String(r.teacherId.name) }
      : { teacherId: '', name: '' };
    return {
      _id: r._id,
      teacherId: teacher.teacherId,
      teacherName: teacher.name,
      withdrawalNote: r.withdrawalNote,
      withdrawalRequestedAt: r.withdrawalRequestedAt,
    };
  });
  return NextResponse.json({ requests: mapped });
}
