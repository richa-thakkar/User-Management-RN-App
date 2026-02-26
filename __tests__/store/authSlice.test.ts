import authReducer, { clearError, loginAsync, logout } from '../../store/authSlice';
import { AuthState } from '../../types/auth';

const initialState: AuthState = {
  token: null,
  status: 'idle',
  error: null,
};

describe('authSlice', () => {
  it('should return initial state', () => {
    expect(authReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('logout clears token and resets state', () => {
    const loggedInState: AuthState = {
      token: 'test-token-123',
      status: 'succeeded',
      error: null,
    };
    const result = authReducer(loggedInState, logout());
    expect(result.token).toBeNull();
    expect(result.status).toBe('idle');
    expect(result.error).toBeNull();
  });

  it('clearError sets error to null', () => {
    const errorState: AuthState = { token: null, status: 'failed', error: 'Invalid credentials' };
    const result = authReducer(errorState, clearError());
    expect(result.error).toBeNull();
  });

  it('loginAsync.pending sets status to loading', () => {
    const result = authReducer(initialState, { type: loginAsync.pending.type });
    expect(result.status).toBe('loading');
    expect(result.error).toBeNull();
  });

  it('loginAsync.fulfilled sets token', () => {
    const result = authReducer(initialState, {
      type: loginAsync.fulfilled.type,
      payload: 'QpwL5tpe83ilfN2',
    });
    expect(result.status).toBe('succeeded');
    expect(result.token).toBe('QpwL5tpe83ilfN2');
  });

  it('loginAsync.rejected sets error', () => {
    const result = authReducer(initialState, {
      type: loginAsync.rejected.type,
      payload: 'user not found',
    });
    expect(result.status).toBe('failed');
    expect(result.error).toBe('user not found');
  });
});
