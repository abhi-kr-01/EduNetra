import { Card } from "@/components/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <div className="space-y-4">
                 <Skeleton className="h-4 w-32" />
                 <Skeleton className="h-10 w-64" />
                 <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                 </div>
             </div>
             <div className="flex gap-3">
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-32" />
             </div>
        </div>

        {/* Hero Section Skeleton */}
        <Card className="mb-8 overflow-hidden border-none p-0">
             <div className="grid gap-6 p-6 lg:grid-cols-3 lg:gap-12">
                 <div className="lg:col-span-2 space-y-4">
                     <Skeleton className="h-6 w-48" />
                     <Skeleton className="h-20 w-full" />
                 </div>
                 <div className="flex flex-col items-center justify-center">
                     <Skeleton className="h-16 w-16 rounded-full" />
                 </div>
             </div>
        </Card>

        {/* KPI Cards Skeleton */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6 h-32 flex flex-col justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-20" />
                </Card>
            ))}
        </div>

        {/* Video & Time Segments Skeleton */}
        <div className="mb-10 grid gap-8 lg:grid-cols-12">
             <div className="lg:col-span-8">
                  <Skeleton className="w-full aspect-video rounded-xl" />
             </div>
             <div className="lg:col-span-4">
                  <Card className="h-full max-h-[500px] p-4">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                             <Skeleton key={i} className="h-16 w-full" />
                          ))}
                      </div>
                  </Card>
             </div>
        </div>

        {/* Analytics Chart Skeleton */}
        <Card className="mb-10 p-8 h-[400px]">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-full w-full" />
        </Card>
      </div>
    </div>
  );
}
