import { ActionIcon, Button, Popover, Text, Title } from 'rizzui';
import cn from '../../utils/classNames';
import { ReactComponent as DeleteIcon } from '../../assets/Iconos/Interfaz/borrar.svg';

type DeletePopoverProps = {
    title: string;
    description: string;
    onDelete: () => void;
    size?: string | number;
    className?: string;
    actionIconClassName?: string;
    Icon?: React.ReactNode;
    placement?: 'top' | 'right' | 'bottom' | 'left';
};

export default function DeletePopover({
    title,
    description,
    onDelete,
    size = "sm",
    className,
    actionIconClassName,
    Icon,
    placement = 'left'
}: DeletePopoverProps) {
    return (
        <Popover placement={placement} overlayClassName={cn('z-[1000] ',[className])}>
            <Popover.Trigger>
                <ActionIcon
                    size={size as any}
                    variant="outline"
                    aria-label={'Delete Item'}
                    className={cn([actionIconClassName, "cursor-pointer hover:!border-gray-900 hover:text-gray-700"])}
                >
                    {Icon ?? <DeleteIcon className={size === 'sm' ? "h-4 w-4" : "h-5 w-5"} />}
                </ActionIcon>
            </Popover.Trigger>
            <Popover.Content className="z-[1000]">
                {({ setOpen }) => (
                    <div className="w-56 pb-2 pt-1 text-center rtl:text-right">
                        <Title
                            as="h6"
                            className="mb-0.5 flex justify-center items-center text-sm text-gray-700"
                        >
                            <DeleteIcon className="me-1 h-[17px] w-[17px]" /> {title}
                        </Title>
                        
                        <Text className="mb-2 leading-relaxed text-gray-500">
                            {description}
                        </Text>
                        <div className="flex items-center justify-center">
                            <Button size="sm" variant="outline" className="h-7 me-5" onClick={() => setOpen(false)}>
                                No
                            </Button>
                            <Button size="sm" color='danger' className="ms-1 me-1.5 h-7" onClick={onDelete}>
                                Sí
                            </Button>
                        </div>
                    </div>
                )}
            </Popover.Content>
        </Popover>
    );
}