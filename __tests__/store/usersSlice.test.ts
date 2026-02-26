import usersReducer, {
    clearError,
    clearSelectedUser,
    deleteUserAsync,
    fetchUsersAsync,
    resetUsers,
    setOffline,
    updateUserAsync
} from '../../store/usersSlice';
import { User } from '../../types/user';

const mockUser: User = {
  id: 1,
  email: 'george.bluth@reqres.in',
  first_name: 'George',
  last_name: 'Bluth',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
};

const initialState = {
  users: [],
  selectedUser: null,
  currentPage: 1,
  totalPages: 1,
  status: 'idle' as const,
  detailStatus: 'idle' as const,
  error: null,
  isOffline: false,
};

describe('usersSlice', () => {
  it('returns initial state', () => {
    expect(usersReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('setOffline updates isOffline', () => {
    const result = usersReducer(initialState, setOffline(true));
    expect(result.isOffline).toBe(true);
  });

  it('clearSelectedUser sets selectedUser to null', () => {
    const state = { ...initialState, selectedUser: mockUser };
    const result = usersReducer(state, clearSelectedUser());
    expect(result.selectedUser).toBeNull();
  });

  it('clearError sets error to null', () => {
    const state = { ...initialState, error: 'Some error' };
    const result = usersReducer(state, clearError());
    expect(result.error).toBeNull();
  });

  it('resetUsers resets list and pagination', () => {
    const state = { ...initialState, users: [mockUser], currentPage: 3 };
    const result = usersReducer(state, resetUsers());
    expect(result.users).toEqual([]);
    expect(result.currentPage).toBe(1);
  });

  it('fetchUsersAsync.pending sets status to loading', () => {
    const result = usersReducer(initialState, { type: fetchUsersAsync.pending.type });
    expect(result.status).toBe('loading');
  });

  it('fetchUsersAsync.fulfilled populates users on page 1', () => {
    const result = usersReducer(initialState, {
      type: fetchUsersAsync.fulfilled.type,
      payload: { data: [mockUser], page: 1, total_pages: 2 },
    });
    expect(result.users).toHaveLength(1);
    expect(result.users[0].first_name).toBe('George');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(2);
  });

  it('fetchUsersAsync.fulfilled appends users on page 2', () => {
    const secondUser: User = { ...mockUser, id: 2, first_name: 'Janet' };
    const stateWithPage1 = { ...initialState, users: [mockUser], currentPage: 1, totalPages: 2 };
    const result = usersReducer(stateWithPage1, {
      type: fetchUsersAsync.fulfilled.type,
      payload: { data: [secondUser], page: 2, total_pages: 2 },
    });
    expect(result.users).toHaveLength(2);
  });

  it('deleteUserAsync.fulfilled removes user by id', () => {
    const state = { ...initialState, users: [mockUser] };
    const result = usersReducer(state, {
      type: deleteUserAsync.fulfilled.type,
      payload: 1,
    });
    expect(result.users).toHaveLength(0);
  });

  it('updateUserAsync.fulfilled updates user in list', () => {
    const state = { ...initialState, users: [mockUser] };
    const result = usersReducer(state, {
      type: updateUserAsync.fulfilled.type,
      payload: { id: 1, first_name: 'George Updated', last_name: 'Bluth' },
    });
    expect(result.users[0].first_name).toBe('George Updated');
  });
});
