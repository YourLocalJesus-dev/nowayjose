import React, { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INITIAL_CAD_REPORTS } from "./data/cadData";
import { CadReportItem } from "./types";
import { TerminalConsole } from "./components/TerminalConsole";
import { CadManifesto } from "./components/CadManifesto";
import { CadMapDashboard } from "./components/CadMapDashboard";
import { CadReportModal } from "./components/CadReportModal";
import { CadEducational } from "./components/CadEducational";
import { Plus, ArrowRight, MapPin, Grid, Compass, Terminal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<"home" | "map" | "sdg11">("home");
  const [reports, setReports] = useState<CadReportItem[]>(() => {
    try {
      const saved = localStorage.getItem("ecomap_cad_reports");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CAD_REPORTS;
  });
  const [selectedReportId, setSelectedReportId] = useState<string | null>("REP-8041");
  const [selectedCityForMap, setSelectedCityForMap] = useState<string>("bengaluru");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [liveClock, setLiveClock] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem("ecomap_cad_reports", JSON.stringify(reports));
    } catch {}
  }, [reports]);
  const [verifiedReportIds, setVerifiedReportIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ecomap_verified_reports") || "[]");
    } catch {
      return [];
    }
  });

  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorReticleRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveClock(now.toTimeString().split(" ")[0]);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isReportModalOpen) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [isReportModalOpen]);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === "1") handleNavClick("home");
      else if (e.key === "2") handleNavClick("map");
      else if (e.key === "3") handleNavClick("sdg11");
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const dot = cursorDotRef.current;
    const reticle = cursorReticleRef.current;
    if (!dot || !reticle) return;

    if (window.matchMedia("(pointer: coarse)").matches) {
      dot.style.display = "none";
      reticle.style.display = "none";
      return;
    }

    const moveHandler = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.04, ease: "none" });
      gsap.to(reticle, { x: e.clientX, y: e.clientY, duration: 0.12, ease: "power2.out" });

      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, select, input, textarea, .cad-block, .cad-feed-item, .term-chip, .term-choice-btn")) {
        reticle.classList.add("active");
      } else {
        reticle.classList.remove("active");
      }
    };

    window.addEventListener("mousemove", moveHandler);
    return () => window.removeEventListener("mousemove", moveHandler);
  }, []);

  const handleAddNewReport = (newReport: CadReportItem) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReportId(newReport.id);
  };

  const handleUpvote = (id: string) => {
    const isAlreadyVerified = verifiedReportIds.includes(id);
    const updatedIds = isAlreadyVerified
      ? verifiedReportIds.filter(vId => vId !== id)
      : [...verifiedReportIds, id];

    setVerifiedReportIds(updatedIds);
    localStorage.setItem("ecomap_verified_reports", JSON.stringify(updatedIds));

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            upvotes: isAlreadyVerified ? Math.max(0, r.upvotes - 1) : r.upvotes + 1
          };
        }
        return r;
      })
    );
  };

  const handleNavClick = (view: "home" | "map" | "sdg11") => {
    setCurrentView(view);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleOpenMap = (city?: string) => {
    if (city) {
      setSelectedCityForMap(city);
    }
    setCurrentView("map");
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <div ref={cursorDotRef} className="cad-cursor-dot" />
      <div ref={cursorReticleRef} className="cad-cursor-reticle" />

      <div className="term-system-bar">
        <div className="term-sys-left">
          <div className="term-dots">
            <span className="term-dot red" />
            <span className="term-dot yellow" />
            <span className="term-dot green" />
          </div>
          <span className="term-sys-prompt">ecomap@urban-ops:~$</span>
          <span className="term-sys-sep">|</span>
          <button
            className={`term-sys-btn ${currentView === "home" ? "active" : ""}`}
            onClick={() => handleNavClick("home")}
          >
            [1: console]
          </button>
          <button
            className={`term-sys-btn ${currentView === "map" ? "active" : ""}`}
            onClick={() => handleNavClick("map")}
          >
            [2: spatial-map]
          </button>
          <button
            className={`term-sys-btn ${currentView === "sdg11" ? "active" : ""}`}
            onClick={() => handleNavClick("sdg11")}
          >
            [3: man-sdg11]
          </button>
        </div>

        <div className="term-sys-center">
          <span className="term-sys-active-cmd">
            {currentView === "home" ? "/bin/ecomap-cli (active)" : currentView === "map" ? `/usr/bin/gis-map [city: ${selectedCityForMap.toUpperCase()}]` : "/usr/share/man/sdg11.1"}
          </span>
        </div>

        <div className="term-sys-right">
          <button
            className="term-chip"
            style={{ fontSize: "0.68rem" }}
            onClick={() => setIsReportModalOpen(true)}
          >
            + report
          </button>
          <span className="term-sys-sep">|</span>
          <span className="term-sys-clock">{liveClock}</span>
        </div>
      </div>

      {currentView === "home" && (
        <main className="cad-view-wrapper">
          <section className="full-page-section hero-cad-section">
            <div className="hero-left-content">
              <div className="cad-sector-tag">
                <span className="pulse-dot" />
                <span>UN SDG 11 • Municipal Command Workstation</span>
              </div>

              <h1 className="hero-schematic-title">
                Civic Terminal for <span className="cyan-stroke">Sustainable Cities.</span>
              </h1>

              <p className="hero-technical-desc">
                EcoMap Local is a spatial terminal system connecting neighborhood residents with municipal public works. 
                Execute commands to open Indian city maps, dispatch civic repair workorders directly inside the terminal, and monitor decentralized urban green infrastructure.
              </p>

              <div className="hero-actions-row">
                <button
                  className="btn-cad btn-cad-primary"
                  style={{ padding: "10px 20px" }}
                  onClick={() => handleOpenMap()}
                >
                  <span>Open Spatial Map</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  className="btn-cad"
                  style={{ padding: "10px 18px" }}
                  onClick={() => setIsReportModalOpen(true)}
                >
                  <span>+ File Workorder</span>
                </button>
              </div>

              <div className="dimension-ruler" style={{ marginTop: "1rem" }}>
                <span className="dimension-text">Terminal Daemon: bash 5.2 // WGS84 Geodetic Node Active</span>
              </div>
            </div>

            <TerminalConsole
              reports={reports}
              verifiedReportIds={verifiedReportIds}
              onOpenMap={handleOpenMap}
              onAddReport={handleAddNewReport}
              onSelectReport={(id) => {
                setSelectedReportId(id);
                handleOpenMap();
              }}
              onUpvoteReport={handleUpvote}
              onNavigateTab={handleNavClick}
            />
          </section>

          <section className="full-page-section">
            <div className="cad-section-header">
              <div>
                <span className="cad-sector-tag">Community Statistics</span>
                <h2 className="cad-section-title">Measurable Community Progress</h2>
              </div>
              <div className="cad-section-sub">
                Live metrics aggregated from participating municipal districts
              </div>
            </div>

            <div className="cad-metrics-grid">
              <div className="cad-block">
                <div className="cad-corner cad-corner-tl" />
                <div className="cad-corner cad-corner-tr" />
                <div className="cad-corner cad-corner-bl" />
                <div className="cad-corner cad-corner-br" />

                <div className="cad-block-header">
                  <span>Active Network</span>
                  <span className="cad-dim-callout">+24% YoY</span>
                </div>
                <div className="metric-num-cad">142+</div>
                <h3 style={{ fontFamily: "var(--font-cad)", fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>
                  Active Cities and Wards
                </h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.55 }}>
                  Metropolitan spatial areas currently accepting crowdsourced reports into public works queues.
                </p>
                <div className="metric-delta-row">
                  <span>Coverage Rate</span>
                  <span style={{ color: "var(--cad-blue)" }}>84% Complete</span>
                </div>
              </div>

              <div className="cad-block">
                <div className="cad-corner cad-corner-tl" />
                <div className="cad-corner cad-corner-tr" />
                <div className="cad-corner cad-corner-bl" />
                <div className="cad-corner cad-corner-br" />

                <div className="cad-block-header">
                  <span>Repairs Completed</span>
                  <span className="cad-dim-callout" style={{ color: "var(--cad-green)" }}>92% Resolved</span>
                </div>
                <div className="metric-num-cad">28,490+</div>
                <h3 style={{ fontFamily: "var(--font-cad)", fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>
                  Neighborhood Issues Fixed
                </h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.55 }}>
                  Damaged bike lanes resurfaced, blocked storm drains cleared, and broken transit shelters repaired.
                </p>
                <div className="metric-delta-row">
                  <span>Average Time</span>
                  <span style={{ color: "var(--cad-green)" }}>38 Hours</span>
                </div>
              </div>

              <div className="cad-block">
                <div className="cad-corner cad-corner-tl" />
                <div className="cad-corner cad-corner-tr" />
                <div className="cad-corner cad-corner-bl" />
                <div className="cad-corner cad-corner-br" />

                <div className="cad-block-header">
                  <span>Natural Assets</span>
                  <span className="cad-dim-callout">Verified Canopy</span>
                </div>
                <div className="metric-num-cad">1,280+</div>
                <h3 style={{ fontFamily: "var(--font-cad)", fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>
                  Eco-Assets & Bioswales Mapped
                </h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.55 }}>
                  Rainwater infiltration swales, community gardens, and solar micro-grids added to open city maps.
                </p>
                <div className="metric-delta-row">
                  <span>Heat Island Impact</span>
                  <span style={{ color: "var(--cad-blue)" }}>-4.2°C Measured</span>
                </div>
              </div>
            </div>
          </section>

          <CadManifesto />

          <section className="full-page-section">
            <div className="cad-section-header">
              <div>
                <span className="cad-sector-tag">Urban Growth</span>
                <h2 className="cad-section-title">Why SDG 11 Matters for Living Cities</h2>
              </div>
              <div className="cad-section-sub">
                Sustainable urban development fundamentals
              </div>
            </div>

            <div className="why-cad-grid">
              <div className="cad-block">
                <div className="cad-corner cad-corner-tl" />
                <div className="cad-corner cad-corner-tr" />
                <div className="cad-corner cad-corner-bl" />
                <div className="cad-corner cad-corner-br" />

                <div className="cad-block-header">
                  <span>Climate Adaptation</span>
                  <span className="cad-dim-callout">Target 11.B</span>
                </div>
                <div className="dimension-ruler">
                  <span className="dimension-text">Drainage Capacity: 1200 L/s</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-cad)", fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
                  Climate-Resilient Drainage
                </h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  Unmonitored catch basins and non-porous asphalt surfaces compound flash flood damage. 
                  By crowdsourcing early maintenance flags, cities save millions in post-disaster reconstruction.
                </p>
                <div className="metric-delta-row">
                  <span>Economic Return</span>
                  <span style={{ color: "var(--cad-blue)", fontWeight: 600 }}>$1 Invested = $7 Saved</span>
                </div>
              </div>

              <div className="cad-block">
                <div className="cad-corner cad-corner-tl" />
                <div className="cad-corner cad-corner-tr" />
                <div className="cad-corner cad-corner-bl" />
                <div className="cad-corner cad-corner-br" />

                <div className="cad-block-header">
                  <span>Clean Mobility</span>
                  <span className="cad-dim-callout">Target 11.2</span>
                </div>
                <div className="dimension-ruler">
                  <span className="dimension-text">Transit Access: 51.6%</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-cad)", fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
                  Safe Cycling & Walking
                </h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  Streets dominated solely by automobiles degrade air quality and isolate commuters. 
                  Logging bike-lane trenches and missing sidewalk ramps accelerates street redesign.
                </p>
                <div className="metric-delta-row">
                  <span>Safety Objective</span>
                  <span style={{ color: "var(--cad-blue)", fontWeight: 600 }}>Zero Traffic Casualties</span>
                </div>
              </div>

              <div className="cad-block">
                <div className="cad-corner cad-corner-tl" />
                <div className="cad-corner cad-corner-tr" />
                <div className="cad-corner cad-corner-bl" />
                <div className="cad-corner cad-corner-br" />

                <div className="cad-block-header">
                  <span>Circular Ecology</span>
                  <span className="cad-dim-callout">Target 11.7</span>
                </div>
                <div className="dimension-ruler">
                  <span className="dimension-text">Local Composting: 95%</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-cad)", fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
                  Decentralized Green Assets
                </h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  Neighborhood solar storage nodes, rainwater gardens, and local composting hubs make 
                  blocks self-sustaining while cutting municipal waste collection costs by over 40%.
                </p>
                <div className="metric-delta-row">
                  <span>Green Canopy Growth</span>
                  <span style={{ color: "var(--cad-green)", fontWeight: 600 }}>+34% Tree Coverage</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {currentView === "map" && (
        <div className="cad-view-wrapper">
          <CadMapDashboard
            reports={reports}
            selectedReportId={selectedReportId}
            verifiedReportIds={verifiedReportIds}
            initialCity={selectedCityForMap}
            onSelectReport={(id) => setSelectedReportId(id)}
            onUpvoteReport={handleUpvote}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenTerminal={() => handleNavClick("home")}
          />
        </div>
      )}

      {currentView === "sdg11" && (
        <div className="cad-view-wrapper">
          <CadEducational
            onOpenMap={handleOpenMap}
            onOpenReport={() => setIsReportModalOpen(true)}
            onNavigateTab={handleNavClick}
          />
        </div>
      )}

      <CadReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onAddReport={handleAddNewReport}
      />

      <footer style={{ background: "#090d12", borderTop: "1px solid var(--term-border)", padding: "1rem 1.5rem", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--term-muted)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: "var(--term-green)", fontWeight: 700 }}>ecomap-terminal-v2.4.0</span>
          <span>•</span>
          <span>WGS84 EPSG:3857</span>
          <span>•</span>
          <span>OpenStreetMap &copy; CC-BY-SA</span>
          <span>•</span>
          <span>Hotkeys: [1] Console [2] Map [3] SDG11</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="term-chip" onClick={() => handleNavClick("home")}>[1] console</button>
          <button className="term-chip" onClick={() => handleNavClick("map")}>[2] spatial map</button>
          <button className="term-chip" onClick={() => handleNavClick("sdg11")}>[3] man sdg11</button>
          <button className="term-chip" onClick={() => setIsReportModalOpen(true)}>+ report issue</button>
        </div>
      </footer>
    </>
  );
};
