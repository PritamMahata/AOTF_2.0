"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@aotf/ui/components/avatar";
import { generateAvatarColors, getInitials } from "@aotf/lib";

interface UserAvatarProps {
  name: string; // User's full name
  src?: string; // Optional image URL
  size?: number; // Size in pixels
  className?: string; // Additional CSS classes
}

export default function UserAvatar({ 
  name, 
  src, 
  size = 64, 
  className = "" 
}: UserAvatarProps) {
  // Generate consistent colors and initials for the user
  const avatarColors = generateAvatarColors(name);
  const initials = getInitials(name);

  const sizeClass = `h-${Math.round(size/4)} w-${Math.round(size/4)}`;
  const textSizeClass = size >= 64 ? "text-xl" : size >= 32 ? "text-sm" : "text-xs";

  return (
    <Avatar 
      className={`${sizeClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {src && <AvatarImage src={src} alt={`${name}'s avatar`} />}
      <AvatarFallback 
        className={`${textSizeClass} font-bold ${avatarColors.bg} ${avatarColors.text}`}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
