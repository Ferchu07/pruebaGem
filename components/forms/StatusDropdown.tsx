import moment from 'moment';
import React, { useState } from 'react';
import { Dropdown, Modal, Textarea, Tooltip } from 'rizzui';
import { ReactComponent as FlechaIcon } from '../../assets/Iconos/Interfaz/flecha.svg';
import { StateOption, StateOptions } from '../../type/entities/state-type';
import cn from '../../utils/classNames';
import { CustomBadge } from './CustomBadge';

interface StatusDropdownProps {
    entityId: string;
    currentState: any;
    currentStateDate?: string;
    statesOptions: StateOptions;
    title: string;
    fullWidth?: boolean;
    dropdownClassName?: string;
    disabled?: boolean;
    badgeSize?: "sm" | "md" | "lg" | "xl" | undefined;
    badgeRounded?: "none" | "sm" | "md" | "lg" | "pill" | undefined;
    modalSize?: 'sm' | 'md' | 'lg' | 'full';
    cancelBtnText?: string;
    confirmBtnText?: string;
    handleStateChange: (invoiceId: string, newStateId: string, comment: string) => void;
    hasComments?: boolean;
    inputClassName?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
    title,
    statesOptions = [],
    entityId,
    currentState,
    currentStateDate,
    dropdownClassName,
    disabled = false,
    badgeSize = 'lg',
    badgeRounded = 'md',
    modalSize = 'md',
    cancelBtnText = 'Cancelar',
    confirmBtnText = 'Confirmar',
    handleStateChange,
    hasComments = true,
    fullWidth = false,
    inputClassName,
}) => {

    // STATES

    const [showModal, setShowModal] = useState(false);
    const [selectedState, setSelectedState] = useState<StateOption | null>(statesOptions.find((state) => state.value === currentState?.id) || null);

    // ---------------------------------------------------
    // DROPDOWN MENU ACTIONS
    // ---------------------------------------------------
    const handleStateSelect = (state: StateOption) => {
        setSelectedState(state);
        setShowModal(true);
    };

    // ---------------------------------------------------
    // MODAL MENU ACTIONS
    // ---------------------------------------------------

    const handleConfirm = () => {
        const textareaValue = document.getElementById('comments') as HTMLInputElement;;
        setShowModal(false);
        if (selectedState) {
            handleStateChange(entityId, selectedState.value, textareaValue?.value || '');
        }
    };

    const handleCancel = () => {
        setSelectedState(statesOptions.find((state) => state.value === currentState.id) || null);
        setShowModal(false);
    };

    // RENDER

    return (
        <>
            <Dropdown placement="bottom-end" className={cn(fullWidth ? 'flex align-middle' : 'w-[120px] flex align-middle', dropdownClassName)} key={entityId}>
                <Dropdown.Trigger className='w-full'>
                    <CustomBadge
                        className={cn('w-full p-0', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
                        rounded={badgeRounded}
                        size={badgeSize}
                        customColor={selectedState?.color || currentState?.color || '#FFF000'}
                    >
                        <Tooltip
                            content={selectedState?.label || currentState?.name || 'Seleccionar Estado'}
                            placement="top"
                        >
                            <div className={cn('flex flex-row justify-center items-center text-nowrap leading-relaxed m-1 gap-2', inputClassName)}>
                                {(selectedState?.icon || currentState?.icon) && (
                                    <div className="flex items-center justify-center">
                                        {React.createElement(selectedState?.icon || currentState?.icon, { className: "h-6 w-6" })}
                                    </div>
                                )}
                                {/* Always show label if no icon, or if user wants both (uncomment next line to show both) */}
                                {/* <span>{selectedState?.label || currentState?.name || 'Seleccionar Estado'}</span> */}
                                {!(selectedState?.icon || currentState?.icon) && (
                                    <>
                                        {selectedState?.label || currentState?.name || 'Seleccionar Estado'} <br />
                                        {currentStateDate && (moment(currentStateDate).format('DD/MM/YY HH:mm'))}
                                    </>
                                )}
                            </div>
                        </Tooltip>
                    </CustomBadge>
                </Dropdown.Trigger>
                {!disabled && (
                    <Dropdown.Menu className="max-h-80 md:max-h-50 w-auto overflow-auto shadow-xl">
                        {statesOptions && statesOptions.length >= 1 && statesOptions.map((state) => {
                            // Filter out the current state from the dropdown options
                            if (state.value === currentState?.id) return null;
                            return (
                                <Dropdown.Item key={state.value} onClick={() => handleStateSelect(state)} className='w-full' >
                                    <CustomBadge className="cursor-pointer w-full" rounded={badgeRounded} size={badgeSize || 'lg'} customColor={state.color || '#FFF000'} >
                                        <div className="flex flex-row items-center gap-2 mx-auto">
                                            {state.icon && React.createElement(state.icon, { className: "h-5 w-5" })}
                                            <span>{state.label}</span>
                                        </div>
                                    </CustomBadge>
                                </Dropdown.Item>
                            )
                        })}
                        {(!statesOptions || statesOptions.length === 0) && (
                            <div className='px-4 py-2'>Sin resultados...</div>
                        )}
                    </Dropdown.Menu>
                )}
            </Dropdown>

            {showModal && (
                <Modal isOpen={showModal} onClose={() => { }} size={modalSize}>
                    <div className='flex flex-col justify-center p-2 pt-4'>
                        <h4 className="text-2xl text-center">{title || '¿Estás seguro de cambiar el estado?'}</h4>
                    </div>
                    <div className='flex flex-col gap-3 my-3'>
                        <CustomBadge
                            className="cursor-pointer m-auto"
                            rounded={badgeRounded}
                            size={badgeSize}
                            customColor={currentState?.color || '#FFF000'}
                        >
                            <div className="flex flex-row items-center gap-2">
                                {currentState?.icon && (
                                    <div className="flex items-center justify-center">
                                        {React.createElement(currentState.icon, { className: "h-6 w-6" })}
                                    </div>
                                )}
                                <span>{currentState?.name || currentState?.label || 'Seleccionar Estado'}</span>
                            </div>
                        </CustomBadge>
                        <FlechaIcon className="text-md text-black m-auto w-8 h-8" />
                        <CustomBadge
                            className="cursor-pointer m-auto"
                            rounded={badgeRounded}
                            size={badgeSize}
                            customColor={selectedState?.color || '#FFF000'}
                        >
                            <div className="flex flex-row items-center gap-2">
                                {selectedState?.icon && (
                                    <div className="flex items-center justify-center">
                                        {React.createElement(selectedState.icon, { className: "h-6 w-6" })}
                                    </div>
                                )}
                                <span>{selectedState?.label || 'Seleccionar Estado'}</span>
                            </div>
                        </CustomBadge>
                    </div>
                    {hasComments && (
                        <Textarea
                            id="comments"
                            label="Comentario"
                            placeholder="Escribe un comentario"
                            rows={3}
                            className="col-span-1 md:col-span-2 [&>label>span]:font-medium p-4"
                        />
                    )}

                    <div className="flex justify-center p-3 gap-4">
                        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-300" onClick={handleConfirm}>
                            {confirmBtnText}
                        </button>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600" onClick={handleCancel}>
                            {cancelBtnText}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default StatusDropdown;