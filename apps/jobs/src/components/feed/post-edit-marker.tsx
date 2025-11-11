"use client";

import { Badge } from "@aotf/ui/components/badge";
import { Edit3, Shield, User } from "lucide-react";

interface PostEditMarkerProps {
  editedBy?: 'client' | 'admin' | 'freelancer' | 'guardian' | 'teacher';
  editedAt?: Date | string;
  editedByName?: string;
  editedByUserId?: string;
  currentUserId?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export function PostEditMarker({
  editedBy,
  editedAt,
  editedByName,
  editedByUserId,
  currentUserId,
  className = '',
  variant = 'default',
}: PostEditMarkerProps) {
  // If no edit information, don't render anything
  if (!editedBy || !editedAt) {
    return null;
  }

  const formatEditTime = (date: Date | string) => {
    const editDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - editDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return editDate.toLocaleDateString('en-GB');
  };
  const getIcon = () => {
    if (editedBy === 'admin') return Shield;
    if (editedBy === 'teacher' || editedBy === 'freelancer') return User;
    return Edit3;
  };

  const getVariantStyle = () => {
    if (editedBy === 'admin') return 'destructive';
    if (editedBy === 'teacher' || editedBy === 'freelancer') return 'default';
    return 'secondary';
  };

  const getEditorLabel = () => {
    // Check if the current user is the one who edited
    if (currentUserId && editedByUserId && currentUserId === editedByUserId) {
      return 'You';
    }
    
    if (editedByName) return editedByName;
    if (editedBy === 'admin') return 'Admin';
    if (editedBy === 'teacher') return 'Teacher';
    if (editedBy === 'freelancer') return 'Freelancer';
    if (editedBy === 'guardian') return 'Guardian';
    return 'Client';
  };

  const Icon = getIcon();

  if (variant === 'compact') {
    return (
      <Badge variant={getVariantStyle()} className={`text-xs ${className}`}>
        <Icon className="h-3 w-3 mr-1" />
        Edited by {editedBy}
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <Badge variant={getVariantStyle()} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        Edited by {getEditorLabel()}
      </Badge>
      <span>• {formatEditTime(editedAt)}</span>
    </div>
  );
}
