import type { Metadata } from 'next';
import { LegalDoc, LegalSection } from '@/components/legal/legal-doc';
import { BRAND_DOMAIN, BRAND_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Villkor',
  description: `Användarvillkor för ${BRAND_NAME}`,
};

const SUPPORT_EMAIL = `support@${BRAND_DOMAIN}`;

export default function TermsPage() {
  return (
    <LegalDoc title="Användarvillkor" updatedLabel="Senaste uppdaterad: 23 november 2026">
      <LegalSection title="1. Tjänsten">
        <p>
          {BRAND_NAME} ({BRAND_DOMAIN}) är ett verktyg för att logga arbetspass, uppskatta lön
          (inkl. OB där det stöds) och följa upp månadssammanfattningar. Tjänsten vänder sig till
          privatpersoner som själva rapporterar sina uppgifter.
        </p>
      </LegalSection>

      <LegalSection title="2. Konto">
        <p>
          Du ansvarar för att uppgifterna du anger är korrekta och för att hålla inloggningen
          skyddad. Ett konto per e-postadress. Du får inte använda tjänsten på ett sätt som bryter
          mot lag eller skadar systemet.
        </p>
      </LegalSection>

      <LegalSection title="3. Dina data">
        <p>
          Du äger de arbetsuppgifter du loggar. Vi behandlar personuppgifter enligt vår{' '}
          <a className="font-medium text-foreground underline underline-offset-4" href="/privacy">
            integritetspolicy
          </a>
          . Du kan begära radering av konto genom att kontakta oss.
        </p>
      </LegalSection>

      <LegalSection title="4. Premium och betalning">
        <p>
          Gratisplan och Premium styrs av gällande produktgränser. Under tidsbegränsad Premium-beta
          kan funktioner vara öppna utan kort till ett synligt slutdatum. Betald Premium hanteras
          via Stripe; avslut följer Stripe-kundportalen. Priser kan ändras med förvarning.
        </p>
      </LegalSection>

      <LegalSection title="5. Ansvar">
        <p>
          Löne-, skatte- och OB-beräkningar är uppskattningar till hjälp — inte juridisk eller
          skatterådgivning, och inte en lönespecifikation från arbetsgivare. Du ansvarar för att
          kontrollera siffror mot lönespec/avtal. Tjänsten tillhandahålls i befintligt skick.
        </p>
      </LegalSection>

      <LegalSection title="6. Ändringar">
        <p>
          Vi kan uppdatera villkoren. Väsentliga ändringar meddelas i tjänsten eller via e-post när
          det är rimligt. Fortsatt användning efter publicering innebär att du godtar de uppdaterade
          villkoren.
        </p>
      </LegalSection>

      <LegalSection title="7. Kontakt">
        <p>
          Frågor om villkor:{' '}
          <a
            className="font-medium text-foreground underline underline-offset-4"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
