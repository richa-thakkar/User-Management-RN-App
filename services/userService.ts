import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  PaginatedUsersResponse,
  User,
  UserForm
} from '../types/user';

export const getUsers = async (page: number): Promise<PaginatedUsersResponse> => {
  const resp = await axios.get(`https://randomuser.me/api/?results=10&page=${page}&seed=myapp`);
  const apiData = resp.data.results.map((r: any) => ({
    id: r.login.uuid,
    first_name: r.name.first,
    last_name: r.name.last,
    email: r.email,
    avatar: r.picture.large,
  }));

  const createdStr = await AsyncStorage.getItem('@created_users');
  const deletedStr = await AsyncStorage.getItem('@deleted_users');
  const editedStr = await AsyncStorage.getItem('@edited_users');

  const created = createdStr ? JSON.parse(createdStr) : [];
  const deleted = deletedStr ? JSON.parse(deletedStr) : [];
  const edited = editedStr ? JSON.parse(editedStr) : {};

  // Apply edits
  let finalData = apiData.map((u: User) => edited[u.id] ? edited[u.id] : u);
  
  // Filter deleted
  finalData = finalData.filter((u: User) => !deleted.includes(u.id));

  // Prepend created on page 1
  if (page === 1) {
    finalData = [...created, ...finalData];
  }

  return {
    page,
    per_page: 10,
    total: 50,
    total_pages: 5,
    data: finalData,
  };
};

export const getUserById = async (id: string | number): Promise<User> => {
  // Mock API fallback allows the store slicing to pick up the user locally
  throw new Error('Fallback to local store');
};

export const createUser = async (userData: UserForm): Promise<any> => {
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}&background=random`
  };
  
  const createdStr = await AsyncStorage.getItem('@created_users');
  const created = createdStr ? JSON.parse(createdStr) : [];
  created.unshift(newUser);
  await AsyncStorage.setItem('@created_users', JSON.stringify(created));
  
  return newUser;
};

export const updateUser = async (id: string | number, userData: Partial<UserForm>): Promise<any> => {
  const updatedData = { ...userData };
  
  const createdStr = await AsyncStorage.getItem('@created_users');
  let created = createdStr ? JSON.parse(createdStr) : [];
  const cIdx = created.findIndex((u: User) => String(u.id) === String(id));
  if (cIdx >= 0) {
    created[cIdx] = { ...created[cIdx], ...updatedData };
    await AsyncStorage.setItem('@created_users', JSON.stringify(created));
  } else {
    const editedStr = await AsyncStorage.getItem('@edited_users');
    const edited = editedStr ? JSON.parse(editedStr) : {};
    edited[id] = { ...edited[id], ...updatedData };
    await AsyncStorage.setItem('@edited_users', JSON.stringify(edited));
  }

  return updatedData;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const deletedStr = await AsyncStorage.getItem('@deleted_users');
  const deleted = deletedStr ? JSON.parse(deletedStr) : [];
  if (!deleted.includes(id)) deleted.push(id);
  await AsyncStorage.setItem('@deleted_users', JSON.stringify(deleted));

  const createdStr = await AsyncStorage.getItem('@created_users');
  let created = createdStr ? JSON.parse(createdStr) : [];
  created = created.filter((u: User) => String(u.id) !== String(id));
  await AsyncStorage.setItem('@created_users', JSON.stringify(created));
};
