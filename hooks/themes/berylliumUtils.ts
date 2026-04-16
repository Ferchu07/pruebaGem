import { atom, useAtom } from 'jotai';

const LOCAL_STORAGE_KEY = 'iso-beryllium-sidebar-left-expanded';

const isomorphicBerylliumSidebarLeftExpandedAtom = atom(
    typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : true
);

const isomorphicBerylliumSidebarLeftExpandedAtomWithPersistence = atom(
    (get) => get(isomorphicBerylliumSidebarLeftExpandedAtom),
    (get, set, newStorage: any) => {
        set(isomorphicBerylliumSidebarLeftExpandedAtom, newStorage);
        localStorage.setItem(LOCAL_STORAGE_KEY, newStorage);
    }
);

export function useBerylliumSidebars() {
    const [expandedLeft, setExpandedLeft] = useAtom(
        isomorphicBerylliumSidebarLeftExpandedAtomWithPersistence
    );

    return {
        expandedLeft: !!(expandedLeft === null
            ? true
            : JSON.parse(expandedLeft as string)),
        setExpandedLeft,
    };
}