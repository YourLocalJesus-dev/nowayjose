import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const CadManifesto: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const textEl = textRef.current;
    if (!section || !textEl) return;

    const rawText = `Cities are not static concrete monoliths. They are living, interconnected ecosystems. Every broken bike path, every unmonitored bioswale, and every blocked storm drain directly affects community well-being. EcoMap Local gives residents open mapping tools to document issues and celebrate local green assets. Building sustainable cities is not just a policy discussion; it is a shared map we draw together every day.`;

    const highlightWords = ["living,", "interconnected", "ecosystems.", "broken", "bike", "path,", "unmonitored", "bioswale,", "blocked", "storm", "drain", "community", "well-being.", "open", "mapping", "tools", "document", "issues", "celebrate", "green", "assets.", "sustainable", "cities", "shared", "map", "draw", "together"];
    
    const words = rawText.split(" ");
    textEl.innerHTML = words
      .map((w) => {
        const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
        const isHighlight = highlightWords.some(hw => hw.includes(clean) || clean.includes(hw));
        return `<span class="cad-word ${isHighlight ? 'highlight-term' : ''}">${w}</span>`;
      })
      .join(" ");

    const wordSpans = textEl.querySelectorAll(".cad-word");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 30%",
        scrub: 0.4
      }
    });

    tl.fromTo(wordSpans, 
      { opacity: 0.35 }, 
      { opacity: 1, stagger: 0.02, ease: "none" }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === section) t.kill();
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="full-page-section" id="manifesto">
      <div ref={containerRef} className="manifesto-schematic-container">
        <div className="cad-corner cad-corner-tl" />
        <div className="cad-corner cad-corner-tr" />
        <div className="cad-corner cad-corner-bl" />
        <div className="cad-corner cad-corner-br" />

        <div className="cad-block-header">
          <span>Project Manifesto</span>
          <span className="cad-dim-callout">UN SDG 11 Mission</span>
          <span>Community Standard</span>
        </div>

        <div ref={textRef} className="manifesto-wireframe-lines" />

        <div className="metric-delta-row" style={{ marginTop: "2rem", borderTop: "1px solid var(--border-cad)" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <span>Principles: <strong>Open Mapping, Local Action, Inclusive Cities</strong></span>
          </div>
          <div style={{ color: "var(--cad-blue)" }}>
            <span>UN SDG 11 Compliant</span>
          </div>
        </div>
      </div>
    </section>
  );
};
