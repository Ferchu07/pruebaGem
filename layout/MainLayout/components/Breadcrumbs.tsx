import React from 'react';
import { ArrowForwardIos } from '../../../components/icon/material-icons';

export interface BreadcrumbItem {
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {

    // RENDER

    return (
        <div className="app-header-breadcrumbs">

            {/* RENDER BREADCRUMBS */}

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className="app-separator fb active">
                            <ArrowForwardIos className='w-2 h-2'/>
                        </span>
                    )}
                    <span 
                        className={`fb ${item.active ? 'active' : ''}`} 
                        onClick={item.onClick}
                        style={item.onClick ? { cursor: 'pointer' } : undefined}
                    >
                        {item.label}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumbs;
