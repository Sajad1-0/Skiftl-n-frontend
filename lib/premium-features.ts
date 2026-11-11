export type PremiumFeatureId =
  | 'history'
  | 'profiles'
  | 'bulk'
  | 'breaks'
  | 'sick'
  | 'tax'
  | 'pdf'
  | 'goal';

export interface PremiumFeature {
  id: PremiumFeatureId;
  title: string;
  description: string;
}

export const PREMIUM_FEATURES: readonly PremiumFeature[] = [
  {
    id: 'history',
    title: '6 månaders historik',
    description: 'Månadsväljare och jämför två månader sida vid sida',
  },
  {
    id: 'profiles',
    title: 'Flera jobbprofiler',
    description: 'Upp till 5 aktiva profiler. Arkivera vid nedgradering.',
  },
  {
    id: 'bulk',
    title: 'Bulk-logg',
    description: 'Logga up till 10 pass samtidigt med samma jobbprofil.',
  },
  {
    id: 'breaks',
    title: 'Exakta rasintervall',
    description: 'Flera raster per pass med start-slut inom arbetstiden.',
  },
  {
    id: 'sick',
    title: 'Sjukanmälan',
    description: 'Karensdag + 80% sjuklön på schemalagda dagar.',
  },
  {
    id: 'tax',
    title: 'Skattetabell',
    description: 'Skatteverkets tabell och mer exakt nettoestimat.',
  },
  {
    id: 'pdf',
    title: 'PDF-rapport',
    description: 'Ladda ner månadssammanfattning som PDF.',
  },
  {
    id: 'goal',
    title: 'Lönemål',
    description: 'Sätt nettomål och se progress + uppskattade timmar kvar.',
  },
] as const;

export function getPremiumFeature(id: PremiumFeatureId): PremiumFeature {
  const feature = PREMIUM_FEATURES.find((f) => f.id === id);
  if (!feature) {
    throw new Error(`Okänd Premium-feature: ${id}`);
  }

  return feature;
}
