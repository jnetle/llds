"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

const ROLE = [
  {
    num: "01",
    title: "Planning & Layout",
    desc: "Refining floor plans, space planning, and overall flow of the home.",
  },
  {
    num: "02",
    title: "Design Direction",
    desc: "Establishing the visual foundation through concept development.",
  },
  {
    num: "03",
    title: "Selections",
    desc: "Guiding all finish and material decisions throughout the home.",
  },
  {
    num: "04",
    title: "Documentation",
    desc: "Creating drawings, layouts, and selection schedules for construction.",
  },
  {
    num: "05",
    title: "Coordination",
    desc: "Working alongside your builder and trades to communicate design intent.",
  },
  {
    num: "06",
    title: "Project Support",
    desc: "Providing oversight during construction to ensure the design is carried through.",
  },
];

const SCOPE: { h: string; items: string[] }[] = [
  {
    h: "Design & Material Selections",
    items: [
      "Cabinetry layouts, door styles, finishes, and hardware placement",
      "Plumbing fixtures, trim, and installation locations",
      "Lighting selections and overall placement strategy",
      "Tile selections with detailed layouts, patterns, and specifications",
      "Countertops, flooring, and complete paint palettes",
    ],
  },
  {
    h: "Architectural & Interior Detailing",
    items: [
      "Millwork and trim design, including wall treatments and ceiling details",
      "Interior doors, casing, and hardware coordination",
      "Stair design, including railing systems and structural elements",
      "Fireplace design and material selections",
      "Wallpaper and specialty finishes",
    ],
  },
  {
    h: "Construction Integration",
    items: [
      "Electrical layouts and on-site walk-through markups",
      "Plumbing wall locations and fixture alignment",
      "Window, exterior door, and interior door coordination",
      "Alignment of all selections with construction documents",
    ],
  },
  {
    h: "Finishing Elements",
    items: [
      "Mirrors and bath accessories",
      "Shower glass design and configuration",
      "Hardware consistency and finish coordination throughout the home",
    ],
  },
  {
    h: "Exterior Coordination",
    items: [
      "Exterior materials including brick, stone, and roofing",
      "Exterior color palettes and finish coordination",
      "Garage doors, windows, and exterior architectural elements",
    ],
  },
];

const DELIVERABLES: {
  h: string;
  items: string[];
  footnote?: string;
}[] = [
  {
    h: "Visual Direction",
    items: [
      "Concept boards and material palettes",
      "3D renderings of select primary spaces",
    ],
    footnote:
      "Renderings are provided for key areas such as kitchen, main living spaces, and primary bath to illustrate layout, scale, and design intent.",
  },
  {
    h: "Selection Schedules",
    items: [
      "Comprehensive digital selection schedules",
      "Product specifications and cut sheets",
      "Organized for easy reference by client and builder",
    ],
  },
  {
    h: "Construction Documentation",
    items: [
      "Cabinetry layouts and elevations",
      "Tile layouts and installation details",
      "Plumbing and electrical placement references",
    ],
  },
  {
    h: "Project Access",
    items: [
      "QR-coded selections for job site use",
      "Digital access to all materials (desktop and mobile)",
    ],
  },
  {
    h: "Final Record",
    items: ["Printed binder of selections and finishes for long-term reference"],
  },
];

const PROCESS: {
  n: string;
  h: string;
  p: string;
  bullets: string[];
  footnote?: string;
}[] = [
  {
    n: "01",
    h: "Onboarding",
    p: "We begin by understanding how your home needs to function, both in layout and in daily use. This phase establishes the foundation for the entire project.",
    bullets: [
      "Review of floor plans and spatial flow",
      "In-depth discussion of lifestyle, priorities, and key elements",
      "Detailed exploration of style preferences, references, and overall design direction",
    ],
  },
  {
    n: "02",
    h: "Concept Design",
    p: "We establish the overall design direction for the home, defining the visual and functional foundation that will guide all selections moving forward.",
    bullets: [
      "Concept boards and visual direction",
      "Preliminary layouts and spatial planning",
      "Initial material and finish direction",
    ],
    footnote:
      "The design direction is reviewed and approved before moving into detailed development.",
  },
  {
    n: "03",
    h: "Design Development",
    p: "Selections are finalized and documented to align with construction timelines and ensure all design elements are fully coordinated.",
    bullets: [
      "Final material and finish selections",
      "Drawings, layouts, and selection schedules",
    ],
    footnote:
      "Select showroom visits are scheduled for key selections such as plumbing, countertops, and windows.",
  },
  {
    n: "04",
    h: "Implementation",
    p: "We support the project through construction to ensure the design is carried through as intended.",
    bullets: [
      "Coordination with builder and trades",
      "Ongoing management of selections and documentation",
      "Site visits at key project milestones",
    ],
  },
];

const WORKING: { h: string; p: string; note?: string }[] = [
  {
    h: "Communication",
    p: "Project communication is coordinated through email and scheduled meetings. We work closely with your builder to streamline communication and reduce unnecessary back-and-forth.",
  },
  {
    h: "Meetings",
    p: "Design discussions take place during scheduled meetings, where selections are presented in a clear and organized format to support efficient decision-making.",
  },
  {
    h: "Response Time",
    p: "Responses are typically provided within 1–2 business days. Time-sensitive construction items are prioritized as needed.",
  },
  {
    h: "Site Visits",
    p: "Site visits are scheduled at key project milestones.",
    note: "Additional site visits requested outside of these milestones are billed separately.",
  },
  {
    h: "Revisions",
    p: "One round of revisions is included per phase and consists of refinements within the established design direction.",
    note: "Additional revisions, redesigns, or expanded scope will be billed separately.",
  },
  {
    h: "Project Flow",
    p: "Timely decisions and approvals are essential to maintaining the construction schedule. Delays in selections or changes after approval may impact overall project timelines.",
  },
];

const DIFFERENCE_POINTS = [
  "Design decisions are made early, creating a more seamless and less overwhelming experience",
  "Each selection is thoughtfully layered to create a cohesive and timeless home",
  "Documentation is clear and organized, allowing your builder and trades to execute with confidence",
  "Communication is streamlined so the process feels calm, not chaotic",
];

const QUICK_LINKS: [string, string][] = [
  ["sec-services", "Services"],
  ["sec-scope", "Scope"],
  ["sec-deliverables", "Deliverables"],
  ["sec-process", "Process"],
  ["sec-working", "Working Together"],
  ["sec-difference", "The Difference"],
  ["sec-next", "Next Steps"],
];

const Dash = () => (
  <span
    style={{
      position: "absolute",
      left: 0,
      top: "0.85em",
      width: 12,
      height: 1,
      background: "var(--ink)",
      opacity: 0.45,
    }}
  />
);

export default function ServicesPage() {
  const [refScope, seenScope] = useReveal<HTMLDivElement>();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const dispatch = (hidden: boolean) =>
      window.dispatchEvent(
        new CustomEvent("globalHeader:setHidden", { detail: { hidden } }),
      );
    const io = new IntersectionObserver(
      ([entry]) => {
        const isStuck = !entry.isIntersecting;
        setStuck(isStuck);
        dispatch(isStuck);
      },
      { threshold: 0 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      dispatch(false);
    };
  }, []);

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.82)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.08) 38%, rgba(0,0,0,0.6) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "0 8vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            paddingBottom: 100,
            color: "#F4F0E8",
          }}
        >
          <div
            className="micro"
            style={{
              opacity: 0.85,
              marginBottom: 28,
              letterSpacing: "0.32em",
            }}
          >
            — Laurel Leaf Design Studio · 2026
          </div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(56px, 8vw, 132px)",
              lineHeight: 0.95,
              fontWeight: 300,
              letterSpacing: "-0.018em",
              maxWidth: "14ch",
              textWrap: "balance",
              textTransform: "uppercase",
            }}
          >
            New Build{" "}
            <em style={{ fontWeight: 300, textTransform: "none" }}>&amp;</em>{" "}
            Renovation Design Services
          </h1>
        </div>

        <div
          className="micro-sm"
          style={{
            position: "absolute",
            top: 32,
            right: 36,
            color: "#F4F0E8",
            opacity: 0.7,
            letterSpacing: "0.28em",
          }}
        >
          Volume I
        </div>
        <div
          className="micro-sm"
          style={{
            position: "absolute",
            bottom: 28,
            right: 36,
            color: "#F4F0E8",
            opacity: 0.7,
            letterSpacing: "0.28em",
          }}
        >
          Services · 2026
        </div>
      </section>

      {/* Sentinel: flips when the quick-links nav reaches the top */}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />

      {/* Quick links */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: stuck
            ? "rgba(244,240,232,0.97)"
            : "rgba(244,240,232,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: `1px solid ${stuck ? "var(--ink-soft)" : "var(--hairline)"}`,
          boxShadow: stuck ? "0 6px 24px rgba(42,46,37,0.06)" : "none",
          padding: "18px 8vw",
          transition:
            "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            gap: 36,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {QUICK_LINKS.map(([id, label]) => (
            <li key={id}>
              <a
                href={"#" + id}
                className="micro-sm"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(id);
                  if (el) {
                    const top =
                      el.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                style={{
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                  opacity: 0.7,
                  paddingBottom: 4,
                  borderBottom: "1px solid transparent",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.borderBottomColor = "var(--ink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Services — Our Role */}
      <section
        id="sec-services"
        style={{
          padding: "160px 8vw",
          borderBottom: "1px solid var(--hairline)",
          scrollMarginTop: 70,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 80,
            alignItems: "end",
            marginBottom: 90,
          }}
        >
          <div>
            <div className="micro" style={{ opacity: 0.55, marginBottom: 24 }}>
              — Services
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(56px, 7vw, 110px)",
                fontWeight: 300,
                lineHeight: 0.95,
                letterSpacing: "-0.018em",
                textTransform: "uppercase",
              }}
            >
              Services
            </h2>
            <p
              style={{
                marginTop: 38,
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--ink-soft)",
                maxWidth: "54ch",
              }}
            >
              We guide the design of your home from early planning through
              construction, bringing clarity to each phase from concept to
              completion.
            </p>
          </div>
          <div
            style={{
              aspectRatio: "4/3",
              backgroundImage:
                'url("https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=80")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div className="micro" style={{ marginBottom: 36, opacity: 0.55 }}>
          — Our role includes
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            borderTop: "1px solid var(--hairline)",
          }}
        >
          {ROLE.map((s, i) => (
            <article
              key={s.num}
              style={{
                borderBottom: "1px solid var(--hairline)",
                borderRight:
                  i % 3 !== 2 ? "1px solid var(--hairline)" : "none",
                padding: "40px 36px 44px",
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <div className="micro-sm" style={{ opacity: 0.55 }}>
                {s.num}
              </div>
              <div>
                <h3
                  className="serif"
                  style={{
                    fontSize: 28,
                    fontWeight: 300,
                    lineHeight: 1.1,
                    letterSpacing: "-0.005em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "var(--ink-soft)",
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Scope */}
      <section
        id="sec-scope"
        style={{
          padding: "160px 8vw",
          background: "rgba(42,46,37,0.04)",
          scrollMarginTop: 90,
        }}
      >
        <div
          ref={refScope}
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 80,
            alignItems: "end",
            marginBottom: 90,
            opacity: seenScope ? 1 : 0,
            transform: seenScope ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s cubic-bezier(.22,.61,.36,1)",
          }}
        >
          <div>
            <div className="micro" style={{ opacity: 0.55, marginBottom: 24 }}>
              — Scope
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(56px, 7vw, 110px)",
                fontWeight: 300,
                lineHeight: 0.95,
                letterSpacing: "-0.018em",
                textTransform: "uppercase",
              }}
            >
              Scope
            </h2>
            <p
              style={{
                marginTop: 38,
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--ink-soft)",
                maxWidth: "54ch",
              }}
            >
              We manage the design details that shape both the aesthetic and
              the construction of your home, ensuring every element is
              considered, coordinated, and fully resolved.
            </p>
          </div>
          <div
            style={{
              aspectRatio: "4/3",
              backgroundImage:
                'url("https://images.unsplash.com/photo-1611288875785-f5d5edcc1adc?auto=format&fit=crop&w=1400&q=80")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0 80px",
          }}
        >
          {SCOPE.map((cat, i) => (
            <div
              key={cat.h}
              style={{
                padding: "36px 0 40px",
                borderTop: "1px solid var(--hairline)",
                borderBottom:
                  i >= SCOPE.length - 2 ? "1px solid var(--hairline)" : "none",
              }}
            >
              <h3
                className="micro"
                style={{
                  marginBottom: 22,
                  opacity: 0.85,
                  letterSpacing: "0.22em",
                }}
              >
                {cat.h}
              </h3>
              <ul style={{ listStyle: "none", display: "grid", gap: 12 }}>
                {cat.items.map((it) => (
                  <li
                    key={it}
                    style={{
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: "var(--ink)",
                      paddingLeft: 22,
                      position: "relative",
                    }}
                  >
                    <Dash />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 80,
            padding: "38px 44px",
            borderTop: "1px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
          }}
        >
          <p
            className="serif"
            style={{
              fontSize: "clamp(22px, 2.2vw, 32px)",
              fontWeight: 300,
              lineHeight: 1.3,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              textWrap: "balance",
            }}
          >
            Every element is considered in relation to the whole, resulting in
            a design that is cohesive, functional, and built with intention.
          </p>
        </div>
      </section>

      {/* Deliverables */}
      <section
        id="sec-deliverables"
        style={{
          padding: "160px 8vw",
          borderBottom: "1px solid var(--hairline)",
          scrollMarginTop: 70,
        }}
      >
        <div style={{ marginBottom: 90 }}>
          <div className="micro" style={{ opacity: 0.55, marginBottom: 24 }}>
            — Deliverables
          </div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(56px, 7vw, 110px)",
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.018em",
              textTransform: "uppercase",
              marginBottom: 38,
            }}
          >
            Deliverables
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
              maxWidth: "60ch",
            }}
          >
            A well-designed project relies on clear, organized documentation.
            Each client receives a curated set of materials that translate
            design decisions into a format your builder and trades can easily
            follow and execute.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 90,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 0 }}>
            {DELIVERABLES.map((d, i) => (
              <div
                key={d.h}
                style={{
                  borderTop: "1px solid var(--hairline)",
                  borderBottom:
                    i === DELIVERABLES.length - 1
                      ? "1px solid var(--hairline)"
                      : "none",
                  padding: "32px 0 36px",
                  display: "grid",
                  gridTemplateColumns: "60px 1fr",
                  gap: 30,
                  alignItems: "start",
                }}
              >
                <div
                  className="micro-sm"
                  style={{ opacity: 0.55, paddingTop: 6 }}
                >
                  0{i + 1}
                </div>
                <div>
                  <h3
                    className="micro"
                    style={{ marginBottom: 18, letterSpacing: "0.22em" }}
                  >
                    {d.h}
                  </h3>
                  <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
                    {d.items.map((it) => (
                      <li
                        key={it}
                        style={{
                          fontSize: 15.5,
                          lineHeight: 1.55,
                          color: "var(--ink)",
                          paddingLeft: 22,
                          position: "relative",
                        }}
                      >
                        <Dash />
                        {it}
                      </li>
                    ))}
                  </ul>
                  {d.footnote && (
                    <p
                      className="serif"
                      style={{
                        marginTop: 18,
                        fontSize: 16,
                        fontStyle: "italic",
                        color: "var(--ink)",
                        lineHeight: 1.55,
                        maxWidth: "50ch",
                      }}
                    >
                      {d.footnote}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gap: 24,
              position: "sticky",
              top: 120,
            }}
          >
            <div
              style={{
                aspectRatio: "4/3",
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              style={{
                aspectRatio: "4/3",
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1556909114-44e3e9399a2e?auto=format&fit=crop&w=1400&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 100,
            paddingTop: 50,
            borderTop: "1px solid var(--ink)",
            textAlign: "center",
          }}
        >
          <p
            className="serif"
            style={{
              fontSize: "clamp(22px, 2.2vw, 32px)",
              fontWeight: 300,
              lineHeight: 1.3,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              textWrap: "balance",
              maxWidth: "32ch",
              margin: "0 auto",
            }}
          >
            Clear documentation allows the design to be executed with accuracy
            and consistency.
          </p>
        </div>
      </section>

      {/* Process */}
      <section
        id="sec-process"
        style={{
          padding: "160px 8vw",
          background: "rgba(42,46,37,0.04)",
          scrollMarginTop: 70,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: 80,
            alignItems: "end",
            marginBottom: 100,
          }}
        >
          <div>
            <div className="micro" style={{ opacity: 0.55, marginBottom: 22 }}>
              — Process
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(56px, 7vw, 130px)",
                fontWeight: 300,
                lineHeight: 0.95,
                letterSpacing: "-0.018em",
                textTransform: "uppercase",
              }}
            >
              Process
            </h2>
          </div>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
              maxWidth: "54ch",
              justifySelf: "end",
              textAlign: "right",
            }}
          >
            Our process is designed to establish direction early, finalize
            decisions efficiently, and support the project through
            construction with clarity and consistency.
          </p>
        </div>

        <div style={{ display: "grid", gap: 0 }}>
          {PROCESS.map((step) => (
            <article
              key={step.n}
              style={{
                borderTop: "1px solid var(--hairline)",
                padding: "54px 0 60px",
                display: "grid",
                gridTemplateColumns: "160px 1fr 1.4fr",
                gap: 60,
                alignItems: "start",
              }}
            >
              <div
                className="serif"
                style={{
                  fontSize: "clamp(72px, 8vw, 120px)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 0.85,
                  letterSpacing: "-0.02em",
                  color: "var(--ink-soft)",
                  opacity: 0.45,
                }}
              >
                {step.n}
              </div>
              <div>
                <h3
                  className="serif"
                  style={{
                    fontSize: "clamp(28px, 2.6vw, 40px)",
                    fontWeight: 300,
                    lineHeight: 1.05,
                    letterSpacing: "-0.005em",
                    textTransform: "uppercase",
                  }}
                >
                  {step.h}
                </h3>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "var(--ink-soft)",
                    marginBottom: 20,
                  }}
                >
                  {step.p}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    display: "grid",
                    gap: 8,
                    marginBottom: step.footnote ? 18 : 0,
                  }}
                >
                  {step.bullets.map((b) => (
                    <li
                      key={b}
                      style={{
                        fontSize: 14.5,
                        lineHeight: 1.55,
                        color: "var(--ink)",
                        paddingLeft: 22,
                        position: "relative",
                      }}
                    >
                      <Dash />
                      {b}
                    </li>
                  ))}
                </ul>
                {step.footnote && (
                  <p
                    className="serif"
                    style={{
                      fontSize: 16,
                      fontStyle: "italic",
                      color: "var(--ink)",
                      lineHeight: 1.55,
                      maxWidth: "52ch",
                    }}
                  >
                    {step.footnote}
                  </p>
                )}
              </div>
            </article>
          ))}
          <div style={{ borderTop: "1px solid var(--hairline)" }} />
        </div>
      </section>

      {/* Working Together */}
      <section
        id="sec-working"
        style={{
          padding: "160px 8vw",
          borderBottom: "1px solid var(--hairline)",
          scrollMarginTop: 70,
        }}
      >
        <div style={{ marginBottom: 80 }}>
          <div className="micro" style={{ opacity: 0.55, marginBottom: 22 }}>
            — Working Together
          </div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(56px, 7vw, 130px)",
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.018em",
              textTransform: "uppercase",
              marginBottom: 38,
              maxWidth: "14ch",
              textWrap: "balance",
            }}
          >
            Working Together
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
              maxWidth: "58ch",
            }}
          >
            A clear and structured approach allows the project to move forward
            efficiently while maintaining alignment between client, builder,
            and design.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 90,
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0 60px",
            }}
          >
            {WORKING.map((w, i) => (
              <div
                key={w.h}
                style={{
                  borderTop: "1px solid var(--hairline)",
                  borderBottom:
                    i >= WORKING.length - 2
                      ? "1px solid var(--hairline)"
                      : "none",
                  padding: "28px 0 32px",
                }}
              >
                <h3
                  className="micro"
                  style={{ marginBottom: 16, letterSpacing: "0.22em" }}
                >
                  {w.h}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "var(--ink-soft)",
                  }}
                >
                  {w.p}
                </p>
                {w.note && (
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--ink)",
                      lineHeight: 1.6,
                    }}
                  >
                    — {w.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gap: 22,
              position: "sticky",
              top: 120,
            }}
          >
            <div
              style={{
                aspectRatio: "4/5",
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              style={{
                aspectRatio: "4/3",
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        </div>
      </section>

      {/* The Difference */}
      <section
        id="sec-difference"
        style={{
          padding: "160px 8vw",
          background: "rgba(42,46,37,0.04)",
          scrollMarginTop: 70,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 90,
            alignItems: "start",
            marginBottom: 90,
          }}
        >
          <div>
            <div className="micro" style={{ opacity: 0.55, marginBottom: 22 }}>
              — The Difference
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(56px, 7vw, 110px)",
                fontWeight: 300,
                lineHeight: 0.95,
                letterSpacing: "-0.018em",
                textTransform: "uppercase",
                marginBottom: 40,
              }}
            >
              The Difference
            </h2>
            <div
              style={{
                display: "grid",
                gap: 20,
                fontSize: 16.5,
                lineHeight: 1.75,
                color: "var(--ink-soft)",
                maxWidth: "46ch",
              }}
            >
              <p>
                A home is more than the sum of its selections, it&apos;s the
                result of thoughtful decisions made with intention and care.
              </p>
              <p>
                At Laurel Leaf Design Studio, each detail is considered in
                advance, allowing the design to unfold naturally and
                cohesively throughout the building process.
              </p>
            </div>
          </div>

          <div
            style={{
              aspectRatio: "5/4",
              backgroundImage:
                'url("https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=80")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div
          style={{
            padding: "54px 56px",
            background: "var(--bg)",
            border: "1px solid var(--hairline)",
          }}
        >
          <h3
            className="micro"
            style={{ marginBottom: 32, letterSpacing: "0.22em" }}
          >
            What Sets Our Process Apart
          </h3>
          <ul
            style={{
              listStyle: "none",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px 56px",
            }}
          >
            {DIFFERENCE_POINTS.map((p) => (
              <li
                key={p}
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "var(--ink)",
                  paddingLeft: 28,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "0.7em",
                    width: 16,
                    height: 1,
                    background: "var(--ink)",
                    opacity: 0.55,
                  }}
                />
                {p}
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: 50,
              paddingTop: 36,
              borderTop: "1px solid var(--hairline)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 50,
            }}
          >
            <div>
              <h4
                className="micro"
                style={{ marginBottom: 16, letterSpacing: "0.22em" }}
              >
                The Result
              </h4>
              <p
                style={{
                  fontSize: 15.5,
                  lineHeight: 1.7,
                  color: "var(--ink-soft)",
                }}
              >
                A home that feels collected, intentional, and distinctly
                yours, rooted in how you live and what you love.
              </p>
            </div>
            <div>
              <h4
                className="micro"
                style={{ marginBottom: 16, letterSpacing: "0.22em" }}
              >
                The Experience
              </h4>
              <p
                style={{
                  fontSize: 15.5,
                  lineHeight: 1.7,
                  color: "var(--ink-soft)",
                }}
              >
                A process that feels guided, organized, and thoughtfully
                handled from beginning to end.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 80,
            paddingTop: 50,
            borderTop: "1px solid var(--ink)",
            textAlign: "center",
          }}
        >
          <p
            className="serif"
            style={{
              fontSize: "clamp(24px, 2.6vw, 38px)",
              fontWeight: 300,
              lineHeight: 1.3,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              textWrap: "balance",
              maxWidth: "34ch",
              margin: "0 auto",
            }}
          >
            Thoughtful design. Clear direction. A home that feels entirely
            your own.
          </p>
        </div>
      </section>

      {/* Next Steps */}
      <section
        id="sec-next"
        style={{ padding: "160px 8vw 0", scrollMarginTop: 70 }}
      >
        <div className="micro" style={{ opacity: 0.55, marginBottom: 24 }}>
          — Next Steps
        </div>
        <h2
          className="serif"
          style={{
            fontSize: "clamp(56px, 7vw, 130px)",
            fontWeight: 300,
            lineHeight: 0.95,
            letterSpacing: "-0.018em",
            textTransform: "uppercase",
            marginBottom: 70,
          }}
        >
          Next Steps
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: 100,
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 22,
              fontSize: 17,
              lineHeight: 1.75,
              color: "var(--ink-soft)",
              maxWidth: "46ch",
            }}
          >
            <p>
              Creating a home is a thoughtful process, one that should feel
              both inspired and well guided from the very beginning.
            </p>
            <p>
              At Laurel Leaf Design Studio, we work closely with you and your
              builder to bring clarity to each decision, ensuring your home is
              not only beautiful, but fully considered and ready to be built.
            </p>

            <div
              style={{
                marginTop: 24,
                paddingTop: 30,
                borderTop: "1px solid var(--hairline)",
              }}
            >
              <h3
                className="micro"
                style={{ marginBottom: 22, letterSpacing: "0.22em" }}
              >
                Next Steps
              </h3>
              <ul style={{ listStyle: "none", display: "grid", gap: 14 }}>
                {[
                  "Initial design meeting to review your project and goals",
                  "Development of overall design direction",
                  "Progression into detailed selections and documentation",
                ].map((s, i) => (
                  <li
                    key={s}
                    className="serif"
                    style={{
                      fontSize: 21,
                      fontWeight: 300,
                      lineHeight: 1.4,
                      paddingLeft: 28,
                      position: "relative",
                      color: "var(--ink)",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "0.65em",
                        width: 18,
                        height: 1,
                        background: "var(--ink)",
                      }}
                    />
                    <span
                      className="micro-sm"
                      style={{ marginRight: 14, opacity: 0.55 }}
                    >
                      0{i + 1}
                    </span>
                    <em style={{ fontWeight: 300 }}>{s}</em>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            <div
              style={{
                aspectRatio: "4/5",
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              style={{
                aspectRatio: "4/5",
                marginTop: 60,
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "140px 8vw 180px",
          textAlign: "center",
          marginTop: 80,
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <div
          className="serif"
          style={{
            fontSize: "clamp(20px, 2vw, 28px)",
            fontStyle: "italic",
            fontWeight: 300,
            opacity: 0.7,
            marginBottom: 24,
          }}
        >
          Begin your project
        </div>
        <h2
          className="serif"
          style={{
            fontSize: "clamp(40px, 5vw, 72px)",
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.012em",
            maxWidth: "20ch",
            margin: "0 auto 50px",
            textWrap: "balance",
            textTransform: "uppercase",
          }}
        >
          Thoughtful design,{" "}
          <em style={{ fontWeight: 300, textTransform: "none" }}>
            carried through to completion.
          </em>
        </h2>
        <div
          style={{
            display: "inline-flex",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <a
            href="mailto:hello@laurelleaf.studio"
            className="micro"
            style={{
              padding: "14px 26px",
              border: "1px solid var(--ink)",
              borderRadius: 100,
            }}
          >
            Schedule an initial meeting
          </a>
          <Link
            href="/"
            className="micro"
            style={{ padding: "14px 22px", opacity: 0.6 }}
          >
            ↵ Back to Projects
          </Link>
        </div>
      </section>
    </div>
  );
}
