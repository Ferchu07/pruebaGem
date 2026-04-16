import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeviceProfileState {
    selectedView: string;
}

const initialState: DeviceProfileState = {
    selectedView: '/info',
};

const deviceProfileSlice = createSlice({
    name: 'deviceProfile',
    initialState,
    reducers: {
        setSelectedView(state, action: PayloadAction<string>) {
            state.selectedView = action.payload;
        },
    },
});

export const { setSelectedView } = deviceProfileSlice.actions;
export default deviceProfileSlice.reducer;
