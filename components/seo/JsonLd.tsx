/**
 * Renders one or more JSON-LD graphs into a `<script type="application/ld+json">`.
 *
 * A plain `<script>` rather than `next/script`: JSON-LD is data, not executable code, so
 * there is nothing for the loading strategies to optimize. This follows the pattern in
 * `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`.
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
          // `JSON.stringify` does not escape `<`, so a string containing `</script>`
          // would break out of the tag. Replacing it with its unicode escape is the
          // mitigation the Next docs prescribe; the JSON parser reads it identically.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
