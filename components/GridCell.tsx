"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects";

type GridCellProps = {
  project: Project;
  index: number;
  scrollY: number;
  rowOffsetTop: number;
  onOpen: (p: Project) => void;
};

export function GridCell({
  project,
  index,
  scrollY,
  rowOffsetTop,
  onOpen,
}: GridCellProps) {
  const [hovered, setHovered] = useState(false);

  const localScroll = scrollY - rowOffsetTop;
  const parallaxOffset = localScroll * (0.08 + (index % 2) * 0.03);
  const imgTransform = hovered ? "scale(1.08)" : "scale(1.02)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(project)}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        background: "#1a1a1a",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          backgroundImage: `url("${project.cover}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `${imgTransform} translateY(${-parallaxOffset}px)`,
          transition:
            "transform 0.9s cubic-bezier(.22,.61,.36,1), filter 0.6s ease",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          bottom: 64,
          color: "#F4F0E8",
          transform: hovered ? "translateY(0)" : "translateY(20px)",
          opacity: hovered ? 1 : 0.85,
          transition:
            "transform 0.6s cubic-bezier(.22,.61,.36,1), opacity 0.6s ease",
          pointerEvents: "none",
        }}
      >
        <div
          className="micro-sm"
          style={{ opacity: 0.75, marginBottom: 10 }}
        >
          {project.location} · {project.year}
        </div>
        <h2
          className="serif"
          style={{
            fontSize: "clamp(28px, 3.6vw, 56px)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1.0,
            letterSpacing: "-0.005em",
            textWrap: "pretty",
          }}
        >
          {project.title}
        </h2>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "transform 0.5s ease 0.1s, opacity 0.5s ease 0.1s",
          }}
        >
          <span className="micro" style={{ fontSize: 10 }}>
            View Project
          </span>
          <svg width="32" height="8" viewBox="0 0 32 8" fill="none">
            <path
              d="M0 4 H30 M26 1 L30 4 L26 7"
              stroke="#F4F0E8"
              strokeWidth="0.8"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
