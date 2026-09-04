/**
 * Renders one or more JSON-LD graphs into `<script type="application/ld+json">` tags. A plain `<script>` rather than
 * `next/script` — JSON-LD is data, not executable code — per next/dist/docs/01-app/02-guides/json-ld.md.
 */
type Props = {
  /** A single node, or several rendered as separate script tags. */
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: Props) {
  const nodes = Array.isArray(data) ? data : [data];

  return (
    <>
      {nodes.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // `JSON.stringify` leaves `<` unescaped, so a string containing `</script>` would break out of the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
