import { ReactComponent as BorrarIcon } from '../../assets/Iconos/Interfaz/borrar.svg';
import { ReactComponent as VehiculoInactivoIcon } from '../../assets/Iconos/Interfaz/vehiculo_inactivo.svg';
import { Button, Popover, Text, Title } from 'rizzui';
import cn from '../../utils/classNames';

type ButtonPopoverProps = {
    title: string;
    description?: string;
    onClick: () => void;
    variant?: "outline" | "solid" | "flat" | "text" | undefined;
    color?: "danger" | "primary" | "secondary" | undefined;
    icon?: JSX.Element;
    className?: string;
    btnClassName?: string;
    mobileView?: boolean;
};

export default function ButtonPopover({
    title,
    description,
    onClick,
    variant = 'solid',
    color = 'danger',
    icon = <BorrarIcon className="w-4 h-4" />,
    className,
    btnClassName = "px-2 w-full gap-2",
    mobileView,
}: ButtonPopoverProps) {
    return (
        <Popover placement="left" overlayClassName={cn('z-[1000] ', [className])}>
            <Popover.Trigger>
                <Button
                    className={btnClassName}
                    color={color}
                    variant={variant}
                    size="sm"
                >
                    {mobileView ? icon : <Text className="text-sm flex items-center"><span className="me-1">Eliminar</span> {icon}</Text>}
                </Button>
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

                        <Text className={cn("my-3 leading-relaxed text-gray-500")}>
                            {description}
                        </Text>

                        <div className="flex items-center justify-center">
                            <Button size="sm" variant="outline" className="h-7 me-5" onClick={() => setOpen(false)}>
                                No
                            </Button>
                            <Button size="sm" color='danger' className="ms-1 me-1.5 h-7" onClick={onClick}>
                                Sí
                            </Button>
                        </div>
                    </div>
                )}
            </Popover.Content>
        </Popover>
    );
}