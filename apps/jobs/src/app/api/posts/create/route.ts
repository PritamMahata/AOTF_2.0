import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Client from '@aotf/models/Client';
import Project from '@aotf/models/Project'; // Use Project model instead of Post
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';

// Helper to generate sequential projectId for the day
async function generateSequentialProjectId(): Promise<string> {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2); // last two digits

  // Find projects created today
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const todayCount = await Project.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  });
  const sequence = String(todayCount).padStart(2, '0');
  return `PRJ-${day}${month}${year}${sequence}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authenticate user using NextAuth
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated. Please log in.' 
      }, { status: 401 });
    }

    const user = authResult.user;    const body = await request.json();
    const {
      projectTitle, // Changed from 'subject'
      category, // Changed from 'className'
      description,
      // Project specific fields
      subcategory,
      projectType,
      budgetType,
      budgetAmount,
      budgetRangeMin,
      budgetRangeMax,
      expectedHours,
      startDate,
      deadline,
      duration,
      urgency,
      requiredSkills = [],
      experienceLevel,
      freelancerType,
      preferredLocation,
      languageRequirements = [],
    } = body || {};// Check if user is registered as client
    const client = await Client.findOne({ email: user.email.toLowerCase() });
    
    if (!client) {
      return NextResponse.json({ 
        success: false, 
        error: 'User must be registered as a client to create projects. Please complete client registration.' 
      }, { status: 403 });
    }    console.log(`✅ Client authenticated for project creation:`, { 
      clientId: client.clientId, 
      name: client.name, 
      email: user.email 
    });

    // Validate required fields
    const missing: string[] = [];
    if (!projectTitle) missing.push('projectTitle');
    if (!category) missing.push('category');
    if (!description) missing.push('description');
    if (missing.length) {
      return NextResponse.json({ 
        success: false, 
        error: `Missing required fields: ${missing.join(', ')}` 
      }, { status: 400 });
    }

    // Generate sequential projectId
    const projectId = await generateSequentialProjectId();
      
    // Create project data
    const projectData = {
      projectId,
      clientId: client.clientId,
      userId: user.id,
      name: client.name,
      email: user.email,
      phone: client.phone,
      projectTitle: String(projectTitle).trim(),
      category: String(category).trim(),
      description: String(description).trim(),
      status: 'open',
      
      // Project-specific fields
      subcategory: subcategory,
      projectType: projectType || 'one-time',
      budgetType: budgetType || 'fixed',
      budgetAmount: budgetAmount ? Number(budgetAmount) : undefined,
      budgetRangeMin: budgetRangeMin ? Number(budgetRangeMin) : undefined,
      budgetRangeMax: budgetRangeMax ? Number(budgetRangeMax) : undefined,
      expectedHours: expectedHours ? Number(expectedHours) : undefined,
      startDate: startDate,
      deadline: deadline,
      duration: duration,
      urgency: urgency || 'normal',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      experienceLevel: experienceLevel || 'intermediate',
      freelancerType: freelancerType || 'individual',
      preferredLocation: preferredLocation,
      languageRequirements: Array.isArray(languageRequirements) ? languageRequirements : [],
    };

    const project = new Project(projectData);

    try {
      await project.save();
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string')
        ? (err as { message: string }).message
        : 'Database error';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      projectId: project.projectId, 
      project,
      // Backward compatibility
      postId: project.projectId,
      post: project 
    });
  } catch (e: unknown) {
    const message = (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string')
      ? (e as { message: string }).message
      : 'Failed to create project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
