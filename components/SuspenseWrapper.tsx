"use client";

import { Suspense, ReactNode } from "react";

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuspenseWrapper({
  children,
  fallback = (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  ),
}: SuspenseWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

export default SuspenseWrapper;
