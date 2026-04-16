import cn from '../../utils/classNames';

const CardClasses = {
  base: 'border border-2 border-black bg-gray-0 p-5 dark:bg-gray-50 lg:p-7 rounded-lg flex flex-col gap-4',
  rounded: {
    sm: 'rounded-sm',
    DEFAULT: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
  },
};

type CardTypes = {
  title: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  contentClassName?: string;
  chart?: React.ReactNode;
  info?: React.ReactNode;
  rounded?: keyof typeof CardClasses.rounded;
  titleClassName?: string;
  chartClassName?: string;
  className?: string;
  styles?: React.CSSProperties;
};

export default function FormCard({
  rounded = 'DEFAULT',
  className,
  children,
  styles,
}: React.PropsWithChildren<CardTypes>) {
  return (
    <div
      className={cn(
        CardClasses.base,
        CardClasses.rounded[rounded],
        className
      )}
      style={styles}
    >
      {children}
    </div>
  );
}
