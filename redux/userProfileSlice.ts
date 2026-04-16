// src/store/slices/userProfileSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfileState {
    selectedView: string;
    viewMode: 'yearly' | 'monthly' | 'weekly' | 'daily';
}

const initialState: UserProfileState = {
    selectedView: '/info',
    viewMode: 'daily',
};

const userProfileSlice = createSlice({
    name: 'userProfile',
    initialState,
    reducers: {
        setSelectedView(state, action: PayloadAction<string>) {
            state.selectedView = action.payload;
        },
        changeViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
    },
});

export const { setSelectedView, changeViewMode } = userProfileSlice.actions;
export default userProfileSlice.reducer;