import { ReactComponent as FlechaIcon } from '../../assets/Iconos/Interfaz/flecha.svg';
import { useDispatch } from "react-redux"
import { Link, useLocation } from "react-router-dom"
import { Button, Text, cn } from "rizzui"
import { useBerylliumSidebars } from "../../hooks/themes/berylliumUtils"
import { LAYOUT_OPTIONS, useLayout } from "../../hooks/useLayout"
import { useScrollableSlider } from "../../hooks/useScrollableSlider"
import { permissionsGroup, usePrivilege } from "../priviledge/PriviledgeProvider"

export type MenuItem = {
    path: string
    label: string
    permission: {
        action: string
        group: permissionsGroup
    }
}

export type TabNavProps = {
    menuItems: MenuItem[]
    setSelectedView?: any /* (path: string) => UnknownAction */
    variant?: 'underline' | 'block'
    className?: string
}

export default function TabNav({ menuItems, setSelectedView, variant = 'underline', className }: TabNavProps) {

    const location = useLocation();
    const { sliderEl, sliderPrevBtn, sliderNextBtn, scrollToTheRight, scrollToTheLeft } = useScrollableSlider();
    const { layout } = useLayout();
    const { expandedLeft } = useBerylliumSidebars();
    const dispatch = useDispatch();
    const { userCan } = usePrivilege();
    const basePath = location.pathname.split('/').slice(0, -1).join('/');

    return (
        <div
            className={cn(
                'max-w-[99vw] sticky z-20 -mx-4 -mt-4 px-4 py-0 font-medium text-gray-500 sm:-mt-2 md:-mx-5 md:px-5 lg:-mx-8 lg:mt-0 lg:px-8 xl:-mx-6 xl:px-6 2xl:top-20 3xl:-mx-[33px] 3xl:px-[33px] 4xl:-mx-10 4xl:px-10 dark:bg-gray-50',
                variant === 'underline' && 'border-b border-muted bg-white',
                layout === LAYOUT_OPTIONS.LITHIUM
                    ? 'top-[66px] sm:top-[70px] md:top-[73px] '
                    : layout === LAYOUT_OPTIONS.BERYLLIUM
                        ? 'top-[62px] sm:top-[72px] 2xl:top-[72px]'
                        : 'top-[62px] md:top-[71px]',
                layout === LAYOUT_OPTIONS.BERYLLIUM && expandedLeft && 'xl:-ms-1 xl:px-0 3xl:-ms-2 3xl:ps-0 4xl:-ms-2',
                className
            )}
        >
            <div className="relative flex items-center overflow-hidden">
                <Button
                    title="Anterior"
                    variant="text"
                    ref={sliderPrevBtn}
                    onClick={() => scrollToTheLeft()}
                    className="!absolute left-0 top-0.5 z-10 !h-[calc(100%-4px)] w-8 !justify-start bg-gradient-to-r from-white via-white to-transparent px-0 text-gray-500 hover:text-black lg:hidden dark:from-gray-50 dark:via-gray-50"
                >
                    <FlechaIcon className="w-5 transform rotate-90" />
                </Button>
                <div className="flex h-[40px] overflow-hidden">
                    <div
                        className={cn(
                            "-mb-7 flex w-full overflow-x-auto scroll-smooth pb-7",
                            variant === 'underline' ? "gap-3 md:gap-5 lg:gap-8" : ""
                        )}
                        ref={sliderEl}
                    >
                        {menuItems.map((menu: MenuItem, index: number) => {
                            if (menu.permission && !userCan(menu.permission.action, menu.permission.group)) return;
                            
                            const isActive = menu.path.toLowerCase() === location.pathname.toString().toLowerCase() || 
                                           location.pathname.toString().toLowerCase().includes(menu.path.toLocaleLowerCase());

                            return (
                                <Link
                                    to={`${basePath}${menu.path}`}
                                    relative="route"
                                    key={`menu-${index}`}
                                    className={cn(
                                        'group relative cursor-pointer whitespace-nowrap font-medium transition-all h-strech border-l border-r border-white',
                                        variant === 'underline' && cn(
                                            'py-2 text-gray-500 hover:text-gray-900',
                                            'before:absolute before:bottom-0 before:left-0 before:z-[1] before:h-0.5 before:bg-gray-1000 before:transition-all',
                                            isActive
                                                ? 'before:visible before:w-full before:opacity-100 text-primary'
                                                : 'before:invisible before:w-0 before:opacity-0'
                                        ),
                                        variant === 'block' && cn(
                                            'px-6 text-sm text-white flex items-center justify-center min-w-[150px]',
                                            isActive
                                                ? 'bg-[#a1b8f7]'
                                                : 'bg-[#7c96d4] hover:bg-[#8ea6e6]'
                                        )
                                    )}
                                    onClick={() => setSelectedView && dispatch(setSelectedView(menu.path))}
                                >
                                    {variant === 'underline' ? (
                                        <Text
                                            as="span"
                                            className="inline-flex rounded-md px-2.5 py-1.5 transition-all duration-200 group-hover:bg-gray-100/70"
                                        >
                                            {menu.label}
                                        </Text>
                                    ) : (
                                        <span>{menu.label}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <Button
                    title="Siguiente"
                    variant="text"
                    ref={sliderNextBtn}
                    onClick={() => scrollToTheRight()}
                    className="!absolute right-0 top-0.5 z-10 !h-[calc(100%-4px)] w-8 !justify-end bg-gradient-to-l from-white via-white to-transparent px-0 text-gray-500 hover:text-black lg:hidden dark:from-gray-50 dark:via-gray-50"
                >
                    <FlechaIcon className="w-5 transform rotate-[270deg]" />
                </Button>
            </div>
        </div>
    )
}