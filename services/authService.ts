import { LoginCredentials, LoginResponse } from '../types/auth';
import api from './api';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', credentials);
  return response.data;
};
