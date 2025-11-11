"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

/**
 * This page has been merged with the main applications management page.
 * It now redirects to /admin/applications with the postId as a query parameter.
 * This provides a unified experience for viewing all applications or filtering by post.
 */
export default function ApplicationsRedirect() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  useEffect(() => {
    if (postId) {
      // Redirect to unified applications page with postId filter
      router.replace(`/admin/applications?postId=${postId}`)
    } else {
      // Fallback to main applications page
      router.replace('/admin/applications')
    }
  }, [postId, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to applications...</p>
      </div>
    </div>
  )
}
