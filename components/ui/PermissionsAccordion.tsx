import { ReactNode, useState } from 'react';
import { Checkbox, CheckboxGroup, Tooltip } from 'rizzui';
import { ReactComponent as FlechaIcon } from '../../assets/Iconos/Interfaz/flecha.svg';
import { Permission, PermissionGroup } from '../../type/entities/role-type';

import { ReactComponent as InfoIcon } from '../../assets/Iconos/Interfaz/ver.svg';
import cn from '../../utils/classNames';

function Accordion({ id, children, open = false, className = '' }: {
    id: string,
    children: React.ReactNode,
    open?: boolean,
    className?: string
}) {
    const [isOpen, setIsOpen] = useState(open);

    return (
        <div className={cn([className, "border-b border-gray-200 rounded-lg shadow-lg mb-4"])}>
            <button
                className="w-full text-left py-3 px-5 flex justify-between items-center bg-secondary text-white rounded-t-lg transition-all duration-300 ease-in-out"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold">{id}</span>
                <FlechaIcon 
                    className={cn("transition-transform duration-300 h-5 w-5", isOpen ? "rotate-180" : "")} 
                />
            </button>
            {isOpen && (
                <div className="px-5 py-4 bg-white rounded-b-lg shadow-inner">
                    {children}
                </div>
            )}
        </div>
    );
}

function AccordionItem({ id, title, children }: { id: string, title?: string, children: React.ReactNode }) {
    return (
        <div className="py-2" id={id}>
            <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
            <div className="mt-2">
                {children}
            </div>
        </div>
    );
}

function Checks({ id, disabled = false, label, value, checked, onChange }: {
    id?: string,
    disabled?: boolean,
    label: ReactNode,
    value: string,
    checked: boolean,
    onChange: () => void
}) {
    return (
        <label className="flex items-center space-x-2">
            <input
                id={id}
                type="checkbox"
                value={value}
                disabled={disabled}
                checked={checked}
                onChange={onChange}
                className="form-checkbox h-5 w-5 text-primary focus:ring-primary focus:ring-offset-0 disabled"
            />
            <div className='text-sm'>{label}</div>
        </label>
    );
}

export default function PermissionAccordion({
    group,
    selectAll,
    setSelectAll,
    selectedPermissions,
    setSelectedPermissions
}: any) {

    const getPermissionsLabel = (id: string, label: string, description: string) => {
        return (
            <>
                <label htmlFor={id}>{label}</label>
                {/* <Tooltip
                    size="sm"
                    content={description}
                    placement="top"
                    color="invert"
                >
                    <HiOutlineInformationCircle size={20} />
                </Tooltip> */}
            </>
        )
    };

    return (
        <Accordion id={group.label} open>
            <AccordionItem id={group.id} /* title={group.label} */>
                <>
                    <Checks
                        label='Seleccionar todos'
                        value="true"
                        checked={selectAll.includes(group.id)}
                        onChange={() => {
                            const list = group.permissions.map((item: Permission) => item.id);
                            if (selectAll.includes(group.id)) {
                                setSelectAll(selectAll.filter((id: number) => id !== group.id));
                                setSelectedPermissions(selectedPermissions.filter((item: any) => !list.includes(item)));
                            } else {
                                setSelectAll([...selectAll, group.id]);
                                setSelectedPermissions([...selectedPermissions, ...list]);
                            }
                        }}
                    />
                </>
                {group.permissions.map((permission: Permission) => (
                    <div key={permission.id} className="pl-4 mt-2">
                        <Checks
                            id={permission.id.toString()}
                            label={getPermissionsLabel(permission.id.toString(), permission.label, permission.description)}
                            value={permission.id.toString()}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => {
                                selectedPermissions.includes(permission.id)
                                    ? setSelectedPermissions(selectedPermissions.filter((id: number) => id !== permission.id))
                                    : setSelectedPermissions([...selectedPermissions, permission.id]);
                            }}
                        />
                    </div>
                ))}
            </AccordionItem>
        </Accordion>
    );
}

export const getPermissionsLabel = (id: string, label: string, description: string, action?: string) => {
    return (
        <div className={'flex items-center'}>
            <label htmlFor={id}>{label}</label>
            {action && (
                <Tooltip
                    size="md"
                    content={action}
                    placement="top"
                    color="invert"
                >
                    <div className={'inline-block ms-1'}>
                        <InfoIcon className="w-5 h-5 text-primary" />
                    </div>
                </Tooltip>
            )}
        </div>
    )
};


export function ShowPermissionAccordion({ group, selectAll, selectedPermissions }: any) {
    return (
        <>
            <div className='grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1'>

                <CheckboxGroup
                    values={selectedPermissions}
                    setValues={(value: React.SetStateAction<string[]>) => { }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:col-span-full md:grid-cols-3 @4xl:col-span-8 @4xl:gap-5 xl:gap-7"
                >
                    {group.permissions.map((permission: Permission) => (
                        <Checkbox
                            key={permission.id.toString()}
                            name="app_notification"
                            label={getPermissionsLabel(permission.id.toString(), permission.label, permission.description, `${group.name}: ${permission.action}`)}
                            value={permission.id}
                            color='red'
                            size='md'
                            disabled={true}
                            labelClassName="pl-2 text-sm font-medium !text-gray-900"
                            helperClassName="text-gray-500 text-sm mt-3 ms-8"
                            helperText={permission.description}
                        />
                    ))}
                </CheckboxGroup>
            </div>

        </>
    );
}


export function PermissionsGrid({ group, onSelectAll, selectedPermissions, onSelectPermission }: any) {
    const _selectAllChecked = (permissions: Permission[], group: PermissionGroup) => {
        return group.permissions.every((permission: Permission) => selectedPermissions.includes(permission.id));
    };

    return (
        <>
            <div className='grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1'>
                <div key={group.id}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:col-span-full md:grid-cols-3 @4xl:col-span-8 @4xl:gap-5 xl:gap-7">
                    <Checkbox
                        name="app_notification"
                        label={'Seleccionar todos'}
                        value={group.id}
                        size='md'
                        disabled={false}
                        labelClassName="pl-2 text-sm font-medium !text-gray-900"
                        helperClassName="text-gray-500 text-sm mt-3 ms-8"
                        className={'pb-4'}
                        checked={_selectAllChecked(selectedPermissions, group)}
                        onChange={(event) => { onSelectAll(group.permissions.map((item: Permission) => item.id), event.target.checked); }}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:col-span-full md:grid-cols-3 @4xl:col-span-8 @4xl:gap-5 xl:gap-7">
                    {group.permissions.map((permission: Permission) => (
                        <Checkbox
                            key={permission.id.toString()}
                            name={`permission-${permission.id.toString()}`}
                            label={getPermissionsLabel(permission.id.toString(), permission.label, permission.description, `${group.name}: ${permission.action}`)}
                            value={permission.id}
                            size='md'
                            labelClassName="pl-2 text-sm font-medium !text-gray-900"
                            helperClassName="text-gray-500 text-sm mt-3 ms-8"
                            helperText={permission.description}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={(event) => {
                                onSelectPermission(permission.id, event.target.checked);
                            }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}