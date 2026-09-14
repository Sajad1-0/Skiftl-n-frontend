export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  isPremium: boolean;
  monthlySalaryGoal: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicJobProfile {
  id: string;
  userId: string;
  name: string;
  hourlyWage: number; // Öre
  taxRate: number;
  employerName: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface CreateJobProfileBody {
  name: string;
  hourlyWage: number;
  taxRate: number;
  employerName?: string;
  isPrimary?: boolean;
}

export interface AuthSuccessData {
  token: string;
  user: PublicUser;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface RegisterBody {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}
