import React from 'react';
import { KTSVG } from '../icon/KTSVG';

interface SpinnerLogoProps {
    loading?: boolean;
    height?: string;
}

const SpinnerLogo: React.FC<SpinnerLogoProps> = ({ loading, height }) => {
    return (
        loading
            ? <div className='flex justify-center items-center' style={{ height: height || '100vh' }}>
                <div>
                    <KTSVG path={'/media/loading-name.svg'} />
                </div>
            </div>
            : null
    );
};

export default SpinnerLogo;

export const Loader = ({ height }: SpinnerLogoProps) => {
    return (
        <div className='flex justify-center items-center' style={{ height: height || '80vh' }}>
            <KTSVG path={'/media/loading-name.svg'} />
        </div>
    );
};