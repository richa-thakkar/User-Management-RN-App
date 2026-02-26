export interface User {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface UserForm {
  first_name: string;
  last_name: string;
  email: string;
  job: string;
  avatar?: string;
}

export interface PaginatedUsersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
}

export interface CreateUserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  job: string;
  avatar?: string;
  createdAt: string;
}

export interface UpdateUserResponse {
  first_name: string;
  last_name: string;
  email: string;
  job: string;
  avatar?: string;
  updatedAt: string;
}
