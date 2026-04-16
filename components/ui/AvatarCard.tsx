import { Link } from 'react-router-dom';
import { Avatar, AvatarProps, Text } from 'rizzui';
import cn from '../../utils/classNames';

interface AvatarCardProps {
    src: string;
    name: string;
    className?: string;
    description?: string;
    avatarProps?: AvatarProps;
    hideText?: boolean;
    link?: string;
}

export default function AvatarCard({
    src,
    name,
    className,
    description,
    avatarProps,
    hideText = false,
    link,
}: AvatarCardProps) {
    return (
        <figure className={cn('flex items-center gap-3', className)}>
            <Avatar name={name} src={src} rounded='sm' {...avatarProps} />
            <figcaption className="grid gap-0.5">
                {!hideText && !link && (
                    <Text className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700">
                        {name}
                    </Text>
                )}
                {!hideText && link && (
                    <Link to={link}>
                        <Text className='font-bold text-primary'>{name}</Text>
                    </Link>
                )}
                {description && !hideText && (
                    <Text className="text-[13px] text-gray-500">{description}</Text>
                )}
            </figcaption>
        </figure>
    );
}