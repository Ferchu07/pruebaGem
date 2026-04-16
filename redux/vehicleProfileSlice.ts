import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VehicleProfileState {
    selectedView: string;
    reloadMetrics: boolean;
}

const initialState: VehicleProfileState = {
    selectedView: '/info',
    reloadMetrics: true,
};

const vehicleProfileSlice = createSlice({
    name: 'vehicleProfile',
    initialState,
    reducers: {
        setSelectedView(state, action: PayloadAction<string>) {
            state.selectedView = action.payload;
        },
        setReloadMetrics(state, action: PayloadAction<boolean>) {
            state.reloadMetrics = action.payload;
        },
    },
});

export const { setSelectedView, setReloadMetrics } = vehicleProfileSlice.actions;
export default vehicleProfileSlice.reducer;