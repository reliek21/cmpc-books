import * as React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={
        'rounded bg-slate-200 dark:bg-slate-700/40 animate-pulse ' +
        className
      }
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full max-w-lg" />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      <div className="mb-2">
        <Skeleton className="h-6 w-1/3" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 items-center">
            <Skeleton className="col-span-2 h-6" />
            <Skeleton className="col-span-1 h-6" />
            <Skeleton className="col-span-1 h-6" />
            <Skeleton className="col-span-1 h-6" />
            <Skeleton className="col-span-1 h-6" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Skeleton
