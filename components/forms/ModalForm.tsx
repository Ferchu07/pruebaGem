import React from 'react';
import { ActionIcon, Modal, Text } from 'rizzui';
import { ReactComponent as CloseIcon } from '../../assets/Iconos/Interfaz/close_02.svg';

interface ModalFormProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const ModalForm: React.FC<ModalFormProps> = ({ isOpen, title, children, onClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size='sm'
            overlayClassName='backdrop-blur'
            containerClassName='!max-w-xl !shadow-xl'
            className='z-[999] [&_.pointer-events-none]:overflow-visible'
        >
            <div className='m-auto px-7 pt-6'>
                <div className='mb-7 flex items-center justify-between'>
                    <Text className="text-xl">{title}</Text>
                    <ActionIcon size='sm' variant='text' onClick={onClose}>
                        <CloseIcon className='h-auto w-6' />
                    </ActionIcon>
                </div>

                {children}
            </div>
        </Modal>
    );
};

export default ModalForm;