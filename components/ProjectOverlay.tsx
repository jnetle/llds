"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { Project } from "@/lib/projects";

type Props = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectOverlay({ project, onClose }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const [opening, setOpening] = useState(true);

  useLayoutEffect(() => {
    if (!project) return;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setOpening(false));
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--bg)",
        overflowY: "auto",
        opacity: opening ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 36px",
          background: "var(--bg)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div className="micro" style={{ opacity: 0.6 }}>
          {project.discipline}
        </div>
        <button
          onClick={onClose}
          className="micro"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>×</span> Close
        </button>
      </div>

      {/* Hero image */}
      <div
        style={{
          height: "85vh",
          backgroundImage: `url("${project.gallery[imgIndex]}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: opening ? "scale(1.05)" : "scale(1)",
          transition:
            "transform 1.2s cubic-bezier(.22,.61,.36,1), background-image 0.6s ease",
        }}
      />

      {/* Title block */}
      <div
        style={{
          padding: "100px 8vw",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <div
          className="micro"
          style={{ opacity: 0.55, marginBottom: 28 }}
        >
          {project.location} · {project.year}
        </div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(48px, 7vw, 110px)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 0.98,
            letterSpacing: "-0.012em",
            maxWidth: "14ch",
          }}
        >
          {project.title}
        </h1>
        <p
          style={{
            marginTop: 60,
            fontSize: 19,
            lineHeight: 1.7,
            color: "var(--ink-soft)",
            maxWidth: "52ch",
          }}
        >
          {project.intro}
        </p>
      </div>

      {/* Palette */}
      <div
        style={{
          padding: "0 8vw 80px",
          display: "flex",
          alignItems: "center",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        <div className="micro" style={{ opacity: 0.5 }}>
          Material Palette
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {project.palette.map((c) => (
            <div
              key={c}
              style={{
                width: 64,
                height: 64,
                background: c,
                borderRadius: "50%",
              }}
            />
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div
        style={{
          padding: "0 8vw 120px",
          display: "grid",
          gap: 24,
        }}
      >
        {project.gallery.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setImgIndex(i)}
            style={{
              cursor: "pointer",
              textAlign: "left",
              padding: 0,
              background: "none",
              border: "none",
            }}
          >
            <div
              style={{
                height: i === 1 ? "60vh" : "80vh",
                backgroundImage: `url("${src}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="micro-sm"
              style={{ marginTop: 12, opacity: 0.5 }}
            >
              Plate 0{i + 1} · {project.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
