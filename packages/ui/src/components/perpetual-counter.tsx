"use client";

import { useEffect, useRef, useState } from 'react';

interface PerpetualCounterProps {
  startValue: number;
  className?: string;
  separator?: string;
  minIncrement?: number; // Minimum random increment
  maxIncrement?: number; // Maximum random increment
}

export default function PerpetualCounter({
  startValue,
  className = '',
  separator = ',',
  minIncrement = 1,
  maxIncrement = 5
}: PerpetualCounterProps) {
  const [count, setCount] = useState(startValue);
  const [displayCount, setDisplayCount] = useState(startValue);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Smooth animation between values
  useEffect(() => {
    const animate = () => {
      setDisplayCount(prevDisplay => {
        const diff = count - prevDisplay;
        if (Math.abs(diff) < 0.1) return count;
        return prevDisplay + diff * 0.1; // Smooth interpolation
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [count]);

  // Perpetual increment with random amount between min and max every second
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIncrement = Math.floor(Math.random() * (maxIncrement - minIncrement + 1)) + minIncrement;
      setCount(prevCount => prevCount + randomIncrement);
    }, 1000); // Every 1 second

    return () => clearInterval(interval);
  }, [minIncrement, maxIncrement]);

  const formattedNumber = Intl.NumberFormat('en-US', {
    useGrouping: !!separator,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.floor(displayCount));

  return (
    <span className={className}>
      {separator ? formattedNumber.replace(/,/g, separator) : formattedNumber}
    </span>
  );
}
