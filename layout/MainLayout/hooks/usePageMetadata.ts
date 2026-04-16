import { useLocation } from 'react-router-dom';
import { rotherMenuItems } from '../../../router/menu';
import { lithiumMenuIcons, LithiumMenuIconType } from '../../../pages/_layout/_headers/lithium-menu-icons';
import React from 'react';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    active?: boolean;
}

interface PageMetadata {
    title: string;
    icon?: React.ComponentType<any>;
    breadcrumbs: BreadcrumbItem[];
}

export const usePageMetadata = (): PageMetadata => {

    // GET CURRENT PATHNAME

    const location = useLocation();
    const pathname = location.pathname;

    // HELPER TO FIND METADATA RECURSIVELY

    const findInMenu = (
        menuItems: any, 
        currentPath: string, 
        breadcrumbsAcc: BreadcrumbItem[]
    ): PageMetadata | null => {
        
        const items = Object.values(menuItems);

        for (const item of items as any[]) {

            // CHECK CURRENT ITEM 

            // MATCH EXACT PATH OR SUB-PATHS IF IT'S A SECTION

            const isMatch = item.path === currentPath || (item.href === currentPath);
            
            // BUILD CURRENT BREADCRUMB

            const currentBreadcrumb = { 
                label: item.name, 
                path: item.path || item.href 
            };
            
            // IF MATCH, RETURN METADATA

            if (isMatch) {
                let icon: React.ComponentType<any> | undefined = undefined;
                if (item.icon && lithiumMenuIcons[item.icon as LithiumMenuIconType]) {
                    icon = lithiumMenuIcons[item.icon as LithiumMenuIconType];
                } else if (item.react_icon) {
                    icon = item.react_icon;
                }

                const finalBreadcrumbs = item.hideInBreadcrumb
                    ? breadcrumbsAcc
                    : [...breadcrumbsAcc, { ...currentBreadcrumb, active: true }];

                return {
                    title: item.name,
                    icon: icon,
                    breadcrumbs: finalBreadcrumbs
                };
            }

            // CHECK CHILDREN (dropdownItems or subMenuItems)
            
            if (item.dropdownItems || item.subMenuItems) {
                const children = item.dropdownItems || item.subMenuItems;

                const nextBreadcrumbs = item.hideInBreadcrumb 
                    ? breadcrumbsAcc 
                    : [...breadcrumbsAcc, currentBreadcrumb];
                
                const result = findInMenu(children, currentPath, nextBreadcrumbs);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

  
    const defaultMetadata: PageMetadata = {
        title: 'Rother IoT',
        breadcrumbs: []
    };

    const metadata = findInMenu(rotherMenuItems, pathname, []);

    return metadata || defaultMetadata;
};
