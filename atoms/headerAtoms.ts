import { atom } from 'jotai';

export interface HeaderAction {
    show: boolean;
    label?: string | React.ReactNode;
    onClick?: () => void;
    delete?: boolean;
    className?: string;
    icon?: React.ReactNode;
    custom?: boolean;
    newLine?: boolean;
}

export interface HeaderConfig {
    title?: string;
    icon?: React.ReactNode;
    classNameIcon?: string;
    breadcrumbs?: {
        label: string;
        path?: string;
        onClick?: () => void;
        active?: boolean;
    }[];
}

export const headerActionAtom = atom<HeaderAction | HeaderAction[] | null>(null);
export const headerConfigAtom = atom<HeaderConfig | null>(null);
export const headerBottomAtom = atom<React.ReactNode | null>(null);
