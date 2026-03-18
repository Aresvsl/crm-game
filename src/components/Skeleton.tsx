"use client";

import React from 'react';

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-200/50 rounded-xl ${className}`} />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-gray-50/50">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-6 ${j === 0 ? 'flex-1' : 'w-24'}`} />
          ))}
        </div>
      ))}
    </div>
  );
};
