import React, { useEffect, useState } from 'react';
import { Input } from 'rizzui';
import { Search } from '../icon/material-icons';

type Props = {
    onSearch(value: string): void,
    type?: "number" | "text" | "search" | "email" | "tel" | "url" | "time" | "date" | "week" | "month" | "datetime-local" | undefined,
    placeholder?: string,
    defaultValue?: string,
    className?: string,
    isClearable?: boolean,
    milisecondsDelay?: number,
}

const CustomSearchInput: React.FC<Props> = ({ type = 'text', placeholder = 'Buscar...', onSearch, defaultValue, className, isClearable = false, milisecondsDelay = 1000 }) => {

    const [searchValue, setSearchValue] = useState<string>(defaultValue || '');
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (loaded) {
            const delaySearch = setTimeout(() => {
                onSearch(searchValue);
            }, milisecondsDelay);
            return () => clearTimeout(delaySearch);
        }
    }, [searchValue])

    useEffect(() => {
        setSearchValue(defaultValue || '');
    }, [defaultValue]);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return (
        <div className={className}>
            <Input
                type={type}
                clearable={isClearable}
                placeholder={placeholder}
                prefix={<Search className="w-4" />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value.replace('%', ''))}
                onClear={() => setSearchValue('')}
                inputClassName='bg-[#a1b8f7] border-2 border-[#515E7D]'
            />
        </div>
    )
}

export default CustomSearchInput;