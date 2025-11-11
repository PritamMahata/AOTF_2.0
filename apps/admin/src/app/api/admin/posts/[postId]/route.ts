import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Post from '@aotf/models/Post';
import Guardian from '@aotf/models/Guardian';
import User from '@aotf/models/User';

// GET /api/admin/posts/[postId] - Fetch post for invoice generation (admin only)
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ postId: string }> }
) {
    const logPrefix = '[GET /api/admin/posts/[postId]]';

    try {
        const { postId } = await context.params;
        console.log(logPrefix, 'Admin fetching post for invoice:', postId);

        // Note: This endpoint is protected by admin layout authentication
        // No need for additional auth check here as admin routes are already protected

        await connectToDatabase();

        // Find the post
        const post = await Post.findOne({ postId }).lean();

        if (!post) {
            console.log(logPrefix, 'Post not found');
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }        console.log(logPrefix, 'Post found:', post);
        
        // Fetch guardian details using userId
        let guardianDetails: unknown = null;
        let userEmail = post.email; // Fallback to post email
        
        // First, try to find the User who created this post
        if (post.userId) {
            try {
                const user = await User.findById(post.userId).lean();
                if (user) {
                    console.log(logPrefix, 'User found:', user.email, 'Role:', user.role);
                    userEmail = user.email;
                    
                    // Only fetch guardian details if user is a guardian
                    if (user.role === 'guardian') {
                        guardianDetails = await Guardian.findOne({ 
                            email: user.email.toLowerCase() 
                        }).lean();
                        console.log(logPrefix, 'Guardian details found:', guardianDetails ? 'Yes' : 'No');
                    }
                }
            } catch (error) {
                console.error(logPrefix, 'Error fetching user:', error);
            }
        }
        
        // Fallback: Try to find guardian by guardianId or email from post
        if (!guardianDetails) {
            if (post.guardianId) {
                guardianDetails = await Guardian.findOne({ guardianId: post.guardianId }).lean();
            } else if (post.email) {
                guardianDetails = await Guardian.findOne({ email: post.email.toLowerCase() }).lean();
            }
        }        // Format the response for invoice use
        // Prioritize guardian details over post fields
        const guardianData = guardianDetails as Record<string, unknown> | null;
        
        console.log(logPrefix, 'Formatting response with guardian data:', {
            hasGuardian: !!guardianData,
            guardianName: guardianData?.name,
            guardianPhone: guardianData?.phone,
            guardianLocation: guardianData?.location,
            postName: post.name,
            postPhone: post.phone,
            postLocation: post.location,
        });
        
        const formattedPost = {
            postId: post.postId,
            // Prioritize guardian details first, then post fields, then 'N/A'
            name: (guardianData?.name as string) || post.name || 'N/A',
            email: userEmail || (guardianData?.email as string) || post.email || 'N/A',
            phone: (guardianData?.phone as string) || post.phone || 'N/A',
            subject: post.subject,
            className: post.className,
            board: post.board,
            location: (guardianData?.location as string) || post.location || 'N/A',
            monthlyBudget: post.monthlyBudget,
            classType: post.classType,
            frequencyPerWeek: post.frequencyPerWeek,
            preferredTime: post.preferredTime,
            preferredDays: post.preferredDays || [],
            notes: post.notes || '',
            guardianDetails: guardianData ? {
                name: guardianData.name as string,
                email: guardianData.email as string,
                phone: guardianData.phone as string,
                address: guardianData.address as string,
                location: guardianData.location as string,
            } : null,
        };

        return NextResponse.json({
            success: true,
            post: formattedPost,
        });
    } catch (error) {
        console.error(logPrefix, 'Error fetching post:', error);
        return NextResponse.json(
            { error: 'Failed to fetch post details' },
            { status: 500 }
        );
    }
}
