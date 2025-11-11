// filepath: apps/jobs/src/app/api/client/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Project from '@aotf/models/Project'; // Changed from Post
import Client from '@aotf/models/Client';
import Application from '@aotf/models/Application'; // Import Application model
import { getAuthenticatedUser } from '@aotf/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Authenticate client
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find client by email
    const client = await Client.findOne({ email: authResult.user.email });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }    // Fetch all projects created by this client
    const projects = await Project.find({ 
      clientId: client.clientId 
    })
    .sort({ createdAt: -1 })
    .lean();

    // Transform projects for frontend
    const transformedProjects = projects.map(project => ({
      _id: project._id.toString(),
      postId: project.projectId, // For backward compatibility
      projectId: project.projectId,
      userId: authResult.user?.id || '',
      clientId: client.clientId,
      
      // Project details
      subject: project.projectTitle, // For backward compatibility
      className: project.category, // For backward compatibility
      category: project.category,
      subcategory: project.subcategory,
      description: project.description,
      
      // Budget
      budgetType: project.budgetType,
      budgetAmount: project.budgetAmount,
      budgetRangeMin: project.budgetRangeMin,
      budgetRangeMax: project.budgetRangeMax,
      monthlyBudget: project.budgetAmount || project.budgetRangeMax, // For backward compatibility
      
      // Project type & timeline
      projectType: project.projectType,
      startDate: project.startDate,
      deadline: project.deadline,
      duration: project.duration,
      urgency: project.urgency,
      expectedHours: project.expectedHours,
      
      // Requirements
      requiredSkills: project.requiredSkills || [],
      experienceLevel: project.experienceLevel,
      freelancerType: project.freelancerType,
      preferredLocation: project.preferredLocation,
      languageRequirements: project.languageRequirements || [],
      
      // Status & applicants
      status: project.status,
      applicants: project.applicants?.length || 0,
      applications: project.applications || [],
      createdAt: project.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: project.updatedAt?.toISOString() || new Date().toISOString(),
      
      // Client info
      name: client.name,
      email: client.email,
      phone: client.phone,
    }));    return NextResponse.json({ 
      success: true, 
      posts: transformedProjects // Keep 'posts' for backward compatibility
    });

  } catch (error) {
    console.error('Error fetching client projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST method removed - use /api/posts/create instead
