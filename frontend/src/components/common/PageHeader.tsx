interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-lg leading-8 text-gray-600">{subtitle}</p>
      )}
    </div>
  );
} 