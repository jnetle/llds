import { readFileSync } from 'node:fs';
import path from 'node:path';
// Aliased because unqualified `Image` is configured as next/image for jsx-a11y, which then demands an `alt` prop.
import { Document, Font, Image as PdfImage, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { InquiryInput } from '../inquirySchema';
import { formatSubmittedAt, toAnswerBands, toTaskName } from '../inquiryPayload';

/** Brand hexes, literal because a PDF has no CSSOM to resolve `lib/tokens.ts`'s CSS vars against. Move both together. */
const ink = '#0f1a2b'; // navy ink
const paper = '#f4f1ea'; // bone white
const muted = '#a89f96'; // warm stone
const accent = '#8a5a32'; // saddle leather

const asset = (...segments: string[]) => path.join(process.cwd(), 'lib', 'pdf', ...segments);

// From a local path, never a URL: react-pdf resolves `src` at render time, and a network fetch there is a documented
// serverless cold-start failure that silently falls back to Helvetica. The files need tracing — see next.config.ts.
Font.register({
  family: 'Cormorant Garamond',
  fonts: [
    { src: asset('fonts', 'CormorantGaramond-Light.ttf'), fontWeight: 300 },
    { src: asset('fonts', 'CormorantGaramond-Medium.ttf'), fontWeight: 500 }
  ]
});

Font.register({
  family: 'Inter',
  fonts: [
    { src: asset('fonts', 'Inter-Regular.ttf'), fontWeight: 400 },
    { src: asset('fonts', 'Inter-Medium.ttf'), fontWeight: 500 }
  ]
});

// Turns off react-pdf's default hyphenation: a street name broken with a hyphen reads as a typo in a forwarded document.
Font.registerHyphenationCallback(word => [word]);

const logo = readFileSync(path.join(process.cwd(), 'public', 'logo-long-navy.png'));

// Cormorant's tall ascenders and small x-height need looser leading here than the same size would on the web.
const styles = StyleSheet.create({
  page: { backgroundColor: paper, color: ink, paddingTop: 48, paddingBottom: 56, paddingHorizontal: 56 },
  logo: { width: 132, marginBottom: 28 },
  title: { fontFamily: 'Cormorant Garamond', fontWeight: 300, fontSize: 26, letterSpacing: -0.3, marginBottom: 6 },
  meta: { fontFamily: 'Inter', fontSize: 8, letterSpacing: 0.6, color: muted, textTransform: 'uppercase' },
  rule: { borderBottomWidth: 0.5, borderBottomColor: muted, marginTop: 22, marginBottom: 22 },

  band: { marginBottom: 4 },
  bandHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
  bandNumeral: { fontFamily: 'Inter', fontWeight: 500, fontSize: 8, letterSpacing: 1.2, color: accent, marginRight: 10 },
  bandLabel: { fontFamily: 'Inter', fontWeight: 500, fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase' },

  entry: { marginBottom: 13 },
  question: { fontFamily: 'Inter', fontSize: 7.5, letterSpacing: 0.5, color: muted, marginBottom: 3 },
  answer: { fontFamily: 'Cormorant Garamond', fontWeight: 300, fontSize: 12.5, lineHeight: 1.45 },

  footer: { position: 'absolute', bottom: 28, left: 56, right: 56, flexDirection: 'row', justifyContent: 'space-between' },
  // fontFamily does not inherit View → Text in react-pdf; leaving it on the row silently falls back to Helvetica.
  footerText: { fontFamily: 'Inter', fontSize: 7, letterSpacing: 0.6, color: muted }
});

function InquiryDocument({ data, submittedAt }: { data: InquiryInput; submittedAt: string }) {
  const bands = toAnswerBands(data);

  return (
    <Document title={toTaskName(data)} author="Laurel Leaf Design Studio" subject="Project inquiry">
      <Page size="LETTER" style={styles.page}>
        <PdfImage src={logo} style={styles.logo} />

        <Text style={styles.title}>{data.name}</Text>
        <Text style={styles.meta}>Project inquiry · {formatSubmittedAt(submittedAt)}</Text>

        <View style={styles.rule} />

        {bands.map(band => (
          // `wrap` stays on so a long band can break across pages, but the heading keeps its first entry.
          <View key={band.numeral} style={styles.band}>
            <View style={styles.bandHead} minPresenceAhead={40}>
              <Text style={styles.bandNumeral}>{band.numeral}</Text>
              <Text style={styles.bandLabel}>{band.label}</Text>
            </View>

            {band.entries.map(entry => (
              <View key={entry.key} style={styles.entry} wrap={false}>
                <Text style={styles.question}>{entry.question}</Text>
                <Text style={styles.answer}>{entry.answer}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Laurel Leaf Design Studio</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

/** `inquiry-jane-doe-2026-08-15.pdf` */
export function inquiryPdfFilename(data: InquiryInput, submittedAt: string): string {
  const slug =
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'inquiry';
  return `inquiry-${slug}-${submittedAt.slice(0, 10)}.pdf`;
}

/** Render the questionnaire to PDF bytes. Throws if react-pdf cannot lay it out. */
export function renderInquiryPdf(data: InquiryInput, submittedAt: string): Promise<Buffer> {
  return renderToBuffer(<InquiryDocument data={data} submittedAt={submittedAt} />);
}
