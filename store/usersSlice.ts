import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from '../services/userService';
import { User, UserForm } from '../types/user';

const CACHE_KEY = '@users_cache';

interface UsersState {
  users: User[];
  selectedUser: User | null;
  currentPage: number;
  totalPages: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isOffline: boolean;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  currentPage: 1,
  totalPages: 1,
  status: 'idle',
  detailStatus: 'idle',
  error: null,
  isOffline: false,
};

// Fetch paginated users list
export const fetchUsersAsync = createAsyncThunk(
  'users/fetchUsers',
  async (page: number, { rejectWithValue }) => {
    try {
      const data = await getUsers(page);
      // Cache users to AsyncStorage
      if (page === 1) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data.data));
      }
      return data;
    } catch (error: any) {
      // Try offline cache on first page
      if (page === 1) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          return { data: JSON.parse(cached), page: 1, total_pages: 1, total: 0, per_page: 6, fromCache: true };
        }
      }
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single user detail
export const fetchUserByIdAsync = createAsyncThunk(
  'users/fetchUserById',
  async (id: number | string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UsersState };
      const localUser = state.users.users.find((u) => String(u.id) === String(id));

      try {
        const data = await getUserById(Number(id));
        // If we picked an avatar locally (bonus feature), merge it back into the fetched user
        if (localUser && localUser.avatar && localUser.avatar.startsWith('file')) {
            data.avatar = localUser.avatar;
        }
        return data;
      } catch (apiError) {
        // reqres.in mock API does not store newly POSTed users.
        // If the API returns a 404, but we have the user in our local slice state, return the local copy!
        if (localUser) {
          return localUser;
        }
        throw apiError;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create user
export const createUserAsync = createAsyncThunk(
  'users/createUser',
  async (userData: UserForm, { rejectWithValue }) => {
    try {
      const data = await createUser(userData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user
export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string | number; userData: Partial<UserForm> }, { rejectWithValue }) => {
    try {
      const data = await updateUser(id, userData);
      return { id, ...data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete user
export const deleteUserAsync = createAsyncThunk(
  'users/deleteUser',
  async (id: string | number, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Load users from cache (for offline startup)
export const loadCachedUsersAsync = createAsyncThunk(
  'users/loadCached',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached) as User[];
      return rejectWithValue('No cache');
    } catch {
      return rejectWithValue('Cache read failed');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUsers: (state) => {
      state.users = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsersAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { data, page, total_pages } = action.payload as any;
        if (page === 1) {
          state.users = data;
        } else {
          // Append results for pagination
          const existingIds = new Set(state.users.map((u) => u.id));
          const newUsers = data.filter((u: User) => !existingIds.has(u.id));
          state.users = [...state.users, ...newUsers];
        }
        state.currentPage = page;
        state.totalPages = total_pages;
        if ((action.payload as any).fromCache) {
          state.isOffline = true;
        }
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchUserById
      .addCase(fetchUserByIdAsync.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchUserByIdAsync.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserByIdAsync.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload as string;
      })
      // createUser — optimistic add with generated id
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.users = [action.payload, ...state.users];
      })
      // updateUser
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            first_name: action.payload.first_name || state.users[index].first_name,
            last_name: action.payload.last_name || state.users[index].last_name,
            email: action.payload.email || state.users[index].email,
            avatar: action.payload.avatar || state.users[index].avatar,
          };
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = { ...state.selectedUser, ...action.payload };
        }
      })
      // deleteUser
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      // loadCachedUsers
      .addCase(loadCachedUsersAsync.fulfilled, (state, action) => {
        state.users = action.payload;
        state.isOffline = true;
      });
  },
});

export const { setOffline, clearSelectedUser, clearError, resetUsers } = usersSlice.actions;
export default usersSlice.reducer;
