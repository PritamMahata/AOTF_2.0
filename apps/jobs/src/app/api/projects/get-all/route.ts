import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Project from '@aotf/models/Project';

/**
 * GET /api/projects/get-all
 * Fetch all open client projects for freelancers to browse
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Build filter query - only show open projects
    const filterQuery: Record<string, unknown> = {
      status: 'open' // Only show open projects available for application
    };

    // Category filter
    const category = searchParams.get('category');
    if (category && category !== 'all' && category !== 'All') {
      filterQuery.category = category;
    }

    // Subcategory filter
    const subcategory = searchParams.get('subcategory');
    if (subcategory && subcategory !== 'all') {
      filterQuery.subcategory = subcategory;
    }

    // Budget type filter
    const budgetType = searchParams.get('budgetType');
    if (budgetType && budgetType !== 'all' && budgetType !== 'All') {
      filterQuery.budgetType = budgetType;
    }

    // Project type filter
    const projectType = searchParams.get('projectType');
    if (projectType && projectType !== 'all' && projectType !== 'All') {
      filterQuery.projectType = projectType;
    }

    // Urgency filter
    const urgency = searchParams.get('urgency');
    if (urgency && urgency !== 'all' && urgency !== 'All') {
      filterQuery.urgency = urgency;
    }

    // Experience level filter
    const experienceLevel = searchParams.get('experienceLevel');
    if (experienceLevel && experienceLevel !== 'all' && experienceLevel !== 'All') {
      filterQuery.experienceLevel = experienceLevel;
    }

    // Budget range filter
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    if (minBudget || maxBudget) {
      filterQuery.$or = [
        // For fixed budget
        {
          budgetType: 'fixed',
          ...(minBudget && { budgetAmount: { $gte: parseInt(minBudget, 10) } }),
          ...(maxBudget && { budgetAmount: { $lte: parseInt(maxBudget, 10) } })
        },
        // For hourly budget (range)
        {
          budgetType: 'hourly',
          ...(minBudget && { budgetRangeMin: { $gte: parseInt(minBudget, 10) } }),
          ...(maxBudget && { budgetRangeMax: { $lte: parseInt(maxBudget, 10) } })
        }
      ];
    }

    // Search query - search across multiple fields
    const search = searchParams.get('search');
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filterQuery.$or = [
        { projectId: searchRegex },
        { projectTitle: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex },
        { description: searchRegex },
        { requiredSkills: { $in: [searchRegex] } },
        { name: searchRegex }
      ];
    }

    // Get paginated projects with filters
    const projects = await Project.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Project.countDocuments(filterQuery);

    // Transform projects for frontend
    const transformedProjects = projects.map((project: any) => ({
      _id: project._id.toString(),
      projectId: project.projectId,
      clientId: project.clientId,
      userId: project.userId,
      
      // Client info
      name: project.name,
      email: project.email,
      phone: project.phone,
      
      // Project details
      projectTitle: project.projectTitle,
      category: project.category,
      subcategory: project.subcategory,
      description: project.description,
      
      // Project type & timeline
      projectType: project.projectType,
      startDate: project.startDate,
      deadline: project.deadline,
      duration: project.duration,
      urgency: project.urgency,
      
      // Budget
      budgetType: project.budgetType,
      budgetAmount: project.budgetAmount,
      budgetRangeMin: project.budgetRangeMin,
      budgetRangeMax: project.budgetRangeMax,
      expectedHours: project.expectedHours,
      
      // Requirements
      requiredSkills: project.requiredSkills || [],
      experienceLevel: project.experienceLevel,
      freelancerType: project.freelancerType,
      preferredLocation: project.preferredLocation,
      languageRequirements: project.languageRequirements || [],
      
      // Status
      status: project.status,
      applicants: Array.isArray(project.applicants) ? project.applicants.length : 0,
      
      // Timestamps
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));

    return NextResponse.json({
      success: true,
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects' 
      },
      { status: 500 }
    );
  }
}
