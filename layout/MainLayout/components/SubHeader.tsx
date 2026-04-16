import React from 'react';
import { useAtomValue } from 'jotai';
import { headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as GeolocalizacionIcon } from '../../../assets/Iconos/Interfaz/geolocalizacion.svg';

export interface SubHeaderProps {
    title: string;
    icon?: React.ComponentType<any>;
}

const SubHeader: React.FC<SubHeaderProps> = ({ title, icon }) => {

    // ATOMS 

    const headerConfig = useAtomValue(headerConfigAtom);

    // PRIORIZE ATOM CONFIGURATION IF AVAILABLE
    
    const displayTitle = headerConfig?.title || title;
    
    // DETERMINE ICON TO RENDER:

    // 1. IF headerConfig.icon EXISTS, USE IT DIRECTLY (IT'S ALREADY A NODE OR COMPONENT)
    // 2. IF NOT, USE THE PROP 'icon' (ComponentType)
    // 3. FALLBACK TO DEFAULT ICON (GeolocalizacionIcon)

    const renderIcon = () => {
        if (headerConfig?.icon) {
             return headerConfig.icon as React.ReactNode; 
        }
        
        const IconComponent = icon || GeolocalizacionIcon;
        return <IconComponent className={`app-sub-icon small ${headerConfig?.classNameIcon || ''}`}  />;    
    };

    // RENDER

    return (
        <div className="app-header-sub">
            <div className="app-sub-content">
                {/* @ts-ignore */}
                {renderIcon()}
                <span className="app-sub-title">{displayTitle}</span>
            </div>
        </div>
    );
};

export default SubHeader;
