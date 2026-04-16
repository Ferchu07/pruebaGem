import { atom, useAtom } from 'jotai';

export enum LAYOUT_OPTIONS {
    HYDROGEN = 'hydrogen',
    HELIUM = 'helium',
    LITHIUM = 'lithium',
    BERYLLIUM = 'beryllium',
    BORON = 'boron',
    CARBON = 'carbon',
}

// 1. set initial atom for isomorphic layout
const isomorphicLayoutAtom = atom(
    typeof window !== 'undefined'
        ? localStorage.getItem('isomorphic-layout')
        : LAYOUT_OPTIONS.HYDROGEN
);

const isomorphicLayoutAtomWithPersistence = atom(
    (get) => get(isomorphicLayoutAtom),
    (get, set, newStorage: any) => {
        set(isomorphicLayoutAtom, newStorage);
        localStorage.setItem('isomorphic-layout', newStorage);
    }
);

// 2. useLayout hook to check which layout is available
export function useLayout() {
    const [layout, setLayout] = useAtom(isomorphicLayoutAtomWithPersistence);
    return {
        layout: layout === null ? LAYOUT_OPTIONS.HYDROGEN : layout,
        setLayout,
    };
}