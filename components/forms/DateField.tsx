
import { es } from 'date-fns/locale/es';
import moment from "moment";
import { useEffect, useState } from "react";
import SelectReact from "react-select";
import { InputProps } from "rizzui";
import cn from "../../utils/classNames";
import { DatePicker } from "./DatePicker";

export interface DatePickerProps<selectsRange extends boolean | undefined>
    extends Omit<any, "selectsRange" | "onChange"> {
    onChange(
        date: selectsRange extends false | undefined ? Date | null : [Date | null, Date | null],
        event: React.SyntheticEvent<any> | undefined
    ): void;
    selectsRange?: selectsRange;
    inputProps?: InputProps;
    wrapperClassName?: string;
    inputClassName?: string;
    dateTypeClassName?: string;
}

export default function DateField({
    onClear,
    placeholderText = 'Seleciona Fecha',
    inputProps,
    label = null,
    dateTypesOptions,
    wrapperClassName,
    dateTypeClassName,
    inputClassName,
    ...props
}: any & { onClear?: () => void }) {

    // STATES

    const [selectedDateField, setSelectedDateField] = useState<any>(props.selectedDateField);
    const [between_dates, setBetweenDates] = useState<any>({ startDate: props.startDate, endDate: props.endDate });

    // USE EFFECT
    
    useEffect(() => {
        setBetweenDates((prev: any) => ({
            ...prev,
            startDate: props.startDate,
            endDate: props.endDate,
        }));
    }, [props.startDate, props.endDate]);

    useEffect(() => {
        if (between_dates.startDate && between_dates.endDate) {
            props.onChange([
                moment(between_dates.startDate).format('YYYY-MM-DD'),
                moment(between_dates.endDate).format('YYYY-MM-DD'),
                selectedDateField,
            ]);
        }
        else if (!between_dates.startDate && !between_dates.endDate) {
            props.onChange(null);
        }

    }, [between_dates, selectedDateField]);

    // RENDER

    return (
        <div className={cn(wrapperClassName)}>
            {dateTypesOptions ?
                <>
                    <span className="rizzui-input-label block text-sm mb-1.5 font-medium">Rango de fecha</span>
                    <SelectReact
                        options={dateTypesOptions}
                        onChange={(option: any) => setSelectedDateField(option.value)}
                        value={dateTypesOptions.find((option: any) => option.value === selectedDateField)}
                        className="mb-4"
                        placeholder={`Elige el tipo...`}
                        styles={{
                            control: (base: any, state: any) => ({
                                ...base,
                                backgroundColor: '#a1b8f7',
                                border: '1px !important',
                                borderRadius: '0.375rem',
                                borderColor: 'rgb(229 231 235) !important',
                                boxShadow: state.isFocused ? '0 0 0 2px rgb(0, 172, 216)' : '0 0 0 1px rgba(0,0,0, 0.2) !important',
                            }),
                            option: (provided: any, state: any) => ({
                                ...provided,
                                backgroundColor: state.isFocused ? 'rgb(0, 172, 216)' : 'white',
                                color: state.isFocused ? 'white' : 'black',
                                '&:hover': {
                                    backgroundColor: 'rgb(0, 172, 216)',
                                    color: 'white',
                                    borderColor: '#000000 !important'
                                }
                            }),
                        }}
                    />
                </>
                :
                <>
                    {label && (
                        <span className="rizzui-input-label block text-sm mb-1.5 font-medium">{label}</span>
                    )}
                </>
            }

            <DatePicker
                monthsShown={1}
                placeholderText={placeholderText}
                selectsRange
                inputProps={{
                    inputClassName: cn('h-9 [&_input]:text-ellipsis', inputClassName),
                    ...inputProps,
                }}
                className="w-72"
                {...props}
                startDate={between_dates.startDate}
                endDate={between_dates.endDate}
                onChange={(date: any) => {
                    setBetweenDates({
                        startDate: date[0] ? date[0] : null,
                        endDate: date[1] ? date[1] : null,
                    });
                }}
                onClear={() => { setBetweenDates({ startDate: null, endDate: null }); }}
                locale={es}
                popperClassName="!z-[99999]"
            />
        </div>
    );
}