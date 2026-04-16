import chroma from 'chroma-js';
import classNames from 'classnames';
import React from 'react';
import { ReactComponent as InfoIcon } from '../../assets/Iconos/Interfaz/ver.svg';
import SelectReact, { OptionProps, SingleValueProps, components } from 'react-select';
import makeAnimated from 'react-select/animated';
import { Tooltip } from 'rizzui';

type SelectProps = {
    id: string;
    label?: string | React.ReactNode;
    info?: string;
    error?: any;
    isSearchable?: boolean;
    isMulti?: boolean;
    isClearable?: boolean;
    isDisabled?: boolean;
    options?: any;
    onChange?: any;
    handle?: any;
    value?: any;
    defaultValue?: any;
    placeholder?: string;
    noOption?: any;
    containerClassName?: string;
    className?: string;
    onBlur?: any;
    display?: boolean;
    required?: boolean;
    isLoading?: boolean;
    onInputChange?: any;
    inputValue?: any;
    key?: any;
    formatOptionLabel?: (option: any) => React.ReactNode;
    formatSingleValueLabel?: (option: any) => React.ReactNode;
    customStyles?: any;
};

const CustomSelect: React.FC<SelectProps> = ({ id, label, info, isSearchable, isMulti, isClearable, isDisabled, required, options, onChange, handle, value, defaultValue, placeholder, noOption, containerClassName, className, onBlur, display = true, error, isLoading = false, onInputChange, inputValue, key, formatOptionLabel, formatSingleValueLabel, customStyles }) => {

    const Option = (props: OptionProps<any>) => (
        <components.Option {...props}>
            {formatOptionLabel ? formatOptionLabel(props.data) : props.children}
        </components.Option>
    );

    const SingleValue = (props: SingleValueProps<any>) => (
        <components.SingleValue {...props}>
            {formatSingleValueLabel ? formatSingleValueLabel(props.data) : (formatOptionLabel ? formatOptionLabel(props.data) : props.children)}
        </components.SingleValue>
    );

    return (
        <div className={classNames(containerClassName, { 'hidden': !display })} key={key}>
            <label className='block'>
                {label && (
                    <span className="rizzui-input-label block text-sm mb-1.5 font-medium">
                        {label}
                        {required && <span className="text-red-500"> *</span>}
                        {info && (
                            <Tooltip
                                size="md"
                                content={<div className='tooltip-container'>{info}</div>}
                                placement="top"
                                color="invert"
                            >
                                <div className={'inline-block ms-1'}>
                                    <InfoIcon className="w-5 h-5 text-primary" />
                                </div>
                            </Tooltip>
                        )}
                    </span>
                )}
                <SelectReact
                    key={key}
                    id={id}
                    name={id}
                    tabSelectsValue
                    components={formatOptionLabel ? isMulti ? { Option } : { Option, SingleValue } : makeAnimated()}
                    isSearchable={isSearchable}
                    isMulti={isMulti}
                    isLoading={isLoading}
                    loadingMessage={() => 'Cargando...'}
                    isClearable={isClearable}
                    isDisabled={isDisabled}
                    options={options}
                    onInputChange={onInputChange}
                    onChange={onChange ? ((selectedOption: any) => { onChange(selectedOption); }) : handle}
                    value={value}
                    inputValue={inputValue}
                    defaultValue={defaultValue}
                    onBlur={onBlur}
                    placeholder={`Elegir ${placeholder || ''}...`}
                    noOptionsMessage={noOption || (() => 'No se ha encontrado ningún resultado')}
                    className={className}
                    styles={{
                        menu: (base: any) => ({
                            ...base,
                            zIndex: 11,
                            ...customStyles?.menu?.(base),
                        }),
                        input: (base: any) => ({
                            ...base,
                            borderRadius: '0.375rem',
                            ...customStyles?.input?.(base),
                        }),
                        control: (base: any, state: any) => ({
                            ...base,
                            border: error ? '1.5px solid rgb(255 0 0)' : '1px solid white',
                            borderRadius: '0.375rem',
                            //boxShadow: state.isFocused ? '0 0 0 2px rgb(0, 31, 217)' : '0 0 0 1px rgba(0,0,0, 0.2) !important',
                            backgroundColor: isDisabled ? '#e9ecef' : '#a1b8f7',
                            '&:hover': {
                                borderColor: 'white',
                            },
                            '&:focus': {
                                borderColor: 'rgb(0, 31, 217)',
                                boxShadow: '0 0 0 2px rgb(0, 31, 217)',
                            },
                            ...customStyles?.control?.(base, state),
                        }),
                        option: (provided: any, state: any) => ({
                            ...provided,
                            backgroundColor: state.isFocused ? 'rgb(0, 31, 217)' : 'white',
                            color: state.isFocused ? 'white' : 'black',
                            cursor: state.data.disabled ? 'not-allowed' : 'pointer', // 🔹 Bloquea el cursor en opciones deshabilitadas
                            opacity: state.data.disabled ? 0.5 : 1, // 🔹 Reduce la opacidad en opciones deshabilitadas
                            pointerEvents: state.data.disabled ? 'none' : 'auto', // 🔹 Bloquea los eventos de clic en opciones deshabilitadas
                            '&:hover': {
                                backgroundColor: 'rgb(0, 31, 217)',
                                color: 'white',
                                borderColor: '#000000 !important'
                            },
                            ...customStyles?.option?.(provided, state),
                        }),
                        multiValueLabel: (styles: any, { data }: any) => {
                            const backgroundColor = data.color || '#E6E5E5';
                            let textColor = 'black';
                            if (chroma.valid(backgroundColor)) {
                                textColor = chroma.contrast(backgroundColor, 'white') > 4.5 ? 'white' : 'black';
                            }
                            return {
                                ...styles,
                                backgroundColor,
                                color: textColor,
                                ...customStyles?.multiValueLabel?.(styles, { data }),
                            };
                        },
                        multiValueRemove: (styles: any, { data }: any) => {
                            const backgroundColor = data.color || '#E6E5E5';
                            let textColor = 'black';
                            if (chroma.valid(backgroundColor)) {
                                textColor = chroma.contrast(backgroundColor, 'white') > 4.5 ? 'white' : 'black';
                            }
                            return {
                                ...styles,
                                backgroundColor,
                                color: textColor + ' !important',
                                ':hover': {
                                    backgroundColor: chroma.contrast(backgroundColor, 'white') > 4.5 ? chroma(backgroundColor).brighten(0.5).hex() : chroma(backgroundColor).darken(0.5).hex(),
                                    color: textColor,
                                },
                                ...customStyles?.multiValueRemove?.(styles, { data }),
                            };
                        },
                    }}
                />
            </label>

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default CustomSelect;