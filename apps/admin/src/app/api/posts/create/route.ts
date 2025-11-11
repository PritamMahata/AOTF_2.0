import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import User from '@aotf/models/User';
import Guardian from '@aotf/models/Guardian';
import Post from '@aotf/models/Post';
import { validateTeacherRequestForm } from '@aotf/lib/validation';
import { getAuthTokenFromCookies, verifyAuthToken } from '@aotf/lib/auth-token';

// Helper to generate sequential postId for the day
async function generateSequentialPostId(): Promise<string> {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2); // last two digits

  // Find posts created today
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const todayCount = await Post.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  });
  const sequence = String(todayCount).padStart(2, '0');
  return `P-${day}${month}${year}${sequence}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = getAuthTokenFromCookies(request.cookies);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    
    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      subject,
      className,
      board,
      preferredTime,
      preferredDays = [],
      frequencyPerWeek,
      classType,
      location,
      monthlyBudget,
      notes,
    } = body || {};

    // Comprehensive validation using the validation utility
    const validation = validateTeacherRequestForm({
      subject: subject || '',
      className: className || '',
      board,
      preferredTime,
      preferredDays,
      frequencyPerWeek: frequencyPerWeek || '',
      classType: classType || '',
      location,
      monthlyBudget: monthlyBudget ? String(monthlyBudget) : undefined,
      notes,
    });

    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: `Validation failed: ${validation.errors.join(', ')}` 
      }, { status: 400 });
    }

    // Additional basic checks for required fields
    const missing: string[] = [];
    if (!subject) missing.push('subject');
    if (!className) missing.push('className');
    if (!frequencyPerWeek) missing.push('frequencyPerWeek');
    if (!classType) missing.push('classType');
    if (missing.length) {
      return NextResponse.json({ success: false, error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // Lookup guardian by email to get guardianId
    const guardian = await Guardian.findOne({ email: user.email.toLowerCase() });
    const guardianId = guardian?.guardianId;
    const guardianName = guardian?.name;

    if (guardian) {
      console.log('✅ Guardian found for post creation:', { guardianId, name: guardianName, email: user.email });
    } else {
      console.log('⚠️ No guardian found for user:', user.email);
    }

    // Generate sequential postId
    const postId = await generateSequentialPostId();
    const post = new Post({
      postId,
      guardianId, // Store the guardian's ID to track who posted this requirement
      userId: user._id ? user._id.toString() : '',
      name: guardianName, // Store the guardian's name
      email: user.email, // Store the guardian's email
      phone: guardian?.phone, // Store the guardian's phone
      subject: String(subject).trim(),
      className: String(className).trim(),
      board: board ? String(board).toUpperCase() : undefined,
      preferredTime: preferredTime ? String(preferredTime).trim() : undefined,
      preferredDays: Array.isArray(preferredDays) ? preferredDays.slice(0, 7) : [],
      frequencyPerWeek,
      classType,
      location: location ? String(location).trim() : undefined,
      monthlyBudget: monthlyBudget ? Number(monthlyBudget) : undefined,
      notes: notes ? String(notes).trim() : undefined,
      status: 'open',
    });

    try {
      await post.save();
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string')
        ? (err as { message: string }).message
        : 'Database error';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    return NextResponse.json({ success: true, postId: post.postId, post });
  } catch (e: unknown) {
    const message = (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string')
      ? (e as { message: string }).message
      : 'Failed to create post';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
