import type { Metadata } from 'next';
import { LegalDoc, LegalSection } from '@/components/legal/legal-doc';
import { BRAND_DOMAIN, BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Integritetspolicy',
  description: `Hur ${BRAND_NAME} behandlar personuppgifter`,
};

const SUPPORT_EMAIL = `support@${BRAND_DOMAIN}`;

export default function PrivacyPage() {
  return (
    <LegalDoc title="Integritetspolicy" updatedLabel="Senast uppdaterad: 23 november 2026">
      <LegalSection title="1. Personuppgiftsansvarig">
        <p>
          {BRAND_NAME} ({BRAND_DOMAIN}) är personuppgiftsansvarig för behandlingen av dina uppgifter
          i tjänsten. Kontakta oss på{' '}
          <a
            className="font-medium text-foreground underline underline-offset-4"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Vilka uppgifter vi behandlar">
        <p>Beroende på hur du använder tjänsten kan vi behandla:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Konto: namn, e-post, lösenordshash (aldrig klartextlösenord)</li>
          <li>Arbetsuppgifter du själv loggar: pass, raster, jobbprofiler, OB-relaterad data</li>
          <li>Valfria Premium-uppgifter: skattetabellsinställningar, sjukperioder, lönemål</li>
          <li>Betalning via Stripe: kund-/prenumerations-ID (kortuppgifter hanteras av Stripe)</li>
          <li>Teknisk drift: IP/loggar i begränsad omfattning hos hostingleverantörer</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Ändamål och rättslig grund">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-medium text-foreground">Utföra avtalet</span> — skapa konto,
            beräkna lön/OB, visa sammanfattningar, Premium-funktioner
          </li>
          <li>
            <span className="font-medium text-foreground">Berättigat intresse</span> — felsökning,
            säkerhet, förbättra tjänsten
          </li>
          <li>
            <span className="font-medium text-foreground">Rättslig förpliktelse</span> — om vi måste
            spara vissa uppgifter enligt lag (t.ex. bokföring kring betalningar)
          </li>
          <li>
            <span className="font-medium text-foreground">Samtycke</span> — där vi uttryckligen ber
            om det (t.ex. framtida nyhetsbrev)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Lagring och underleverantörer">
        <p>
          Data lagras hos våra driftsleverantörer (t.ex. Vercel för webb, Railway för API/databas)
          och hos Stripe för betalningar. Uppgifter sparas så länge kontot är aktivt och en rimlig
          tid därefter för säkerhets- och supportskäl, om inte lag kräver längre lagring.
        </p>
      </LegalSection>

      <LegalSection title="5. Dina rättigheter (GDPR)">
        <p>
          Du kan begära tillgång, rättelse, radering, begränsning, dataportabilitet och invända mot
          viss behandling. Kontakta {SUPPORT_EMAIL}. Du kan också klaga till
          Integritetsskyddsmyndigheten (IMY).
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies och local lagring">
        <p>
          Tjänsten använder främst nödvändig lagring i webbläsaren för inloggning (t.ex. JWT i
          localStorage). Om vi senare lägger till analysverktyg uppdateras denna policy.
        </p>
      </LegalSection>

      <LegalSection title="7. Ändringar">
        <p>
          Vi kan uppdatera policyn. Väsentliga ändringar meddelas i tjänsten eller via e-post när
          mejlfunktion finns.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
