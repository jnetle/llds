"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/projects";
import { useScrollY } from "@/hooks/useScrollY";

type Props = {
  projects: Project[];
  onOpen: (p: Project) => void;
};

export function ProjectStrip({ projects, onOpen }: Props) {
  const stripRef = useRef<HTMLElement>(null);
  const scrollY = useScrollY();
  const [stripTop, setStripTop] = useState(0);
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      if (stripRef.current) {
        setStripTop(
          stripRef.current.getBoundingClientRect().top + window.scrollY,
        );
      }
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const offset = Math.max(0, (scrollY - stripTop + vh) * 0.15);

  return (
    <section
      ref={stripRef}
      style={{ padding: "60px 0 140px", overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "0 8vw 60px",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <h3
          className="serif"
          style={{
            fontSize: 36,
            fontWeight: 300,
            letterSpacing: "-0.005em",
          }}
        >
          More from the studio
        </h3>
        <button
          className="micro"
          style={{
            borderBottom: "1px solid currentColor",
            paddingBottom: 4,
          }}
        >
          Index of Works · ↗
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 32,
          padding: "0 8vw",
          transform: `translateX(${-offset * 0.6}px)`,
          transition: "transform 0.05s linear",
        }}
      >
        {[...projects, ...projects].map((p, i) => (
          <button
            key={`${p.id}-${i}`}
            onClick={() => onOpen(p)}
            style={{
              flex: "0 0 460px",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 580,
                backgroundImage: `url("${p.cover}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "all 0.6s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(1.05)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginTop: 18,
              }}
            >
              <div
                className="serif"
                style={{
                  fontSize: 22,
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                {p.title}
              </div>
              <div className="micro-sm" style={{ opacity: 0.5 }}>
                {p.year}
              </div>
            </div>
            <div
              className="micro-sm"
              style={{ marginTop: 6, opacity: 0.5 }}
            >
              {p.location}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
