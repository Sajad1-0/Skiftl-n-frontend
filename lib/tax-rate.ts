/** Tomt fält → null. Ogiltigt tal → error. 0 är giltigt. */
export function parseOptionalTaxRateInput(
  raw: FormDataEntryValue | null,
): { ok: true; value: number | null } | { ok: false; error: string } {
  const text = String(raw ?? '').trim();
  if (text === '') return { ok: true, value: null };

  const value = Number(text);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return { ok: false, error: 'Skattesats måste vara mellan 0 och 100' };
  }

  return { ok: true, value };
}
