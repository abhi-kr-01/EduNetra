import { Card } from "@/components/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10 font-sans">
      <div className="mx-auto max-w-[1320px] px-6 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-transparent">
          <div className="space-y-2">
             <Skeleton className="h-10 w-48" />
             <Skeleton className="h-5 w-64" />
          </div>
          <div className="hidden md:block h-px flex-1 mx-8 bg-slate-200/60 self-center"></div>
        </div>

        {/* Filters Skeleton */}
        <Card className="p-1.5 shadow-sm border-slate-200">
           <Skeleton className="h-16 w-full rounded-lg" />
        </Card>

        {/* KPI Cards Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {[1, 2, 3, 4].map((i) => (
               <Card key={i} className="p-6 h-32 flex flex-col justify-between">
                   <Skeleton className="h-4 w-24" />
                   <div>
                       <Skeleton className="h-8 w-16 mb-2" />
                       <Skeleton className="h-2 w-full rounded-full" />
                   </div>
               </Card>
           ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-8 border-slate-200 h-[450px]">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-full w-full rounded-full opacity-50" />
            </Card>
            <Card className="p-8 border-slate-200 h-[450px]">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-full w-full opacity-50" />
            </Card>
        </div>

        {/* History Table Skeleton */}
        <Card className="overflow-hidden border-slate-200 shadow-sm min-h-[400px]">
           <div className="p-6 border-b border-slate-200">
               <Skeleton className="h-6 w-32" />
           </div>
           <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                    </div>
                ))}
           </div>
        </Card>
      </div>
    </div>
  );
}
