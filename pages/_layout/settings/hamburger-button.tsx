import React, { useEffect, useState } from 'react';
import { ActionIcon } from 'rizzui';
import Spinner from '../../../components/bootstrap/Spinner';
import cn from '../../../utils/classNames';
const Drawer = React.lazy(() => import('rizzui').then(module => ({ default: module.Drawer })));
// import {
//     DrawerPlacements,
//     useDrawer,
//   } from '@/app/shared/drawer-views/use-drawer';
// const Drawer = React.lazy(() => import('rizzui').then(module => ({ default: module.Drawer })));

interface Props {
    view: JSX.Element;
    placement?: "left" | "top" | "right" | "bottom" | undefined;
    containerClassName?: string;
    className?: string;
}

export default function HamburgerButton({
    view,
    placement = 'left',
    containerClassName = 'max-w-[320px]',
    className,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isComponentLoaded, setComponentLoaded] = useState(false);

    useEffect(() => {
        setComponentLoaded(true);
    }, []);

    return (
        <>
            <React.Suspense fallback={<div className='text-center'><Spinner /></div>}>
                {isComponentLoaded && (
                    <Drawer
                    size="sm"
                    isOpen={isOpen ?? false}
                    placement={placement}
                    onClose={() => setIsOpen(false)}
                    overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-md"
                    containerClassName={cn("dark:bg-gray-100", containerClassName)}
                    className="z-[9999]"
                >
                    {React.cloneElement(view, { closeDrawer: () => setIsOpen(false) })}
                </Drawer>
                )}
            </React.Suspense>
            <ActionIcon
                aria-label="Open Sidebar Menu"
                variant="text"
                className={cn('me-3 h-auto w-auto p-0 sm:me-4 xl:hidden', className)}
                onClick={() =>
                    setIsOpen(true)
                }
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5"
                    />
                </svg>
            </ActionIcon>
        </>
    );
}
