// src/components/skeletons/TableSkeleton.tsx
import React from 'react';
import { Card } from '../UI';

interface TableSkeletonProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  showAddButton?: boolean;
  showFilters?: boolean;
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  title,
  description,
  showHeader = true,
  showAddButton = true,
  showFilters = true,
  rows = 5,
  columns = 6,
}) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Section */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <div className="h-8 w-48 rounded-lg bg-slate-200" />}
            {description && <div className="h-4 w-64 rounded bg-slate-100 mt-2" />}
            {!title && !description && (
              <>
                <div className="h-8 w-48 rounded-lg bg-slate-200" />
                <div className="h-4 w-64 rounded bg-slate-100 mt-2" />
              </>
            )}
          </div>
          
          {showAddButton && (
            <div className="flex gap-3">
              <div className="h-10 w-32 rounded-lg bg-slate-200" />
              <div className="h-10 w-36 rounded-lg bg-slate-200" />
            </div>
          )}
        </div>
      )}

      <Card noPadding>
        {/* Toolbar Skeleton */}
        {showFilters && (
          <div className="p-5 border-b bg-slate-50/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              {/* Search Input */}
              <div className="w-full sm:w-80">
                <div className="h-10 w-full rounded-lg bg-slate-200" />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <div className="h-10 w-40 rounded-lg bg-slate-200" />
                <div className="h-10 w-36 rounded-lg bg-slate-200" />
              </div>
            </div>
          </div>
        )}

        {/* Table Skeleton */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200">
              <div className="flex px-6 py-4">
                {[...Array(columns)].map((_, index) => (
                  <div
                    key={`header-${index}`}
                    className="flex-1 px-2 first:pl-0"
                  >
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </div>
                ))}
                {/* Actions column header */}
                <div className="w-24 flex justify-end">
                  <div className="h-4 w-16 rounded bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Table Body Rows */}
            <div className="divide-y divide-slate-100">
              {[...Array(rows)].map((_, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className="flex px-6 py-4 hover:bg-slate-50/80 transition-colors"
                >
                  {[...Array(columns)].map((_, colIndex) => (
                    <div
                      key={`col-${rowIndex}-${colIndex}`}
                      className="flex-1 px-2 first:pl-0"
                    >
                      <div 
                        className="h-4 rounded bg-slate-100" 
                        style={{ 
                          width: `${Math.max(40, 100 - Math.random() * 30)}%`,
                          maxWidth: '200px'
                        }} 
                      />
                    </div>
                  ))}
                  {/* Actions column content */}
                  <div className="w-24 flex justify-end gap-2">
                    <div className="h-8 w-16 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Default export for easy importing
export default TableSkeleton;