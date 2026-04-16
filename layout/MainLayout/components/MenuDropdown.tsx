import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { rotherMenuItems } from '../../../router/menu';
import { lithiumMenuIcons, LithiumMenuIconType } from '../../../pages/_layout/_headers/lithium-menu-icons';
import { ReactComponent as FlechaIcon } from '../../../assets/Iconos/menu/flecha.svg';
import cn from '../../../utils/classNames';
import { useCheckMenuAccess } from '../../../utils/CheckMenuPermissions';
import { DropdownMenuItemType, SubMenuItemType } from '../../../type/menu-type';

interface MenuDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({ isOpen, onClose, anchorEl }) => {

    // STATES

    const dropdownRef = useRef<HTMLDivElement>(null);
    const categories: DropdownMenuItemType[] = rotherMenuItems.administrationMenu.dropdownItems || [];
    const checkMenuItemAccess = useCheckMenuAccess();

    // ----------------------------------------------------------------------
    /**
     * @ES AYUDA A RENDERIZAR UN ICONO SEGÚN EL TIPO DE ICONO
     * @EN HELPERS TO RENDER AN ICON BASED ON ITS TYPE
     * 
     * @param item 
     * @param className 
     * @returns 
     */
    // ----------------------------------------------------------------------
    const renderIcon = (item: DropdownMenuItemType | SubMenuItemType, className = "w-4 h-4") => {
        if (item.react_icon) {
            const Icon = item.react_icon;
            return <Icon className={className} />;
        }
        if (item.icon && lithiumMenuIcons[item.icon as LithiumMenuIconType]) {
            const Icon = lithiumMenuIcons[item.icon as LithiumMenuIconType];
            return <Icon className={className} />;
        }
        return <FlechaIcon className={`w-2.5 h-2.5 -rotate-90 brightness-0`} />; 
    };
    // ----------------------------------------------------------------------

    // USE EFFECT

    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
                anchorEl && !anchorEl.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, [isOpen, onClose, anchorEl]);

    if (!isOpen || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const top = rect.bottom + 10;
    const left = Math.max(10, rect.left); 

    // RENDER

    const filteredCategories = categories.map((cat: DropdownMenuItemType) => {
        const filteredSubs = cat.subMenuItems ? cat.subMenuItems.filter((sub: SubMenuItemType) => 
            checkMenuItemAccess(sub.permissions_required)
        ) : [];
        return { ...cat, subMenuItems: filteredSubs };
    }).filter((cat: DropdownMenuItemType) => {
        // Check parent permission
        if (!checkMenuItemAccess(cat.permissions_required)) return false;
        
        // Check content visibility: 
        // - If it has path, it can be shown (if permission ok)
        // - If it has children, it can be shown
        if ((cat.path && (!cat.subMenuItems || !cat.subMenuItems.length)) || (cat.subMenuItems && cat.subMenuItems.length > 0)) return true;
        
        return false;
    });

    // RENDER

    return (
        <div 
            ref={dropdownRef}
            className="fixed z-[9999] border-2 border-black flex flex-col bg-white shadow-2xl rounded-xl font-sans text-sm animate-fade-in min-w-[280px] py-2"
            style={{ 
                top: `${top}px`, 
                left: `${left}px`,
                maxHeight: '80vh'
            }}
        >
            {filteredCategories.map((cat) => {
                const hasSubMenu = cat.subMenuItems && cat.subMenuItems.length > 0;
                const Component = (cat.path && !hasSubMenu ? Link : 'div') as React.ElementType;
                const props = cat.path && !hasSubMenu ? { to: cat.path, onClick: onClose } : {};

                return (
                    <div 
                        key={cat.id}
                        className="relative group/item"
                    >
                        {/* MAIN ITEM */}
                        <Component 
                            {...props}
                            className={cn(
                                "px-4 py-3 mx-2 rounded-lg cursor-pointer flex items-center justify-between transition-all hover:bg-gray-50 text-gray-700 hover:text-gray-900",
                                hasSubMenu && "group-hover/item:bg-gray-50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {renderIcon(cat, "h-7 w-7 object-contain brightness-0")}
                                <span className="font-medium text-base">{cat.name}</span>
                            </div>
                            {hasSubMenu && (
                                <FlechaIcon className="w-2.5 h-2.5 -rotate-90 brightness-0 " />
                            )}
                        </Component>

                        {hasSubMenu && (
                            <div className="hidden border-2 border-black group-hover/item:block absolute left-full top-0 ml-1 bg-white shadow-xl rounded-xl min-w-[220px] py-2 p-1">
                                {cat.subMenuItems?.map((sub: SubMenuItemType, idx: number) => (
                                    <Link 
                                        key={idx}
                                        to={sub.href || '#'}
                                        className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                                        onClick={onClose}
                                    >
                                        {renderIcon(sub, "h-6 w-6 object-contain text-black brightness-0")}
                                        <span className="font-medium">{sub.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MenuDropdown;
