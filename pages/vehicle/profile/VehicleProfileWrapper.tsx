import React from 'react';
import { useParams } from 'react-router-dom';
import { FiltersProvider } from '../../../components/providers/FiltersProvider';
import VehicleProfileLayout from './VehicleProfileLayout';

interface VehicleProfileWrapperProps { }

const VehicleProfileWrapper: React.FC<VehicleProfileWrapperProps> = ({ }) => {

    // HOOKS

    const { id = '' } = useParams<{ id: string }>();

    // STATES

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // RENDER

    return (
        <FiltersProvider defaultFilterFilters={{ startDate: startDate, endDate: endDate, vehicleId: id }}>
            <VehicleProfileLayout />
        </FiltersProvider>
    );
};

export default VehicleProfileWrapper;
