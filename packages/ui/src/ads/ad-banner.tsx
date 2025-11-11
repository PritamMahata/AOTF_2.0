"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@aotf/ui/components/button";

interface Ad {
  _id: string;
  title: string;
  imageUrl: string;
  link: string;
  status: string;
}

export function AdBanner() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    fetchAd();
  }, []);

  useEffect(() => {
    // Track impression when ad is shown
    if (ad && !tracked) {
      trackEvent(ad._id, "impression");
      setTracked(true);
    }
  }, [ad, tracked]);

  const fetchAd = async () => {
    try {
      const response = await fetch("/api/ad/active");
      const data = await response.json();
      if (data.success && data.ad) {
        setAd(data.ad);
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    }
  };

  const trackEvent = async (adId: string, type: "impression" | "click") => {
    try {
      await fetch("/api/ad/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, type }),
      });
    } catch (error) {
      console.error("Error tracking ad event:", error);
    }
  };

  const handleClick = () => {
    if (ad) {
      trackEvent(ad._id, "click");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!ad || dismissed) return null;
  return (
    <div className="relative bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg overflow-hidden shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-6 w-6"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>      <div className="relative w-full h-fit ">
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block"
        >
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            className="h-full w-full"
            priority
            height={300}
            width={300}
          />
        </a>
      </div>
    </div>
  );
}
