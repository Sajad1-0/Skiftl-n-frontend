import { kronorToOre, oreToKronor } from '@/lib/money';
import { parseOptionalTaxRateInput } from '@/lib/tax-rate';
import type { PublicJobProfile } from '@/lib/types';

export interface JobProfileFormDefaults {
  name: string;
  hourlyWageKronor: string;
  taxRate: string;
  employerName: string;
  collectiveAgreementId: string;
  isPrimary: boolean;
}

/** Klart API-payload efter klientvalidering (timlön i öre). */
export interface JobProfileFormSubmitData {
  name: string;
  hourlyWage: number;
  taxRate: number | null;
  employerName: string | null;
  collectiveAgreementId: string | null;
  isPrimary: boolean;
}

export function emptyJobProfileFormDefaults(
  overrides?: Partial<JobProfileFormDefaults>,
): JobProfileFormDefaults {
  return {
    name: '',
    hourlyWageKronor: '',
    taxRate: '',
    employerName: '',
    collectiveAgreementId: '',
    isPrimary: false,
    ...overrides,
  };
}

export function jobProfileToFormDefaults(profile: PublicJobProfile): JobProfileFormDefaults {
  return {
    name: profile.name,
    hourlyWageKronor: String(oreToKronor(profile.hourlyWage)),
    taxRate: profile.taxRate != null ? String(Number(profile.taxRate)) : '',
    employerName: profile.employerName ?? '',
    collectiveAgreementId: profile.collectiveAgreementId ?? '',
    isPrimary: profile.isPrimary,
  };
}

export function buildJobProfileSubmitData(
  formData: FormData,
): { data: JobProfileFormSubmitData } | { error: string } {
  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2) {
    return { error: 'Namn måste vara minst 2 tecken' };
  }

  const hourlyWageKronor = Number(formData.get('hourlyWageKronor'));
  if (!Number.isFinite(hourlyWageKronor) || hourlyWageKronor <= 0) {
    return { error: 'Ange en giltig timlön i kronor' };
  }

  const taxRateParsed = parseOptionalTaxRateInput(formData.get('taxRate'));
  if (!taxRateParsed.ok) {
    return { error: taxRateParsed.error };
  }

  const employerName = String(formData.get('employerName') ?? '').trim();
  if (employerName.length > 0 && employerName.length < 2) {
    return { error: 'Arbetsgivare måste vara minst 2 tecken' };
  }

  const agreementRaw = String(formData.get('collectiveAgreementId') ?? '').trim();

  return {
    data: {
      name,
      hourlyWage: kronorToOre(hourlyWageKronor),
      taxRate: taxRateParsed.value,
      employerName: employerName.length === 0 ? null : employerName,
      collectiveAgreementId: agreementRaw.length > 0 ? agreementRaw : null,
      isPrimary: formData.get('isPrimary') === 'on',
    },
  };
}
