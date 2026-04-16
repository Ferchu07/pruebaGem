import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  token: string;
  name: string;
  lastName: string;
  email: string;
  roles: string[];
  profileImage: string;
  companyName?: string | null;
  companyId?: string;
  companyCif?: string;
  roleId?: string;
  user_id?: string;
  companies?: string[];
  provisional_code?: string;
  multiCompany?: boolean; // Added to handle multi-company users
}

export interface UserGrantAccess {
  user_id: string;
  companies: string[];
  provisional_code: string;
  companyId: string;
  companyCif?: string;
  roles: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  hasToken: boolean;
  user: User | UserGrantAccess | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  isAuthenticated: false,
  hasToken: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state: AuthState, action: PayloadAction<AuthState>) => {
      state = {
        ...action.payload
      }
      return state;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.hasToken = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      return state;
    },
  }
});

export const loginThunk = createAsyncThunk('user/login', async (userData: any, { dispatch }) => {
  dispatch(login(userData));
});

export const logoutThunk = createAsyncThunk('user/logout', async (_, { dispatch }) => {
  dispatch(logout());
});

export const { logout, login } = authSlice.actions;

export default authSlice.reducer;