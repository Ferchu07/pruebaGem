import cn from "../../utils/classNames";

interface FormGroupProps {
  title: React.ReactNode;
  className?: string;
  childClassName?: string;
  description?: string;
  children?: React.ReactNode;
  titleCols?: string;
  childCols?: string;
}

export default function FormGroup({
  title,
  className,
  childClassName,
  description,
  children,
  titleCols = "@lg:col-span-3",
  childCols = "@lg:col-span-9 lg:grid-cols-2",
}: FormGroupProps) {
  return (
    <div className={cn("grid gap-5 @3xl:grid-cols-12", className)}>
      <div className={cn('col-span-full', titleCols)}>
        <h4 className="text-base font-medium">{title}</h4>
        {description && <p className="mt-2 text-muted500">{description}</p>}
      </div>

      {children && (
        <div className={cn("grid gap-4 grid-cols-1 col-span-full", childCols, childClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}