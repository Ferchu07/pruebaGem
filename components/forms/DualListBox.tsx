import React, { useState, useMemo } from 'react';
import { ReactComponent as BuscarIcon } from '../../assets/Iconos/Interfaz/buscar.svg';
import { ReactComponent as FlechaIcon } from '../../assets/Iconos/Interfaz/flecha.svg';

export interface DualListOption {
    value: string;
    label: string;
    [key: string]: any;
}

interface DualListBoxProps {
    options: DualListOption[]; // The pool of valid options available to select from
    selected: DualListOption[]; // The currently selected options
    onChange: (newSelected: DualListOption[]) => void;
    titleLeft?: string;
    titleRight?: string;
    className?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

const DualListBox: React.FC<DualListBoxProps> = ({
    options,
    selected,
    onChange,
    titleLeft = "Disponibles",
    titleRight = "Seleccionados",
    className = "",
    isLoading = false,
    disabled = false
}) => {
    const [searchLeft, setSearchLeft] = useState("");
    const [searchRight, setSearchRight] = useState("");
    
    // Track temporary selections within the lists (for highlighting before moving)
    const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
    const [selectedRight, setSelectedRight] = useState<string[]>([]);

    // Filter available options (Left side): Options in 'options' that are NOT in 'selected'
    const availableOptions = useMemo(() => {
        const selectedValues = new Set(selected.map(s => s.value));
        return options.filter(o => !selectedValues.has(o.value));
    }, [options, selected]);

    // Filtered by search
    const filteredLeft = useMemo(() => {
        if (!searchLeft) return availableOptions;
        return availableOptions.filter(o => o.label.toLowerCase().includes(searchLeft.toLowerCase()));
    }, [availableOptions, searchLeft]);

    const filteredRight = useMemo(() => {
        if (!searchRight) return selected;
        return selected.filter(o => o.label.toLowerCase().includes(searchRight.toLowerCase()));
    }, [selected, searchRight]);

    // Handlers
    const handleMoveRight = () => {
        const itemsToMove = availableOptions.filter(o => selectedLeft.includes(o.value));
        if (itemsToMove.length === 0) return;
        onChange([...selected, ...itemsToMove]);
        setSelectedLeft([]); // Clear highlight
    };

    const handleMoveAllRight = () => {
        if (filteredLeft.length === 0) return;
        // Move all currently visible (filtered) items
        onChange([...selected, ...filteredLeft]);
        setSelectedLeft([]);
    };

    const handleMoveLeft = () => {
        const valuesToRemove = new Set(selectedRight);
        if (valuesToRemove.size === 0) return;
        onChange(selected.filter(o => !valuesToRemove.has(o.value)));
        setSelectedRight([]); // Clear highlight
    };

    const handleMoveAllLeft = () => {
        if (filteredRight.length === 0) return;
        const valuesToRemove = new Set(filteredRight.map(o => o.value));
        onChange(selected.filter(o => !valuesToRemove.has(o.value)));
        setSelectedRight([]);
    };

    const toggleSelectionLeft = (value: string) => {
        setSelectedLeft(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const toggleSelectionRight = (value: string) => {
        setSelectedRight(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    return (
        <div className={`grid grid-cols-[1fr,auto,1fr] gap-4 items-center ${className}`}>
            {/* LEFT PANEL */}
            <div className="flex flex-col h-80 border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50 px-3 py-2 border-b font-medium text-sm text-gray-700">
                    {titleLeft} <span className="text-gray-400 text-xs">({filteredLeft.length})</span>
                </div>
                <div className="p-2 border-b bg-white">
                    <div className="relative">
                        <BuscarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="w-full pl-8 pr-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            value={searchLeft}
                            onChange={(e) => setSearchLeft(e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        <div className="text-center text-gray-400 py-4 text-sm">Cargando...</div>
                    ) : filteredLeft.length === 0 ? (
                        <div className="text-center text-gray-400 py-4 text-sm">No hay opciones</div>
                    ) : (
                        filteredLeft.map(option => (
                            <div 
                                key={option.value}
                                onClick={() => !disabled && toggleSelectionLeft(option.value)}
                                className={`px-3 py-1.5 text-sm rounded cursor-pointer select-none transition-colors ${
                                    selectedLeft.includes(option.value) 
                                        ? 'bg-primary text-white' 
                                        : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                {option.label}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col gap-2">
                <button 
                    onClick={handleMoveAllRight}
                    disabled={disabled || filteredLeft.length === 0}
                    className="p-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 flex justify-center items-center"
                    title="Mover todos"
                >
                    <div className="flex items-center">
                        <FlechaIcon className="w-4 h-4 -rotate-90 -mr-2" />
                        <FlechaIcon className="w-4 h-4 -rotate-90" />
                    </div>
                </button>
                <button 
                    onClick={handleMoveRight}
                    disabled={disabled || selectedLeft.length === 0}
                    className="p-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 flex justify-center items-center"
                    title="Mover seleccionados"
                >
                    <FlechaIcon className="w-4 h-4 -rotate-90" />
                </button>
                <button 
                    onClick={handleMoveLeft}
                    disabled={disabled || selectedRight.length === 0}
                    className="p-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 flex justify-center items-center"
                    title="Quitar seleccionados"
                >
                    <FlechaIcon className="w-4 h-4 rotate-90" />
                </button>
                <button 
                    onClick={handleMoveAllLeft}
                    disabled={disabled || filteredRight.length === 0}
                    className="p-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 flex justify-center items-center"
                    title="Quitar todos"
                >
                    <div className="flex items-center">
                        <FlechaIcon className="w-4 h-4 rotate-90 -mr-2" />
                        <FlechaIcon className="w-4 h-4 rotate-90" />
                    </div>
                </button>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex flex-col h-80 border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50 px-3 py-2 border-b font-medium text-sm text-gray-700">
                    {titleRight} <span className="text-gray-400 text-xs">({filteredRight.length})</span>
                </div>
                <div className="p-2 border-b bg-white">
                    <div className="relative">
                        <BuscarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="w-full pl-8 pr-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            value={searchRight}
                            onChange={(e) => setSearchRight(e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredRight.length === 0 ? (
                        <div className="text-center text-gray-400 py-4 text-sm">Nada seleccionado</div>
                    ) : (
                        filteredRight.map(option => (
                            <div 
                                key={option.value}
                                onClick={() => !disabled && toggleSelectionRight(option.value)}
                                className={`px-3 py-1.5 text-sm rounded cursor-pointer select-none transition-colors ${
                                    selectedRight.includes(option.value) 
                                        ? 'bg-red-500 text-white' 
                                        : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                {option.label}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DualListBox;
