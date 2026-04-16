import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Collapse, Title } from 'rizzui';
import { ReactComponent as FlechaIcon } from '../../../assets/Iconos/Interfaz/flecha.svg';
import StatusBadge from '../../../components/navigation/get-status-badge';
import { rotherMenuItems } from '../../../router/menu';
import { DropdownMenuItemType } from '../../../type/menu-type';
import { useCheckMenuAccess } from '../../../utils/CheckMenuPermissions';
import cn from '../../../utils/classNames';
import { LithiumMenuIconType, lithiumMenuIcons } from '../_headers/lithium-menu-icons';

export function SidebarMenu({ closeDrawer }: { closeDrawer?: Function }) {
    const pathname = useLocation().pathname;
    const checkMenuItemAccess = useCheckMenuAccess();

    return (
        <div className="mt-4 pb-3 3xl:mt-6">
            {Object.entries(rotherMenuItems).map(([key, item]: [string, any], index: number) => {
                const Icon = item.icon ? lithiumMenuIcons?.[item.icon as LithiumMenuIconType] : null;
                const ReactIcon = item.react_icon ? item.react_icon : null;
                let isActive = pathname === (item?.path as string);

                return (
                    checkMenuItemAccess(item.permissions_required, item.dropdownItems) &&
                    <Fragment key={item.name + '-' + index}>
                        <Title
                            as="h6"
                            className={cn(
                                'mb-2 truncate px-6 text-xs font-normal uppercase tracking-widest text-gray-500 2xl:px-8',
                                index !== 0 && 'mt-6 3xl:mt-7'
                            )}
                        >
                            {item.name}
                        </Title>

                        {/* Print the item path link if it exists and there are no dropdown items */}
                        {item.path && !item.dropdownItems && checkMenuItemAccess(item.permissions_required) && (
                            pathname === item?.path ? (
                                <span
                                    className={cn(
                                        'group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2',
                                        'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                                    )}
                                >
                                    <div className="flex items-center truncate">
                                        {item?.react_icon && (
                                            <span
                                                className={cn(
                                                    'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]',
                                                    'text-primary'
                                                )}
                                            >
                                                {Icon ? <Icon className='h-5 w-5 me-2 brightness-0' /> : (ReactIcon && <ReactIcon className='h-5 w-5 me-2 brightness-0' />)}
                                            </span>
                                        )}
                                        <span className="truncate">{item.name}</span>
                                    </div>
                                    {item?.badge ? (
                                        <StatusBadge badge={item?.badge} />
                                    ) : null}
                                </span>
                            ) : (
                                <Link
                                    to={item?.path}
                                    key={item?.path + pathname}
                                    className={cn(
                                        'group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2',
                                        'text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
                                    )}
                                    onClick={() => closeDrawer && closeDrawer()}
                                >
                                    <div className="flex items-center truncate">
                                        {item?.react_icon && (
                                            <span
                                                className={cn(
                                                    'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]',
                                                    'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                                                )}
                                            >
                                                {Icon ? <Icon className='h-5 w-5 me-2 brightness-0' /> : (ReactIcon && <ReactIcon className='h-5 w-5 me-2 brightness-0' />)}
                                            </span>
                                        )}
                                        <span className="truncate">{item.name}</span>
                                    </div>
                                    {item?.badge ? (
                                        <StatusBadge badge={item?.badge} />
                                    ) : null}
                                </Link>
                            )
                        )}

                        {/* Print the item path link if it exists and there are dropdown items */}
                        {item.dropdownItems && (
                            <>
                                {item.dropdownItems.map((item: DropdownMenuItemType, index: number) => {
                                    const Icon = item.icon ? lithiumMenuIcons?.[item.icon as LithiumMenuIconType] : null;
                                    const ReactIcon = item.react_icon || null;
                                    const isDropdownOpen = (pathname === item.path || item.subMenuItems?.some((subItem) => pathname.includes(subItem.href)));
                                    return (
                                        <>
                                            {item.subMenuItems
                                                ? (
                                                    // If the item has subMenuItems, render a dropdown
                                                    checkMenuItemAccess(item.permissions_required, [item]) &&
                                                    <Collapse
                                                        defaultOpen={isDropdownOpen}
                                                        header={({ open, toggle }) => (
                                                            <div
                                                                onClick={toggle}
                                                                className={cn(
                                                                    'group relative mx-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2',
                                                                    isDropdownOpen
                                                                        ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                                                                        : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-700/90 dark:hover:text-gray-700'
                                                                )}
                                                            >
                                                                <span className="flex items-center">
                                                                    {Icon ? <Icon className='h-5 w-5 me-2 brightness-0' /> : (ReactIcon && <ReactIcon className='h-5 w-5 me-2 brightness-0' />)}
                                                                    {item.name}
                                                                </span>

                                                                <FlechaIcon
                                                                    className={cn(
                                                                        'h-3.5 w-3.5 -rotate-90 text-gray-500 transition-transform duration-200 rtl:rotate-90',
                                                                        open && 'rotate-0 rtl:rotate-0'
                                                                    )}
                                                                />
                                                            </div>
                                                        )}
                                                    >
                                                        {item?.subMenuItems?.map((subMenuItems, index) => {
                                                            const isChildActive = pathname === subMenuItems?.href;

                                                            return (
                                                                checkMenuItemAccess(subMenuItems.permissions_required) &&
                                                                (isChildActive ? (
                                                                    <span
                                                                        key={subMenuItems?.name + index}
                                                                        className={cn(
                                                                            'mx-3.5 mb-0.5 flex items-center justify-between rounded-md px-3.5 py-2 font-medium capitalize last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5',
                                                                            'text-primary'
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center truncate">
                                                                            <span
                                                                                className={cn(
                                                                                    'me-[18px] ms-1 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200',
                                                                                    'bg-primary ring-[1px] ring-primary'
                                                                                )}
                                                                            />{' '}
                                                                            <span className="truncate">
                                                                                {subMenuItems?.name}
                                                                            </span>
                                                                        </div>
                                                                    </span>
                                                                ) : (
                                                                    <Link
                                                                        to={subMenuItems?.href}
                                                                        key={subMenuItems?.name + index}
                                                                        className={cn(
                                                                            'mx-3.5 mb-0.5 flex items-center justify-between rounded-md px-3.5 py-2 font-medium capitalize last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5',
                                                                            'text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900'
                                                                        )}
                                                                        onClick={() => closeDrawer && closeDrawer()}
                                                                    >
                                                                        <div className="flex items-center truncate">
                                                                            <span
                                                                                className={cn(
                                                                                    'me-[18px] ms-1 inline-flex h-1 w-1 rounded-full bg-current transition-all duration-200',
                                                                                    'opacity-40'
                                                                                )}
                                                                            />{' '}
                                                                            <span className="truncate">
                                                                                {subMenuItems?.name}
                                                                            </span>
                                                                        </div>
                                                                    </Link>
                                                                ))
                                                            );
                                                        })}
                                                    </Collapse>
                                                )
                                                : (
                                                    // If the item has no subMenuItems, render a link
                                                    checkMenuItemAccess(item.permissions_required) &&
                                                    <Link
                                                        to={`${item?.path ?? ''}`}
                                                        className={cn(
                                                            'group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2',
                                                            isActive
                                                                ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                                                                : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
                                                        )}
                                                        onClick={() => closeDrawer && closeDrawer()}
                                                    >
                                                        <div className="flex items-center truncate">
                                                            {item?.react_icon && (
                                                                <span
                                                                    className={cn(
                                                                        'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]',
                                                                        isActive
                                                                            ? 'text-primary'
                                                                            : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                                                                    )}
                                                                >
                                                                    {ReactIcon && <ReactIcon className="brightness-0" />}
                                                                </span>
                                                            )}
                                                            <span className="truncate">{item.name}</span>
                                                        </div>
                                                        {/* {item?.badge?.length ? (
                                                    <StatusBadge status={item?.badge} />
                                                ) : null} */}
                                                    </Link>
                                                )
                                            }
                                        </>
                                    );
                                })}
                            </>
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}