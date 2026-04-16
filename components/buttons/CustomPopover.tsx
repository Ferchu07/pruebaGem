import { ReactComponent as BorrarIcon } from '../../assets/Iconos/Interfaz/borrar.svg';
import { ReactComponent as VehiculoInactivoIcon } from '../../assets/Iconos/Interfaz/vehiculo_inactivo.svg';
import { ActionIcon, Button, Popover, Text, Title, Tooltip } from 'rizzui';
import cn from '../../utils/classNames';

type CustomPopoverProps = {
    title: string;
    description: string;
    onClick: () => void;
    isButton?: boolean;
    tooltipContent?: string;
    icon?: JSX.Element;
    className?: string;
    actionIconClassName?: string;
    warning?: boolean;
    confirmColor?: "danger" | "primary" | "secondary" | undefined;
};

export default function CustomPopover({
    title,
    description,
    onClick,
    isButton = false,
    tooltipContent,
    icon,
    className,
    actionIconClassName,
    warning = true,
    confirmColor = 'danger',
}: CustomPopoverProps) {
    return (
        <Popover placement="left" overlayClassName={cn('z-[1000]', [className])}>
            <Popover.Trigger>
                {isButton
                    ? (
                        <Button variant={'outline'} color={'secondary'} size={'md'}>
                            {title}
                        </Button>
                    )
                    : (
                        <ActionIcon
                            size="sm"
                            variant="outline"
                            aria-label={'Delete Item'}
                            className={cn([actionIconClassName, "cursor-pointer hover:!border-gray-900 hover:text-gray-700"])}
                        >
                            {tooltipContent
                                ? (
                                    <Tooltip
                                        size="sm"
                                        content={tooltipContent}
                                        placement="top"
                                        color="invert"
                                    >
                                        <div>{icon}</div>
                                    </Tooltip>
                                )
                                : icon
                            }
                        </ActionIcon>
                    )}
            </Popover.Trigger>
            <Popover.Content className="z-[1000]">
                {({ setOpen }) => (
                    <div className="w-56 pb-2 pt-1 text-center rtl:text-right">
                        <Title
                            as="h6"
                            className="mb-0.5 flex justify-center items-center text-sm text-gray-700"
                        >
                            <BorrarIcon className="me-1 h-[17px] w-[17px]" /> {title}
                        </Title>

                        {warning && <div className="flex justify-center">
                            <VehiculoInactivoIcon className="text-yellow-500 w-8 h-8" />
                        </div>}

                        <Text className="mb-2 leading-relaxed text-gray-500">
                            {description}
                        </Text>
                        <div className="flex items-center justify-center">
                            <Button size="sm" variant="outline" className="h-7 me-5" onClick={() => setOpen(false)}>
                                No
                            </Button>
                            <Button size="sm" color={confirmColor} className="ms-1 me-1.5 h-7" onClick={onClick}>
                                Sí
                            </Button>
                        </div>
                    </div>
                )}
            </Popover.Content>
        </Popover>
    );
}