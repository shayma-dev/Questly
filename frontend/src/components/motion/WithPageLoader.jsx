// src/components/motion/WithPageLoader.jsx
import React, { Suspense } from "react";
import PageTransition from "./PageTransition";

export default function WithPageLoader({
  routeKey,
  children,
  className,
  fallback,
}) {
  return (
    <PageTransition routeKey={routeKey} className={className}>
      <Suspense fallback={fallback ?? <DefaultPageSkeleton />}>
        {children}
      </Suspense>
    </PageTransition>
  );
}

function DefaultPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-56 rounded-md bg-[rgb(var(--card))]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]" />
          <div className="h-40 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]" />
        </div>
      </div>
    </div>
  );
}