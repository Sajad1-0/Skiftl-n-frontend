import type {
  ApiError,
  ApiSuccess,
  AuthSuccessData,
  CreateJobProfileBody,
  CreateShiftBody,
  LoginBody,
  MonthlySummary,
  PublicUser,
  PublicJobProfile,
  PublicShift,
  RegisterBody,
} from './types';
import { getToken } from './auth-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL saknas');

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  if (!token) throw new Error('Ingen token — logga in igen');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
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
    headers: authHeaders(),
  });

  const json = await parseJson<ApiSuccess<PublicUser> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte hämta användare');
  }

  return json.data;
}

export async function listJobProfiles(): Promise<PublicJobProfile[]> {
  const response = await fetch(`${API_URL}/job-profiles`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const json = await parseJson<ApiSuccess<PublicJobProfile[]> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte hämta jobbProfiler');
  }

  return json.data;
}

export async function createJobProfile(body: CreateJobProfileBody): Promise<PublicJobProfile> {
  const response = await fetch(`${API_URL}/job-profiles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const json = await parseJson<ApiSuccess<PublicJobProfile> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte skapa jobbprofil');
  }

  return json.data;
}

export async function deleteJobProfile(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/job-profiles/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const json = await parseJson<ApiSuccess<null> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte ta bort jobbprofil');
  }
}

export async function listShifts(params?: { from?: string; to?: string }): Promise<PublicShift[]> {
  const search = new URLSearchParams();
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  const qs = search.toString();

  const response = await fetch(`${API_URL}/shifts${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const json = await parseJson<ApiSuccess<PublicShift[]> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte hämta pass');
  }

  return json.data;
}

export async function createShift(body: CreateShiftBody): Promise<PublicShift> {
  const response = await fetch(`${API_URL}/shifts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const json = await parseJson<ApiSuccess<PublicShift> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte skapa passet');
  }

  return json.data;
}

export async function deleteShift(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/shifts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const json = await parseJson<ApiSuccess<null> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte ta bort passet');
  }
}

export async function getMonthlySummary(params: {
  from: string;
  to: string;
  jobProfileId?: string;
}): Promise<MonthlySummary> {
  const search = new URLSearchParams();
  search.set('from', params.from);
  search.set('to', params.to);
  if (params.jobProfileId) search.set('jobProfileId', params.jobProfileId);

  const response = await fetch(`${API_URL}/summaries/monthly?${search}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  const json = await parseJson<ApiSuccess<MonthlySummary> | ApiError>(response);

  if (!response.ok || !json.success) {
    throw new Error(!json.success ? json.message : 'Kunde inte hämta månadssammanfattning');
  }

  return json.data;
}
