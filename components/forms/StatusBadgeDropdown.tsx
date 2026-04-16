import { Dropdown } from 'rizzui';
import { CustomBadge } from './CustomBadge';

interface StatusBadgeDropdownProps {
    isActive: boolean;
    onToggle: () => void;
    className?: string;
}

export const StatusBadgeDropdown = ({ isActive, onToggle, className }: StatusBadgeDropdownProps) => {
    const statusOptions = [
        { value: 'active', label: 'Activo', color: '#10b981' },
        { value: 'inactive', label: 'Inactivo', color: '#ef4444' }
    ];

    const currentStatus = isActive ? statusOptions[0] : statusOptions[1];

    return (
        <Dropdown placement="bottom-start" className={className}>
            <Dropdown.Trigger className="w-full">
                <div className="cursor-pointer w-full">
                    <CustomBadge 
                        variant="solid" 
                        customColor={currentStatus.color}
                        className="w-full justify-center"
                        rounded="md"
                    >
                        {currentStatus.label}
                    </CustomBadge>
                </div>
            </Dropdown.Trigger>
            <Dropdown.Menu className="min-w-[140px]">
                {statusOptions.map((option) => (
                    <Dropdown.Item 
                        key={option.value}
                        onClick={() => {
                            if ((option.value === 'active') !== isActive) {
                                onToggle();
                            }
                        }}
                        className={`gap-2 ${option.value === currentStatus.value ? 'bg-gray-100 font-medium' : ''}`}
                    >
                        <span 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: option.color }} 
                        />
                        {option.label}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};
