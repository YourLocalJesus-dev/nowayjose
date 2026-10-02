import React, { useState } from "react";
import { SDG11_CAD_SPECS, CAD_CHECKLIST_ITEMS } from "../data/cadData";
import { Terminal, CheckSquare, ArrowRight, CornerDownLeft, BookOpen, Layers } from "lucide-react";

interface CadEducationalProps {
  onOpenMap: (city?: string) => void;
  onOpenReport: () => void;
  onNavigateTab: (tab: "home" | "map" | "sdg11") => void;
}

export const CadEducational: React.FC<CadEducationalProps> = ({
  onOpenMap,
  onOpenReport,
  onNavigateTab
}) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ecomap_cad_tasks") || "[]");
    } catch {
      return [];
    }
  });

  const [cmdInput, setCmdInput] = useState("");
  const [cmdNotice, setCmdNotice] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      localStorage.setItem("ecomap_cad_tasks", JSON.stringify(next));
      return next;
    });
  };

  const totalCivicXp = completedTasks.reduce((sum, taskId) => {
    const item = CAD_CHECKLIST_ITEMS.find(c => c.id === taskId);
    return sum + (item ? item.impactXp : 0);
  }, 0);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const val = cmdInput.trim().toLowerCase();
    if (!val) return;

    if (val === "home" || val === "cli" || val === "terminal" || val === "exit") {
      onNavigateTab("home");
      return;
    }

    if (val === "report" || val === "new") {
      onOpenReport();
      return;
    }

    if (val === "map" || val.startsWith("map ")) {
      const parts = val.split(" ");
      const city = parts[1];
      onOpenMap(city);
      return;
    }

    const cityMatch = ["bengaluru", "delhi", "mumbai", "hyderabad", "chennai", "all"].find(c => val.includes(c));
    if (cityMatch) {
      onOpenMap(cityMatch);
      return;
    }

    setCmdNotice(`Unknown command '${val}'. Type 'map', 'report', or 'home'.`);
    setTimeout(() => setCmdNotice(null), 2500);
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1rem 3rem 1rem", fontFamily: "var(--font-mono)" }}>
      <div className="term-window" style={{ height: "auto", minHeight: "80vh", marginBottom: "2rem" }}>
        <div className="term-window-header">
          <div className="term-dots">
            <span className="term-dot red" />
            <span className="term-dot yellow" />
            <span className="term-dot green" />
          </div>
          <div className="term-title">
            <BookOpen size={12} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
            <span>man 1 sdg11 &mdash; UN Sustainable Development Goal 11 Specifications</span>
          </div>
          <div className="term-tabs">
            <button className="term-tab-btn" onClick={() => onNavigateTab("home")}>
              &gt;_ Console
            </button>
            <button className="term-tab-btn" onClick={() => onOpenMap()}>
              Spatial Map
            </button>
          </div>
        </div>

        <div style={{ padding: "1.5rem 2rem", background: "var(--term-bg)", color: "#c9d1d9", fontSize: "0.82rem", lineHeight: 1.6 }}>
          <div style={{ borderBottom: "1px solid var(--term-border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ color: "var(--term-cyan)", fontWeight: 700, fontSize: "0.9rem", marginBottom: "4px" }}>
              NAME
            </div>
            <div style={{ paddingLeft: "1.5rem", color: "#f0f6fc" }}>
              <strong>sdg11</strong> &mdash; United Nations Sustainable Development Goal 11: Make cities and human settlements inclusive, safe, resilient, and sustainable.
            </div>
          </div>

          <div style={{ borderBottom: "1px solid var(--term-border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ color: "var(--term-cyan)", fontWeight: 700, fontSize: "0.9rem", marginBottom: "4px" }}>
              SYNOPSIS
            </div>
            <div style={{ paddingLeft: "1.5rem", background: "#090d12", padding: "8px 12px", border: "1px solid var(--term-border)", color: "var(--term-green)", margin: "6px 0 6px 1.5rem" }}>
              ecomap-cli --target [11.1 | 11.2 | 11.6 | 11.7 | 11.B] --spatial-grid [WGS84] --city [bengaluru | delhi | mumbai | hyderabad | chennai]
            </div>
          </div>

          <div style={{ borderBottom: "1px solid var(--term-border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ color: "var(--term-cyan)", fontWeight: 700, fontSize: "0.9rem", marginBottom: "4px" }}>
              DESCRIPTION
            </div>
            <div style={{ paddingLeft: "1.5rem", color: "var(--text-dim)" }}>
              By 2050, over 70% of the world&apos;s population will reside in metropolitan urban areas. 
              Rapid unplanned urbanization places extreme stress on water channels, pedestrian rights-of-way, electrical infrastructure, and solid waste collection. 
              EcoMap Local translates UN SDG 11 engineering frameworks into crowdsourced, geodetically accurate workorders directly integrated with municipal agencies (BBMP, NDMC, BMC, GHMC, GCC).
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ color: "var(--term-cyan)", fontWeight: 700, fontSize: "0.9rem", marginBottom: "10px" }}>
              FRAMEWORK TARGETS & TECHNICAL SPECIFICATIONS
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px", paddingLeft: "1rem" }}>
              {SDG11_CAD_SPECS.map((spec) => (
                <div
                  key={spec.id}
                  style={{
                    background: "var(--term-panel)",
                    border: "1px solid var(--term-border)",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", borderBottom: "1px solid var(--term-border)", paddingBottom: "4px" }}>
                      <span style={{ color: "var(--term-cyan)", fontWeight: 700 }}>
                        [TARGET {spec.id}]
                      </span>
                      <span style={{ color: "var(--term-muted)", fontSize: "0.7rem" }}>
                        {spec.subsystem}
                      </span>
                    </div>

                    <h4 style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>
                      {spec.title}
                    </h4>

                    <div style={{ color: "var(--term-yellow)", fontSize: "0.7rem", marginBottom: "8px" }}>
                      Standard: {spec.engineeringStandard}
                    </div>

                    <p style={{ color: "var(--text-dim)", fontSize: "0.78rem", lineHeight: 1.5, marginBottom: "10px" }}>
                      {spec.description}
                    </p>

                    <div style={{ background: "#090d12", border: "1px solid var(--term-border)", padding: "6px 8px", marginBottom: "8px" }}>
                      <span style={{ color: "var(--term-muted)", fontSize: "0.68rem" }}>Global Metric: </span>
                      <span style={{ color: "var(--term-green)", fontSize: "0.72rem", fontWeight: 600 }}>{spec.metricsRatio}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #21262d", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.72rem", color: "#c9d1d9", maxWidth: "75%" }}>
                      <span style={{ color: "var(--term-cyan)" }}>Action: </span>
                      {spec.cadAction}
                    </div>
                    <button
                      className="term-chip"
                      onClick={() => onOpenMap()}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Map &gt;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--term-border)", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
              <div>
                <div style={{ color: "var(--term-cyan)", fontWeight: 700, fontSize: "0.9rem" }}>
                  LOCAL ACTION & COMMUNITY VERIFICATION CHECKLIST
                </div>
                <div style={{ color: "var(--term-muted)", fontSize: "0.72rem" }}>
                  Inspect and complete tasks in your local ward to build civic trust telemetry.
                </div>
              </div>

              <div style={{ background: "#090d12", border: "1px solid var(--term-green)", padding: "4px 12px", color: "var(--term-green)", fontWeight: 700, fontSize: "0.78rem" }}>
                [IMPACT TELEMETRY: {totalCivicXp} XP]
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {CAD_CHECKLIST_ITEMS.map((item) => {
                const isDone = completedTasks.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleTask(item.id)}
                    style={{
                      background: isDone ? "rgba(63, 185, 80, 0.08)" : "var(--term-panel)",
                      border: isDone ? "1px solid var(--term-green)" : "1px solid var(--term-border)",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: isDone ? "var(--term-green)" : "var(--term-muted)", fontWeight: 700 }}>
                        {isDone ? "[x]" : "[ ]"}
                      </span>
                      <div>
                        <div style={{ display: "flex", gap: "8px", fontSize: "0.68rem", color: "var(--term-muted)" }}>
                          <span>{item.componentCode}</span>
                          <span style={{ color: "var(--term-cyan)" }}>[{item.role}]</span>
                          <span>Tol: {item.cadTolerance}</span>
                        </div>
                        <div style={{ color: isDone ? "#fff" : "#c9d1d9", fontWeight: isDone ? 600 : 400, fontSize: "0.8rem" }}>
                          {item.taskTitle}
                        </div>
                        <div style={{ color: "var(--term-muted)", fontSize: "0.72rem" }}>
                          {item.specification}
                        </div>
                      </div>
                    </div>

                    <div style={{ color: isDone ? "var(--term-green)" : "var(--term-muted)", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                      +{item.impactXp} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#090d12", border: "1px solid var(--term-border)", padding: "10px 14px", marginTop: "1.5rem" }}>
            <form onSubmit={handleCommand} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--term-green)", fontWeight: 700 }}>
                sdg11-man:~$
              </span>
              <input
                type="text"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f0f6fc",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem"
                }}
                placeholder="Enter command ('map delhi', 'report', 'home')..."
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
              />
              <button
                type="submit"
                className="term-chip"
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span>EXEC</span>
                <CornerDownLeft size={10} />
              </button>
            </form>

            {cmdNotice && (
              <div style={{ color: "var(--term-yellow)", fontSize: "0.72rem", marginTop: "4px" }}>
                {cmdNotice}
              </div>
            )}

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px", paddingTop: "6px", borderTop: "1px solid #1c2128" }}>
              <span style={{ color: "var(--term-muted)", fontSize: "0.68rem" }}>JUMP TO:</span>
              <button className="term-chip" onClick={() => onNavigateTab("home")}>home</button>
              <button className="term-chip" onClick={() => onOpenMap()}>map</button>
              <button className="term-chip" onClick={() => onOpenMap("bengaluru")}>map bengaluru</button>
              <button className="term-chip" onClick={() => onOpenMap("delhi")}>map delhi</button>
              <button className="term-chip" onClick={() => onOpenMap("mumbai")}>map mumbai</button>
              <button className="term-chip" onClick={() => onOpenReport()}>report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
