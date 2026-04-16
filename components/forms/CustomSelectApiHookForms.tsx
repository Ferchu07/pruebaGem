import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsRequired } from '../../type/menu-type';
import { CheckPermissions } from '../../utils/CheckPermissions';
import CustomSelect from './CustomSelect';

interface OptionType {
    label: string;
    value: string;
}

interface Props {
    id: string;
    label?: string | React.ReactNode;
    formik: any;
    minInputLength?: number;
    permissions?: PermissionsRequired;
    containerClassName?: string;
    isMulti?: boolean;
    isDisabled?: boolean;
    fetchOptions: (searchText: string | null) => Promise<OptionType[]>;
    error?: any;
    setValue?: (value: any) => void;
    required?: boolean;
}

const CustomSelectApiHookForm: React.FC<Props> = ({
    id,
    label,
    formik,
    minInputLength = 2,
    permissions,
    containerClassName,
    isMulti = false,
    isDisabled = false,
    fetchOptions,
    error,
    setValue,
    required = false,
}) => {

    const [options, setOptions] = useState<OptionType[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [filtersValue, setFiltersValue] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    // Debounced fetch function
    const debouncedFetch = useRef(
        debounce(async (value: string) => {
            try {
                const fetchedOptions = await fetchOptions(value);
                setOptions(fetchedOptions);
            } catch (error) {
                console.error('Error fetching options:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 1000)
    ).current;

    // Handle input change with debounce
    const handleInputChange = useCallback((value: string) => {
        setInputValue(value);
        if (value.length >= minInputLength) {
            setLoading(true);
            debouncedFetch(value);
        } else {
            setOptions([]);
            setLoading(false);
        }
    }, [minInputLength]);

    // Handle selected values change
    const handleFiltersValue = useCallback((data: OptionType | OptionType[] | null) => {
        const newValue = isMulti
            ? (data as OptionType[])?.map(item => item.value)
            : (data as OptionType | null)?.value;
        formik.setFieldValue(id, newValue);
        setValue && setValue({ id: newValue, name: (data as OptionType | null)?.label });
        setFiltersValue(data);
    }, [id]);

    // Function to get value by path from formik values
    const getValueByPath = (obj: any, path: string): any => {
        return path
            .replace(/\[(\w+)\]/g, '.$1') // convert [0] to .0
            .split('.') // divide string into parts: ['products', '0', 'id']
            .reduce((acc, part) => acc?.[part], obj);
    };

    // Fetch initial options if necessary
    useEffect(() => {
        const fieldValue = getValueByPath(formik.values, id);

        if (fieldValue && options.length === 0) {
            setLoading(true);
            fetchOptions(null)
                .then((fetchedOptions: any) => {
                    const filteredOptions = fetchedOptions.filter((option: any) =>
                        Array.isArray(fieldValue)
                            ? fieldValue.includes(option.value)
                            : option.value === fieldValue
                    );
                    setOptions(filteredOptions);
                    setFiltersValue(filteredOptions);
                })
                .catch((error: any) => console.error('Error fetching options:', error))
                .finally(() => setLoading(false));
        }
    }, []);

    // Set initial value for filtersValue based on formik values
    useEffect(() => {
        const fieldValue = getValueByPath(formik.values, id);
        if (fieldValue && fieldValue.length === 0) {
            setFiltersValue(isMulti ? [] : null);
        }
    }, [formik, formik.values, id]);

    return (
        <>
            {((!permissions) || (permissions && CheckPermissions(permissions))) && (
                <CustomSelect
                    id={id}
                    label={label}
                    isSearchable
                    isClearable
                    isMulti={isMulti}
                    isDisabled={isDisabled}
                    options={options}
                    isLoading={loading}
                    onInputChange={handleInputChange}
                    onChange={handleFiltersValue}
                    value={filtersValue}
                    noOption={() => (inputValue?.length < minInputLength ? `Introduce al menos ${minInputLength} letras` : 'No se encontraron opciones')}
                    containerClassName={containerClassName}
                    error={error}
                    required={required}
                />
            )}
        </>
    );
};

export default CustomSelectApiHookForm;