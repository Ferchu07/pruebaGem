import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    selectedView: string;
    selectedTab: string;
}

const initialState: SettingsState = {
    selectedView: 'month',
    selectedTab: 'contracts',
};

const settingsSlice = createSlice({
name: 'settings',
    initialState,
    reducers: {
        setSelectedView(state, action: PayloadAction<string>) {
            state.selectedView = action.payload;
        },
        setSelectedTab(state, action: PayloadAction<string>) {
            state.selectedTab = action.payload;
        }
    },
});

export const { setSelectedView, setSelectedTab } = settingsSlice.actions;
export default settingsSlice.reducer;