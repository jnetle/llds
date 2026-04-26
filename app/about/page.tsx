"use client";

import Link from "next/link";
import { useReveal } from "@/lib/hooks";

const PRINCIPLES = [
  {
    h: "Patience over polish",
    p: "We prefer the plaster that is trowelled by hand, and the joinery that takes three weeks instead of three days.",
  },
  {
    h: "Material honesty",
    p: "Oak left to silver, limewash that chalks gently, linen that creases. Finishes should soften, not wear out.",
  },
  {
    h: "Rooted in place",
    p: "Every commission begins with a walk — through the site, the neighbourhood, the garden — before a single sketch is made.",
  },
];

const TIMELINE: [string, string][] = [
  ["2026", "House & Garden Top 100 Interior Designers"],
  ["2025", "AD PRO Directory — Emerging Talent"],
  ["2024", "World of Interiors · featured in the February issue"],
  ["2023", "RIBA Regional Award — shortlist, Cotswold Barn"],
  ["2019", "Studio expands with Oxfordshire workshop"],
  ["2016", "Laurel Leaf Design Studio founded in Bloomsbury"],
  ["2011", "Joined Retrouvius as project lead"],
  ["2008", "Bartlett School of Architecture, MArch"],
];

export default function AboutPage() {
  const [ref, seen] = useReveal<HTMLElement>();

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
        }}
      >
        <div
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 8vw",
            gap: 34,
          }}
        >
          <div className="micro" style={{ opacity: 0.55 }}>
            — The Studio
          </div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(44px, 5.2vw, 84px)",
              lineHeight: 1.02,
              fontWeight: 300,
              letterSpacing: "-0.012em",
              textWrap: "balance",
            }}
          >
            An unhurried practice{" "}
            <em style={{ fontWeight: 300 }}>rooted</em> in the English
            countryside.
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
              maxWidth: "46ch",
            }}
          >
            Laurel Leaf Design Studio was founded by Iris Wren in 2016 after a
            decade working across residential architecture and antique dealing.
            The studio operates from a small mews in Bloomsbury, with a second
            workshop in rural Oxfordshire.
          </p>
        </div>
      </section>

      {/* Portrait + Approach */}
      <section
        ref={ref}
        style={{
          padding: "160px 8vw",
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr",
          gap: 100,
          alignItems: "start",
        }}
      >
        <div
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s cubic-bezier(.22,.61,.36,1)",
            position: "sticky",
            top: 120,
          }}
        >
          <div
            style={{
              aspectRatio: "4/5",
              backgroundImage:
                'url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr",
              gap: 22,
              alignItems: "center",
              marginTop: 32,
              paddingTop: 32,
              borderTop: "1px solid var(--hairline)",
            }}
          >
            <div
              style={{
                width: 90,
                height: 110,
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(0.85)",
              }}
            />
            <div>
              <div
                className="serif"
                style={{
                  fontSize: 26,
                  fontWeight: 300,
                  fontStyle: "italic",
                  letterSpacing: "0.01em",
                }}
              >
                Iris Wren
              </div>
              <div
                className="micro-sm"
                style={{ marginTop: 8, opacity: 0.6 }}
              >
                Founder &amp; Creative Lead
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s cubic-bezier(.22,.61,.36,1) 0.15s",
          }}
        >
          <div className="micro" style={{ marginBottom: 30, opacity: 0.55 }}>
            — Approach
          </div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(30px, 3vw, 44px)",
              fontWeight: 300,
              lineHeight: 1.2,
              letterSpacing: "-0.005em",
              marginBottom: 36,
              textWrap: "pretty",
            }}
          >
            A home is more than a collection of finishes — it is shaped by how
            we live, what we value, and the places that have left an
            impression on us.
          </h2>
          <div
            style={{
              display: "grid",
              gap: 22,
              fontSize: 17,
              lineHeight: 1.75,
              color: "var(--ink-soft)",
              maxWidth: "58ch",
            }}
          >
            <p>
              Every project begins with understanding not just how a space
              should look, but how it should feel.
            </p>
            <p>
              The architecture, the surroundings, the way light moves through
              a room, the scale of a space in relation to how it&apos;s lived
              in — these are the elements that create a home that feels
              grounded and intentional.
            </p>
            <p>
              Our work is rooted in a balance of creativity and precision.
              Inspired by years in both the home furnishings and building
              industries, I approach each project with equal attention to
              design and execution, ensuring that what is imagined can be
              carried through to completion with clarity.
            </p>
            <p>
              I&apos;m drawn to spaces that feel layered and lived in. There
              is always a quiet reference to what has come before — through
              materials, proportion, and detail — while still creating
              something that feels current and distinctly your own.
            </p>
            <p>
              This is not about making a space simply look beautiful.
              It&apos;s about creating a home that evokes a sense of place,
              holds meaning, and supports the way you live every day.
            </p>
            <p style={{ fontStyle: "italic" }}>
              And along the way, the process should feel thoughtful,
              collaborative, and yes — there&apos;s usually a little fun (and
              likely a snack) involved too.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section style={{ padding: "0 8vw 160px" }}>
        <div className="micro" style={{ marginBottom: 60, opacity: 0.55 }}>
          — Principles
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 60,
            borderTop: "1px solid var(--hairline)",
            paddingTop: 50,
          }}
        >
          {PRINCIPLES.map((v) => (
            <div key={v.h}>
              <h3
                className="serif"
                style={{
                  fontSize: 26,
                  fontWeight: 300,
                  fontStyle: "italic",
                  marginBottom: 18,
                  lineHeight: 1.2,
                }}
              >
                {v.h}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "var(--ink-soft)",
                }}
              >
                {v.p}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum / timeline */}
      <section
        style={{
          padding: "0 8vw 180px",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 80,
        }}
      >
        <div>
          <div className="micro" style={{ opacity: 0.55, marginBottom: 20 }}>
            — Curriculum
          </div>
          <h3
            className="serif"
            style={{
              fontSize: 44,
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.005em",
            }}
          >
            Select engagements{" "}
            <em style={{ fontWeight: 300 }}>&amp;</em> recognitions.
          </h3>
        </div>
        <ul style={{ listStyle: "none", display: "grid", gap: 0 }}>
          {TIMELINE.map(([year, label]) => (
            <li
              key={year + label}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                padding: "22px 0",
                borderTop: "1px solid var(--hairline)",
                alignItems: "baseline",
                gap: 30,
              }}
            >
              <div className="micro-sm" style={{ opacity: 0.6 }}>
                {year}
              </div>
              <div
                className="serif"
                style={{ fontSize: 22, fontWeight: 300 }}
              >
                {label}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA back */}
      <section style={{ padding: "0 8vw 180px", textAlign: "center" }}>
        <Link
          href="/"
          className="micro"
          style={{
            borderBottom: "1px solid currentColor",
            paddingBottom: 6,
            letterSpacing: "0.28em",
          }}
        >
          ↵ Return to Projects
        </Link>
      </section>
    </div>
  );
}
