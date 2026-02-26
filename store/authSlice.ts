import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { login } from '../services/authService';
import { AuthState, LoginCredentials } from '../types/auth';

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Local dev-only credential check: accept these credentials without calling API
      if (credentials.email === 'test@gmail.com' && credentials.password === 'test@123!') {
        const localToken = 'local-dev-token-xyz';
        await AsyncStorage.setItem('@auth_token', localToken);
        return localToken;
      }

      const data = await login(credentials);
      await AsyncStorage.setItem('@auth_token', data.token);
      return data.token;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const restoreToken = createAsyncThunk('auth/restoreToken', async () => {
  const token = await AsyncStorage.getItem('@auth_token');
  return token;
});

const initialState: AuthState = {
  token: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.status = 'idle';
      state.error = null;
      AsyncStorage.removeItem('@auth_token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loginAsync
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // restoreToken
      .addCase(restoreToken.fulfilled, (state, action) => {
        state.token = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
