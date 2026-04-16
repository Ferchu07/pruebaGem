import React from 'react';

interface FormLabelProps {
    label: string;
    required?: boolean;
    children?: React.ReactNode;
}

const FormLabel: React.FC<FormLabelProps> = ({ label, required, children }) => {
    return (
        <label className='block'>
            <span className='rizzui-input-label block text-sm mb-1.5 font-medium'>
                {label}
                {required && <span className="text-red-500"> *</span>}
            </span>
            {children}
        </label>
    );
};

export default FormLabel;