import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ReactComponent as InicioIcon } from '../../../assets/Iconos/Interfaz/inicio.svg';
import { ReactComponent as IdiomaIcon } from '../../../assets/Iconos/Interfaz/idioma.svg';
import fullLogo from '../../../assets/full_logo.png';
import MenuDropdown from './MenuDropdown';
import UserDropdown from './UserDropdown';
import HamburgerButton from '../../../pages/_layout/settings/hamburger-button';
import Sidebar from '../../../pages/_layout/_sidebar/sidebar';
import AsyncImg from '../../../components/extras/AsyncImg';
import ChangeCompany from '../../../components/ChangeCompany/ChangeCompany';
import { RootState } from '../../../redux/store';
import { rotherMenuItems } from '../../../router/menu';
import { ReactComponent as FlechaIcon } from '../../../assets/Iconos/menu/flecha.svg';
import { ReactComponent as GearIcon } from '../../../assets/Iconos/menu/administracion.svg';

export interface HeaderProps {
    onHomeClick?: () => void;
    onUserClick?: () => void;
    onLangClick?: () => void;
    onMenuClick?: () => void;
    language?: string;
    showStatus?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onHomeClick, 
    onUserClick,
    onMenuClick,
    language: propLanguage = 'ES',
    showStatus = true 
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const userButtonRef = useRef<HTMLButtonElement>(null);
    const { i18n } = useTranslation();
    const user = useSelector((state: RootState) => state.auth.user);
    const location = useLocation();
    const isHomeActive = location.pathname === '/' || location.pathname.startsWith('/dashboard');
    const currentLanguage = (i18n.resolvedLanguage || i18n.language || propLanguage).split('-')[0];

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
        if (onMenuClick) onMenuClick();
    };

    const handleUserMenuClick = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
        if (onUserClick) onUserClick();
    };

    const toggleLanguage = () => {
        const newLang = currentLanguage === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    const getActiveMenuIcon = () => {
        const adminItems = rotherMenuItems.administrationMenu.dropdownItems || [];
        
        for (const item of adminItems) {
            if (item.path && location.pathname.startsWith(item.path)) {
                return item.header_icon || item.react_icon;
            }
            
            if (item.subMenuItems) {
                const matchedSub = item.subMenuItems.find(sub => 
                    sub.href && location.pathname.startsWith(sub.href)
                );
                
                if (matchedSub) {
                    // Si el subitem tiene un header_icon específico, lo usamos.
                    // Si no, usamos el del padre (item.header_icon || item.react_icon)
                    return matchedSub.header_icon || item.header_icon || item.react_icon;
                }
            }
        }

        if (isHomeActive) {
            return GearIcon;
        }
        
        return adminItems[0]?.header_icon || adminItems[0]?.react_icon;
    };

    const ActiveIcon = getActiveMenuIcon();

    return (
        <div className="flex flex-col w-full">
            <div className="app-header-top pb-8">
                <div className="app-header-left">
                    <HamburgerButton 
                        view={<Sidebar className="static w-full 2xl:w-full" />}
                        className="block xl:hidden mr-2"
                    />
                    <div className="app-logo-container">
                        <img src={fullLogo} alt="Rother Logo" className="app-logo-img" />
                    </div>
                    
                    <div className="app-header-actions">
                            <button className={`app-icon-btn hidden xl:flex`} onClick={onHomeClick}>
                                <InicioIcon className={`h-6 w-6 ${isHomeActive ? 'fill-primary' : ''}`} />
                            </button>
                            <button 
                                ref={menuButtonRef}
                                className={`app-icon-btn app-user-btn hidden xl:flex ${isMenuOpen && !isHomeActive ? 'active-menu' : ''}`} 
                                onClick={handleMenuClick}
                            >
                                {ActiveIcon && <ActiveIcon className={`app-user-icon-img ${isHomeActive ? 'fill-black' : 'fill-primary'}`} />}
                                <FlechaIcon className={`w-2.5 h-2.5 -rotate-90 text-gray-400 rotate-0 ms-3 me-1 ${isHomeActive ? 'brightness-0' : 'fill-primary'}`} />
                            </button>
                            
                            <MenuDropdown 
                                isOpen={isMenuOpen} 
                                onClose={() => setIsMenuOpen(false)} 
                                anchorEl={menuButtonRef.current}
                            />
                    </div>
                </div>

                <div className="app-header-right">
                    <div className="hidden md:block mr-4 w-[250px]">
                        <ChangeCompany />
                    </div>
                        <button className="app-icon-btn app-lang-btn relative w-[36px] h-[36px]" onClick={toggleLanguage}>
                        <IdiomaIcon className="h-5 w-5" />
                        <span className="absolute bottom-0.5 right-1 text-[8px] leading-none font-semibold">{currentLanguage.toUpperCase()}</span>
                        </button>
                        {showStatus && (
                            <>
                                <button 
                                    ref={userButtonRef}
                                    onClick={handleUserMenuClick}
                                    className="h-9 w-9 overflow-hidden rounded border border-gray-200 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary/20 transition-all"
                                >
                                    <AsyncImg 
                                        id={(user as any)?.profileImg?.id || (user as any)?.profileImage || null} 
                                        isAvatar 
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                                
                                <UserDropdown 
                                    isOpen={isUserMenuOpen} 
                                    onClose={() => setIsUserMenuOpen(false)} 
                                    anchorEl={userButtonRef.current}
                                />
                            </>
                        )}
                </div>
            </div>
            
            <div className="block md:hidden w-full px-5 pb-3 bg-[#C3D1F6] border-b border-[#A1B9F7]">
                <ChangeCompany />
            </div>
        </div>
    );
};

export default Header;
