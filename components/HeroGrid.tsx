"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/projects";
import { useScrollY } from "@/hooks/useScrollY";
import { GridCell } from "./GridCell";

type HeroGridProps = {
  projects: Project[];
  onOpen: (p: Project) => void;
};

export function HeroGrid({ projects, onOpen }: HeroGridProps) {
  const scrollY = useScrollY();
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const setSize = () => setVh(window.innerHeight);
    const raf = requestAnimationFrame(setSize);
    window.addEventListener("resize", setSize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  const row1 = projects.slice(0, 2);
  const row2 = projects[2];
  const row3 = projects.slice(3, 5);

  const dividerColor = "var(--divider-color)";
  const dividerThickness = 1;

  const vDiv = (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 0,
        bottom: 0,
        width: dividerThickness,
        background: dividerColor,
        zIndex: 5,
        transform: "translateX(-50%)",
      }}
    />
  );

  return (
    <section style={{ position: "relative", width: "100%" }}>
      {/* Row 1 */}
      <div
        style={{
          position: "relative",
          height: "100vh",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
        }}
      >
        {row1.map((p, i) => (
          <GridCell
            key={p.id}
            project={p}
            index={i}
            scrollY={scrollY}
            rowOffsetTop={0}
            onOpen={onOpen}
          />
        ))}
        {vDiv}
      </div>

      {/* Row 2 — full width */}
      <div
        style={{
          position: "relative",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr",
        }}
      >
        {row2 && (
          <GridCell
            project={row2}
            index={2}
            scrollY={scrollY}
            rowOffsetTop={vh}
            onOpen={onOpen}
          />
        )}
      </div>

      {/* Row 3 */}
      <div
        style={{
          position: "relative",
          height: "100vh",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
        }}
      >
        {row3.map((p, i) => (
          <GridCell
            key={p.id}
            project={p}
            index={3 + i}
            scrollY={scrollY}
            rowOffsetTop={vh * 2}
            onOpen={onOpen}
          />
        ))}
        {vDiv}

        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 36,
            zIndex: 20,
            color: "#F4F0E8",
            mixBlendMode: "difference",
          }}
        >
          <div className="micro-sm" style={{ opacity: 0.85 }}>
            Index of Projects · 07
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 36,
            zIndex: 20,
            color: "#F4F0E8",
            mixBlendMode: "difference",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span className="micro-sm">Continue</span>
          <div
            style={{
              width: 28,
              height: 1,
              background: "#F4F0E8",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "40%",
                background: "#F4F0E8",
                animation: "scroll-indic 2.4s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
