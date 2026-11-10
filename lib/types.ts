export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  isPremium: boolean;
  /** True om Stripe-kund finns — då kan portal öppnas. */
  hasStripeCustomer: boolean;
  monthlySalaryGoal: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicAgreement {
  id: string;
  code: string;
  name: string;
  description: string | null;
}
export interface PublicJobProfile {
  id: string;
  userId: string;
  name: string;
  hourlyWage: number; // Öre
  taxRate: number;
  employerName: string | null;
  isPrimary: boolean;
  collectiveAgreementId: string | null;
  archivedAt: string | null;
  createdAt: string;
}

export interface CreateJobProfileBody {
  name: string;
  hourlyWage: number;
  taxRate: number;
  employerName?: string;
  isPrimary?: boolean;
  collectiveAgreementId?: string | null;
}
export interface UpdateJobProfileBody {
  name?: string;
  hourlyWage?: number;
  taxRate?: number;
  employerName?: string | null;
  isPrimary?: boolean;
  collectiveAgreementId?: string | null;
}

export interface BreakIntervalsDto {
  startAt: string;
  endAt: string;
}
export interface PublicShift {
  id: string;
  userId: string;
  jobProfileId: string;
  startAt: string;
  endAt: string;
  breakMinutes: number;
  breakIntervals?: BreakIntervalsDto[];
  notes: string | null;
  createdAt: string;
  workedMinutes: number;
  baseOre: number;
  obOre: number;
  grossOre: number;
  agreementVersionId: string | null;
  estimatedNetOre: number | null;
}

export interface CreateShiftBody {
  jobProfileId: string;
  startAt: string;
  endAt: string;
  breakMinutes?: number;
  breakIntervals?: BreakIntervalsDto[];
  notes?: string;
}

export interface UpdateShiftBody {
  jobProfileId?: string;
  startAt?: string;
  endAt?: string;
  breakMinutes?: number;
  breakIntervals?: BreakIntervalsDto[];
  notes?: string | null;
}

export interface BulkCreateShiftsBody {
  jobProfileId: string;
  shifts: Array<{
    startAt: string;
    endAt: string;
    breakMinutes?: number;
    breakIntervals?: BreakIntervalsDto[];
    notes?: string;
  }>;
}

export interface SickDayBreakdown {
  date: string;
  isKarendag: boolean;
  workedMinutes: number;
  sickPayOre: number;
}

export interface PublicSickLeave {
  id: string;
  userId: string;
  jobProfileId: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  createdAt: string;
  karensdag: string | null;
  totalSickPayOre: number;
  totalWorkedMinutes: number;
  days: SickDayBreakdown[];
}

export interface CreateSickLeaveBody {
  jobProfileId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface SickLeaveSummaryRow {
  periodId: string;
  jobProfileId: string;
  profileName: string;
  startDate: string;
  endDate: string;
  karensdag: string | null;
  sickPayOre: number;
  days: SickDayBreakdown[];
}

export interface ProfileBreakDown {
  jobProfileId: string;
  name: string;
  taxRate: number;
  shiftCount: number;
  workedMinutes: number;
  breakMinutes: number;
  baseOre: number;
  obOre: number;
  grossOre: number;
  taxOre: number;
  netOre: number;
}

export interface MonthlySummary {
  from: string;
  to: string;
  shiftCount: number;
  workedMinutes: number;
  breakMinutes: number;
  baseOre: number;
  obOre: number;
  grossOre: number;
  taxOre: number;
  netOre: number;
  taxMode: TaxMode;
  goalOre: number | null;
  goalProgressPercent: number;
  goalRemainingOre: number | null;
  hoursToGoalEstimate: number | null;
  estimatedNetOrePerHour: number | null;
  byJobProfile: ProfileBreakDown[];
  sickPayOre: number;
  sickLeave: SickLeaveSummaryRow[];
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

export type TaxMode = 'table' | 'flat';

export interface PublicTaxSettings {
  taxYear: number;
  tableNumber: number;
  columnNumber: number;
  dayType: string;
  updatedAt: string;
}

export interface UpsertTaxSettingsBody {
  taxYear: number;
  tableNumber: number;
  columnNumber?: number;
  dayType?: '30B' | '30%';
}

export interface SalaryGoal {
  monthlySalaryGoalOre: number | null;
}
