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

export interface PublicShift {
  id: string;
  userId: string;
  jobProfileId: string;
  startAt: string;
  endAt: string;
  breakMinutes: number;
  notes: string | null;
  createdAt: string;
  workedMinutes: number;
  grossOre: number;
}

export interface CreateShiftBody {
  jobProfileId: string;
  startAt: string;
  endAt: string;
  breakMinutes?: number;
  notes?: string;
}

export interface ProfileBreakDown {
  jobProfileId: string;
  name: string;
  taxRate: number;
  shiftCount: number;
  workedMinutes: number;
  breakMinutes: number;
  grossOre: number;
  netOre: number;
}

export interface MonthlySummary {
  from: string;
  to: string;
  shiftCount: number;
  workedMinutes: number;
  breakMinutes: number;
  grossOre: number;
  netOre: number;
  goalOre: number | null;
  goalProgressPercent: number;
  byJobProfile: ProfileBreakDown[];
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
