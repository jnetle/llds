import Image from 'next/image';
import Link from 'next/link';
import { PieceRequest } from '@/components/pieces/PieceRequest';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import type { Piece } from '@/lib/pieces';
import { framesCreditingPiece } from '@/lib/projects';
import { color, space, text } from '@/lib/tokens';

/**
 * One credited object. A server component: the only interactive part is the request form, which is its own client
 * island, so the story and the photographs stay out of the browser bundle.
 *
 * **The photograph is borrowed, not shot.** Every image here comes from a project frame that credits this piece, via
 * `framesCreditingPiece` — which is why a piece record carries no image fields and needs no R2 object of its own. It
 * is also the better photograph: the object in a room the studio finished, rather than a vendor's white sweep.
 */
export function PieceDetail({ piece }: { piece: Piece }) {
  const frames = framesCreditingPiece(piece.slug);
  const lead = frames[0];

  // Every authored spec, in a fixed order, with the absent ones dropped rather than rendered blank.
  const specs = [
    ['Materials', piece.materials],
    ['Finish', piece.finish],
    ['Dimensions', piece.dimensions],
    ['Lead time', piece.leadTime]
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div>
      {/* Bespoke gutter and header clearance, matching the project detail top bar so the two pages line up. */}
      <div
        className="flex items-center justify-between gap-[16px] px-[18px] pt-[78px] pb-[14px] sm:px-[36px] sm:pt-[110px] sm:pb-[24px]"
        style={{ borderBottom: `1px solid ${color.hairline}` }}>
        <Link href="/pieces" className="micro" style={{ color: 'inherit' }}>
          <span aria-hidden>←</span> All Pieces
        </Link>
        <Eyebrow as="span" size="sm">
          {piece.category}
        </Eyebrow>
      </div>

      <Section padY="sm">
        <Grid cols={{ d: 'minmax(0, 1fr) minmax(0, 1fr)', m: '1fr' }} gap={{ d: 64, m: 32 }} alignItems="start">
          {lead ? (
            <div style={{ position: 'relative', aspectRatio: lead.image.aspect, background: 'var(--modern-tan)' }}>
              <Image
                src={lead.image.src}
                alt={lead.image.alt}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 600px) 92vw, 46vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ) : (
            // A piece can be authored before any frame credits it. Rendering the text alone is the honest state —
            // there is no stand-in photograph to show, because this page never had one of its own.
            <div />
          )}

          <div>
            <Heading level="display" style={{ fontSize: 'clamp(36px, 4.4vw, 68px)', marginBottom: space[3] }}>
              {piece.name}
            </Heading>

            {/* The maker, given its own line and sent outward. Showcasing them is half the reason a credit exists. */}
            {piece.brandUrl ? (
              <a
                href={piece.brandUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="photo-credit__link serif"
                style={{ fontSize: 18, marginBottom: space[5] }}>
                {piece.brand}
              </a>
            ) : (
              <p className="serif" style={{ fontSize: 18, fontStyle: 'italic', margin: `0 0 ${space[5]}px` }}>
                {piece.brand}
              </p>
            )}

            <div style={{ display: 'grid', gap: space[4], marginTop: space[5] }}>
              {piece.story.map((paragraph, i) => (
                <p key={i} style={{ ...text.body, margin: 0, maxWidth: '58ch' }}>
                  {paragraph}
                </p>
              ))}
            </div>

            {specs.length > 0 && (
              <dl
                style={{
                  display: 'grid',
                  gap: space[3],
                  margin: `${space[6]}px 0 0`,
                  borderTop: `1px solid ${color.hairline}`,
                  paddingTop: space[4]
                }}>
                {specs.map(([label, value]) => (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 140px) 1fr', gap: space[3] }}>
                    <dt>
                      <Eyebrow as="span" size="sm">
                        {label}
                      </Eyebrow>
                    </dt>
                    <dd style={{ ...text.bodySm, margin: 0 }}>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Grid>
      </Section>

      {/* Where it was used. Skipped entirely when the lead frame is the only one — the reader is already looking at it. */}
      {frames.length > 1 && (
        <Section padTop="none" padBottom="sm">
          <Eyebrow style={{ marginBottom: space[4] }}>— Seen In</Eyebrow>
          <Grid cols={{ d: 'repeat(3, 1fr)', t: 'repeat(2, 1fr)', m: '1fr' }} gap={{ d: 24, m: 20 }}>
            {frames.map(({ project, image }) => (
              <Link key={image.src} href={`/projects/${project.slug}`} style={{ display: 'grid', gap: space[2] }}>
                <span style={{ position: 'relative', aspectRatio: image.aspect, background: 'var(--modern-tan)', display: 'block' }}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 600px) 92vw, 30vw"
                    style={{ objectFit: 'cover' }}
                  />
                </span>
                <span className="serif" style={{ fontSize: 17 }}>
                  {project.title}
                </span>
              </Link>
            ))}
          </Grid>
        </Section>
      )}

      <Section padY="sm" topBorder>
        <Container maxWidth={900}>
          <Eyebrow style={{ marginBottom: space[4] }}>— Request</Eyebrow>
          <Heading level="section" style={{ marginBottom: space[5] }}>
            Ask us about this piece.
          </Heading>
          <PieceRequest slug={piece.slug} pieceName={piece.name} />
        </Container>
      </Section>
    </div>
  );
}
