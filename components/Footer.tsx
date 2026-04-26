import { Wordmark } from "./Wordmark";

const COLUMNS: { h: string; items: { label: string; href?: string }[] }[] = [
  {
    h: "Studio",
    items: [
      { label: "About", href: "/about" },
      { label: "Approach", href: "/about" },
      { label: "Press", href: "/press" },
      { label: "Awards", href: "/press" },
    ],
  },
  {
    h: "Visit",
    items: [
      { label: "12a Lamb Conduit Pass" },
      { label: "London WC1N 3LF" },
      { label: "By appointment" },
    ],
  },
  {
    h: "Contact",
    items: [
      { label: "hello@laurelleaf.studio", href: "mailto:hello@laurelleaf.studio" },
      { label: "+44 (0)20 7946 0119", href: "tel:+442079460119" },
      { label: "Instagram" },
      { label: "Journal" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--hairline)",
        padding: "80px 8vw 50px",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        gap: 60,
        alignItems: "start",
      }}
    >
      <div>
        <Wordmark />
        <p
          className="serif"
          style={{
            marginTop: 30,
            fontSize: 22,
            fontStyle: "italic",
            lineHeight: 1.4,
            fontWeight: 300,
            maxWidth: "24ch",
          }}
        >
          Considered interiors for the long view.
        </p>
      </div>
      {COLUMNS.map((col) => (
        <div key={col.h}>
          <div className="micro" style={{ marginBottom: 22, opacity: 0.5 }}>
            {col.h}
          </div>
          <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
            {col.items.map((it) => (
              <li
                key={it.label}
                style={{ fontSize: 14, color: "var(--ink-soft)" }}
              >
                {it.href ? <a href={it.href}>{it.label}</a> : it.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: 60,
          paddingTop: 30,
          borderTop: "1px solid var(--hairline)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div className="micro-sm" style={{ opacity: 0.5 }}>
          © Laurel Leaf Design Limited · MMXXVI
        </div>
        <div className="micro-sm" style={{ opacity: 0.5 }}>
          Site designed in-house
        </div>
      </div>
    </footer>
  );
}
