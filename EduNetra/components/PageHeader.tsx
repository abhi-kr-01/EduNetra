import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
};

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {badge && <div className="mb-3">{badge}</div>}
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}


