import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import { logoutThunk } from '../../../redux/authSlice';

interface UserDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose, anchorEl }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
    // Align right edge of dropdown with right edge of anchor
    const right = window.innerWidth - rect.right; 
    
    const handleLogout = () => {
        // @ts-ignore
        dispatch(logoutThunk());
        navigate('/login');
        onClose();
    };

    return (
        <div 
            ref={dropdownRef}
            className="fixed z-[9999] border border-gray-200 flex flex-col bg-white shadow-lg rounded-lg font-sans text-sm animate-fade-in min-w-[240px] py-2"
            style={{ 
                top: `${top}px`, 
                right: `${right}px`,
            }}
        >
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-base text-gray-900 truncate">{(user as any)?.name} {(user as any)?.lastName || ''}</p>
                <p className="text-gray-500 truncate text-sm mt-0.5">{(user as any)?.email}</p>
            </div>
            
            <div className="py-2">
                <Link 
                    to={`/users/${(user as any)?.id}/profile/info`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors font-medium"
                    onClick={onClose}
                >
                    Mi Perfil
                </Link>
            </div>

            <div className="border-t border-gray-100 py-2">
                <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default UserDropdown;
