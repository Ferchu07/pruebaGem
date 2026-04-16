import { es } from 'date-fns/locale/es';
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input, InputProps } from "rizzui";
import { ReactComponent as CalendarioIcon } from '../../assets/Iconos/Interfaz/calendario.svg';
import { ReactComponent as FlechaIcon } from '../../assets/Iconos/Interfaz/flecha.svg';
import cn from "../../utils/classNames";

const calendarContainerClasses = {
    base: "[&.react-datepicker]:shadow-lg [&.react-datepicker]:border-gray-100 [&.react-datepicker]:rounded-md",
    monthContainer: {
        padding: "[&.react-datepicker>div]:pt-5 [&.react-datepicker>div]:pb-3",
    },
};

const prevNextButtonClasses = {
    base: "[&.react-datepicker>button]:items-baseline [&.react-datepicker>button]:top-7",
    border:
        "[&.react-datepicker>button]:border [&.react-datepicker>button]:border-solid [&.react-datepicker>button]:border-gray-300 [&.react-datepicker>button]:rounded-md",
    size: "[&.react-datepicker>button]:h-[22px] [&.react-datepicker>button]:w-[22px]",
    children: {
        position: "[&.react-datepicker>button>span]:top-0",
        border:
            "[&.react-datepicker>button>span]:before:border-t-[1.5px] [&.react-datepicker>button>span]:before:border-r-[1.5px] [&.react-datepicker>button>span]:before:border-gray-400",
        size: "[&.react-datepicker>button>span]:before:h-[7px] [&.react-datepicker>button>span]:before:w-[7px]",
    },
};

const timeOnlyClasses = {
    base: "[&.react-datepicker--time-only>div]:pr-0 [&.react-datepicker--time-only>div]:w-28",
};

export interface DatePickerProps<selectsRange extends boolean | undefined>
    extends Omit<any, "selectsRange" | "onChange"> {
    /** Pass function in onChange prop to handle selecting value */
    onChange(
        date: selectsRange extends false | undefined ? Date | null : [Date | null, Date | null],
        event: React.SyntheticEvent<any> | undefined
    ): void;
    /** Whether range selecting is enabled */
    selectsRange?: selectsRange;
    /** Pass input props to style input */
    inputProps?: InputProps;
    locale?: any;
    defaultValue?: Date | null;
}

export const YearDatePicker = ({
    customInput,
    dateFormat = "yyyy",
    selectsRange = false,
    onCalendarOpen,
    onCalendarClose,
    defaultValue,
    inputProps,
    calendarClassName,
    locale,
    ...props
}: DatePickerProps<boolean>) => {
    const [isCalenderOpen, setIsCalenderOpen] = useState(false);
    const handleCalenderOpen = () => setIsCalenderOpen(true);
    const handleCalenderClose = () => setIsCalenderOpen(false);
    return (
        <div
            className={cn(
                "flex [&_.react-datepicker-wrapper]:flex [&_.react-datepicker-wrapper]:w-full",
                props?.className
            )}
        >
            <ReactDatePicker
                //@ts-ignore
                selectsRange={selectsRange}
                showYearPicker
                selected={defaultValue}
                customInput={
                    customInput || (
                        <Input
                            prefix={<CalendarioIcon className="h-5 w-5 text-gray-500" />}
                            suffix={
                                <FlechaIcon
                                    className={cn("h-4 w-4 text-gray-500 transition", isCalenderOpen && "rotate-180")}
                                />
                            }
                            {...inputProps}
                        />
                    )
                }
                dateFormat={dateFormat}
                onCalendarOpen={onCalendarOpen || handleCalenderOpen}
                onCalendarClose={onCalendarClose || handleCalenderClose}
                calendarClassName={cn(
                    calendarContainerClasses.base,
                    calendarContainerClasses.monthContainer.padding,
                    prevNextButtonClasses.base,
                    prevNextButtonClasses.border,
                    prevNextButtonClasses.size,
                    prevNextButtonClasses.children.position,
                    prevNextButtonClasses.children.border,
                    prevNextButtonClasses.children.size,
                    timeOnlyClasses.base,
                    calendarClassName
                )}
                locale={locale || es}
                {...props}
            />
        </div>
    );
};