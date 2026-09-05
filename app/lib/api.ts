import type {
  ApiError,
  ApiSuccess,
  AuthSuccessData,
  LoginBody,
  PublicUser,
  RegisterBody,
} from './types';
import { getToken } from './auth-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL saknas');

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function register(body: RegisterBody): Promise<AuthSuccessData> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await parseJson<ApiSuccess<AuthSuccessData> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Registrering misslyckades');
  }

  return json.data;
}

export async function login(body: LoginBody): Promise<AuthSuccessData> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await parseJson<ApiSuccess<AuthSuccessData> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Inloggning misslyckades');
  }

  return json.data;
}

export async function getCurrentUser(): Promise<PublicUser> {
  const token = getToken();

  if (!token) throw new Error('Ingen token - logga in igen');

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await parseJson<ApiSuccess<PublicUser> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte hämta användare');
  }

  return json.data;
}
