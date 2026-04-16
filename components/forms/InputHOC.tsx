import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { Input, InputProps, Tooltip } from 'rizzui';
import cn from '../../utils/classNames';
import { validateNotWhitespace } from '../../utils/validatorFunctions';

interface RequiredInputProps extends InputProps {
    id: string;
    formik?: any;
    type?: any;
    onChange?: (e: any) => void;
    value?: any;
    error?: any;
    className?: string;
    inputClassName?: string;
    isClearable?: boolean;
    contentTooltipText?: string | null;
}

const overwriteLabel = (WrappedComponent: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>) => {

    return ({ label, required = true, id, formik, type = 'text', className, inputClassName, onChange, value = null, error = null, contentTooltipText = null, ...props }: RequiredInputProps) => {

        let errorTouched = formik && formik.touched && formik.errors && (formik.touched[id] && formik.errors[id]);

        //////////////////////////////////////////
        // CHECK IF THE VALUE IS NOT WHITESPACE 
        //////////////////////////////////////////
        const handleChange = (e: any) => {
            const newValue = e.target.value;
            const isValid = validateNotWhitespace(newValue);

            if (!isValid) {
                value = '';
                formik.setFieldValue(id, '');
            } else {
                if (onChange) {
                    onChange(e);
                } else if (formik) {
                    type === 'number' ? formik.setFieldValue(id, Number(newValue)) : formik.setFieldValue(id, newValue);
                }
            }
        };

        const getTooltipLabel = () => {
            return (
                <Tooltip
                    content={contentTooltipText}
                    className="text-sm"
                    color="invert"
                >
                    <span className='flex flex-row flex-nowrap'>
                        {label}&nbsp;{required && <span className="text-red-500">*</span>}
                    </span>
                </Tooltip>
            );
        }
        return (
            <WrappedComponent
                id={id}
                type={type}
                label={contentTooltipText
                    ? getTooltipLabel()
                    : <span>{label} {required && <span className="text-red-500">*</span>}</span>
                }
                onChange={handleChange}
                onBlur={formik?.handleBlur(id)}
                value={value ?? formik?.values[id]}
                required={required}
                error={error ?? errorTouched}
                className={cn([className, "[&>label>span]:font-medium"])}
                inputClassName={cn([inputClassName || "text-sm", "!bg-[#a1b8f7] !border-white focus:ring-0 focus:border-primary placeholder:text-gray-500"])}
                {...props}
            />
        );
    };
};

const RequiredInput = overwriteLabel(Input);

export default RequiredInput;