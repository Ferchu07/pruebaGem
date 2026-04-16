import { configureStore } from '@reduxjs/toolkit';
import { debounce } from "../helpers/helpers";
import authReducer from './authSlice';
import { loadState, saveState } from './browser-storage';
import settingsSlice from './settingsSlice';
import tableReducer from './tableSlice';
import userProfileSlice from './userProfileSlice';
import deviceProfileSlice from './deviceProfileSlice';
import vehicleProfileSlice from './vehicleProfileSlice';

const store = configureStore({
  reducer: {
    //@ts-ignore
    auth: authReducer,
    table: tableReducer,
    settings: settingsSlice,
    userProfile: userProfileSlice,
    deviceProfile: deviceProfileSlice,
    vehicleProfile: vehicleProfileSlice,
  },
  preloadedState: loadState(),
});

// here we subscribe to the store changes
store.subscribe(
  // we use debounce to save the state once each 800ms
  // for better performances in case multiple changes occur in a short time
  debounce(() => {
    saveState(store.getState());
  }, 800));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;