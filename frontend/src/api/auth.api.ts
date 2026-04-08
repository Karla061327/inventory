import api from './axios';
import type { LoginRequest, LoginResponse, ProfileResponse } from '@/types';

export async function login(dto: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', dto);
  return data;
}

export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>('/auth/profile');
  return data;
}
