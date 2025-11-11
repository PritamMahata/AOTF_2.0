import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import mongoose from 'mongoose'

import connectToDatabase from '@aotf/lib/mongodb'
import { getAuthTokenFromCookies, verifyAuthToken } from '@aotf/lib/auth-token'
import Application from '@aotf/models/Application'
import Guardian, { IGuardian } from '@aotf/models/Guardian'
import Post, { IPost } from '@aotf/models/Post'
import Teacher from '@aotf/models/Teacher'
import User, { IUser } from '@aotf/models/User'

export async function GET(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    await connectToDatabase()
    const { postId } = await context.params

    let post: IPost | null = await Post.findOne({ postId })
    if (!post && mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId)
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    let currentTeacherId: mongoose.Types.ObjectId | null = null
    let hasApplied = false

    try {
  const cookieStore = await cookies()
  const tokenValue = getAuthTokenFromCookies(cookieStore)
      const tokenData = tokenValue ? verifyAuthToken(tokenValue) : null
      const userId = tokenData?.userId

      if (userId) {
        const user = await User.findById(userId)
        if (user) {
          const teacher = await Teacher.findOne({ email: user.email })
          if (teacher) {
            currentTeacherId = teacher._id as mongoose.Types.ObjectId
            const application = await Application.findOne({
              teacherId: currentTeacherId,
              postId: post._id?.toString(),
            })
            hasApplied = Boolean(application)
          }
        }
      }
    } catch (authError) {
      console.log('Teacher authentication check failed:', authError)
    }

    const approvedApplication = await Application.findOne({
      postId: post._id,
      status: 'approved',
    })
    const hasApprovedTeacher = Boolean(approvedApplication)

    const guardianInfo = post.guardianId
      ? await Guardian.findOne({ guardianId: post.guardianId }).lean()
      : null
    const userInfo = post.userId
      ? await User.findOne({ email: post.userId }).lean()
      : null

    const isGuardianInfo = (value: unknown): value is IGuardian =>
      Boolean(value) && typeof value === 'object' && 'guardianId' in (value as object)
    const isUserInfo = (value: unknown): value is IUser =>
      Boolean(value) && typeof value === 'object' && 'email' in (value as object)

    const validGuardian = isGuardianInfo(guardianInfo) ? guardianInfo : null
    const validUser = isUserInfo(userInfo) ? userInfo : null

    const displayName =
      validGuardian?.name || validUser?.name || post.name || 'Anonymous Guardian'

    const formattedPost = {
      id: post._id?.toString() || '',
      postId: post.postId,
      userId: post.userId,
      guardian: displayName,
      guardianLocation: validGuardian?.location,
      subject: post.subject,
      class: `Class - ${post.className}`,
      board: `Board - ${post.board || 'Not specified'}`,
      location: post.location || validGuardian?.location,
      budget: post.monthlyBudget ? `₹${post.monthlyBudget}/month` : 'Budget not specified',
      monthlyBudget: post.monthlyBudget,
      genderPreference: 'No preference',
      description: post.notes || 'No additional details provided',
      postedDate: getTimeAgo(post.createdAt),
      applicants: post.applicants?.length || 0,
      status: post.status,
      classType: post.classType,
      frequency: post.frequencyPerWeek,
      preferredTime: post.preferredTime,
      preferredDays: post.preferredDays || [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      editedBy: post.editedBy,
      editedAt: post.editedAt,
      editedByUserId: post.editedByUserId,
      editedByName: post.editedByName,
      hasApplied,
      hasApprovedTeacher,
    }

    return NextResponse.json({ post: formattedPost, success: true })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`
  }
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  }
  return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
}
