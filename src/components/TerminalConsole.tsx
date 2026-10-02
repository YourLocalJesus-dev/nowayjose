import React, { useState, useEffect, useRef } from "react";
import { CadReportItem, IssueCategory, UrgencyLevel } from "../types";
import { Terminal, Send, CornerDownLeft, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, Compass } from "lucide-react";

interface TerminalConsoleProps {
  reports: CadReportItem[];
  verifiedReportIds: string[];
  onOpenMap: (city?: string) => void;
  onAddReport: (newReport: CadReportItem) => void;
  onSelectReport: (id: string) => void;
  onUpvoteReport: (id: string) => void;
  onNavigateTab: (tab: "home" | "map" | "sdg11") => void;
}

interface TerminalLine {
  id: string;
  type: "input" | "stdout" | "stderr" | "success" | "banner" | "table";
  text?: string;
  customNode?: React.ReactNode;
  timestamp: string;
}

interface ReportWizardState {
  step: number;
  title: string;
  city: string;
  category: IssueCategory;
  location: string;
  urgency: UrgencyLevel;
  diagnosis: string;
}

const CITY_METAS: Record<string, { name: string; sector: string; coords: [number, number]; defaultLoc: string }> = {
  bengaluru: { name: "Bengaluru", sector: "Bengaluru Central Ward", coords: [12.9716, 77.5946], defaultLoc: "MG Road & Brigade Road, Bengaluru" },
  delhi: { name: "New Delhi", sector: "New Delhi NDMC Zone", coords: [28.6139, 77.2090], defaultLoc: "Connaught Place Inner Circle, New Delhi" },
  mumbai: { name: "Mumbai", sector: "Mumbai Central Ward", coords: [19.0760, 72.8777], defaultLoc: "Dadar TT Circle, Mumbai" },
  hyderabad: { name: "Hyderabad", sector: "Hyderabad GHMC Zone", coords: [17.3850, 78.4867], defaultLoc: "Cyber Towers Junction, Madhapur, Hyderabad" },
  chennai: { name: "Chennai", sector: "Chennai GCC Zone", coords: [13.0827, 80.2707], defaultLoc: "T. Nagar CMBT Hub, Chennai" }
};

const getNowTime = () => {
  const d = new Date();
  return d.toTimeString().split(" ")[0];
};

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  reports,
  verifiedReportIds,
  onOpenMap,
  onAddReport,
  onSelectReport,
  onUpvoteReport,
  onNavigateTab
}) => {
  const [activeMode, setActiveMode] = useState<"cli" | "form">("cli");
  const [inputVal, setInputVal] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [wizard, setWizard] = useState<ReportWizardState | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formCity, setFormCity] = useState("bengaluru");
  const [formCategory, setFormCategory] = useState<IssueCategory>("infrastructure");
  const [formLocation, setFormLocation] = useState("");
  const [formUrgency, setFormUrgency] = useState<UrgencyLevel>("LVL_2_MODERATE");
  const [formDiagnosis, setFormDiagnosis] = useState("");
  const [formSubmittedMsg, setFormSubmittedMsg] = useState<string | null>(null);

  const terminalBodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "init-1",
      type: "banner",
      timestamp: getNowTime(),
      customNode: (
        <div className="term-welcome-box">
          <div className="term-banner-ascii">
{`   _____ _____ ____  __  __          _____    _      ____   _____          _      
  | ____/ ____/ __ \\|  \\/  |   /\\   |  __ \\  | |    / __ \\ / ____|   /\\   | |     
  | |__| |   | |  | | \\  / |  /  \\  | |__) | | |   | |  | | |       /  \\  | |     
  |  __| |   | |  | | |\\/| | / /\\ \\ |  ___/  | |   | |  | | |      / /\\ \\ | |     
  | |___| |___| |__| | |  | |/ ____ \\| |      | |___| |__| | |____ / ____ \\| |____ 
  |______\\_____\\____/|_|  |_/_/    \\_\\_|      |______\\____/ \\_____/_/    \\_\\______|`}
          </div>
          <div className="term-sys-info">
            <span>EcoMap OS v2.4.0-release</span>
            <span> • </span>
            <span style={{ color: "var(--term-cyan)" }}>GIS: CARTO Engine (API Key Active)</span>
            <span> • </span>
            <span style={{ color: "var(--term-green)" }}>Sensors: LIVE</span>
          </div>
          <div className="term-hint-line">
            Type <span className="term-cmd-key">map</span> to open spatial GIS view, <span className="term-cmd-key">report</span> to file an issue, or <span className="term-cmd-key">help</span> for all commands.
          </div>
        </div>
      )
    }
  ]);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [lines, wizard]);

  const addLine = (line: Omit<TerminalLine, "id" | "timestamp">) => {
    setLines((prev) => [
      ...prev,
      {
        ...line,
        id: `line-${Date.now()}-${Math.random()}`,
        timestamp: getNowTime()
      }
    ]);
  };

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed && !wizard) return;

    addLine({
      type: "input",
      text: wizard ? `${getPromptPrefix()} ${trimmed}` : trimmed
    });

    if (trimmed && (!commandHistory.length || commandHistory[commandHistory.length - 1] !== trimmed)) {
      setCommandHistory((prev) => [...prev, trimmed]);
    }
    setHistoryPointer(-1);

    if (wizard) {
      handleWizardInput(trimmed);
      return;
    }

    const parts = trimmed.split(" ");
    const root = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").trim();

    switch (root) {
      case "help":
      case "?":
        renderHelp();
        break;

      case "clear":
      case "cls":
        setLines([]);
        break;

      case "map":
      case "maps":
      case "goto":
      case "open":
        handleMapCommand(arg);
        break;

      case "report":
      case "new":
      case "create":
        startReportWizard();
        break;

      case "list":
      case "reports":
      case "ls":
        renderReportList(arg);
        break;

      case "inspect":
      case "cat":
      case "view":
        handleInspect(arg);
        break;

      case "verify":
      case "upvote":
        handleVerify(arg);
        break;

      case "cities":
        renderCities();
        break;

      case "stats":
        renderStats();
        break;

      case "sdg11":
      case "sdg":
        renderSdg();
        break;

      case "api":
      case "carto":
      case "env":
      case "telemetry":
        renderApiStatus();
        break;

      case "track":
      case "gps":
      case "locate":
        onOpenMap();
        addLine({
          type: "stdout",
          text: "[GPS] Navigating to spatial GIS map with Live Real-Time Tracking active."
        });
        break;

      case "fleet":
      case "crews":
      case "dispatches":
        renderFleetStatus();
        break;

      case "home":
        onNavigateTab("home");
        addLine({
          type: "stdout",
          text: "[OK] Switched view to Home."
        });
        break;

      default:
        addLine({
          type: "stderr",
          text: `Command not found: '${trimmed}'. Type 'help' to inspect available instructions.`
        });
        break;
    }
  };

  const handleMapCommand = (arg: string) => {
    const cleanArg = arg.toLowerCase().replace("map", "").trim();
    const validCities = ["bengaluru", "delhi", "mumbai", "hyderabad", "chennai", "all"];
    
    let targetCity = "bengaluru";
    if (cleanArg) {
      const match = validCities.find(c => cleanArg.includes(c));
      if (match) {
        targetCity = match;
      }
    }

    addLine({
      type: "success",
      customNode: (
        <div style={{ padding: "4px 0" }}>
          <div>[EXEC] Initializing Leaflet Spatial Subsystem...</div>
          <div>[OK] Datum locked to WGS84 [EPSG:3857]</div>
          <div style={{ color: "var(--term-green)" }}>
            [OK] Navigating to Map Dashboard &mdash; Target: {targetCity.toUpperCase()}
          </div>
        </div>
      )
    });

    setTimeout(() => {
      onOpenMap(targetCity);
    }, 350);
  };

  const startReportWizard = () => {
    setWizard({
      step: 1,
      title: "",
      city: "bengaluru",
      category: "infrastructure",
      location: "",
      urgency: "LVL_2_MODERATE",
      diagnosis: ""
    });

    addLine({
      type: "stdout",
      customNode: (
        <div className="term-wizard-box">
          <div style={{ color: "var(--term-cyan)", fontWeight: 700, marginBottom: "4px" }}>
            [MUNICIPAL REPORT WIZARD — INITIALIZED]
          </div>
          <div style={{ color: "var(--term-muted)", fontSize: "0.75rem", marginBottom: "8px" }}>
            Step 1 of 6 &bull; Type your response at prompt or type 'cancel' to exit.
          </div>
          <div style={{ color: "#fff" }}>
            ❯ Enter Issue Title (e.g. Broken pavement along 100 Feet Road):
          </div>
        </div>
      )
    });
  };

  const handleWizardInput = (val: string) => {
    if (!wizard) return;

    if (val.toLowerCase() === "cancel" || val.toLowerCase() === "exit") {
      setWizard(null);
      addLine({
        type: "stdout",
        text: "[ABORTED] Report wizard terminated. No workorder logged."
      });
      return;
    }

    const step = wizard.step;

    if (step === 1) {
      if (!val) {
        addLine({ type: "stderr", text: "Title cannot be empty. Please enter issue title:" });
        return;
      }
      setWizard({ ...wizard, step: 2, title: val });
      addLine({
        type: "stdout",
        customNode: (
          <div style={{ marginTop: "4px" }}>
            <div style={{ color: "var(--term-muted)", fontSize: "0.75rem" }}>Step 2 of 6</div>
            <div style={{ color: "#fff" }}>
              ❯ Select City [1: Bengaluru | 2: Delhi | 3: Mumbai | 4: Hyderabad | 5: Chennai]:
            </div>
          </div>
        )
      });
      return;
    }

    if (step === 2) {
      let cityKey = "bengaluru";
      const low = val.toLowerCase();
      if (low === "2" || low.includes("delhi")) cityKey = "delhi";
      else if (low === "3" || low.includes("mumbai")) cityKey = "mumbai";
      else if (low === "4" || low.includes("hyderabad")) cityKey = "hyderabad";
      else if (low === "5" || low.includes("chennai")) cityKey = "chennai";

      setWizard({ ...wizard, step: 3, city: cityKey });
      addLine({
        type: "stdout",
        customNode: (
          <div style={{ marginTop: "4px" }}>
            <div style={{ color: "var(--term-muted)", fontSize: "0.75rem" }}>Step 3 of 6</div>
            <div style={{ color: "#fff" }}>
              ❯ Select Category [1: Infrastructure | 2: Eco-Assets | 3: Waste | 4: Mobility | 5: Water]:
            </div>
          </div>
        )
      });
      return;
    }

    if (step === 3) {
      let cat: IssueCategory = "infrastructure";
      const low = val.toLowerCase();
      if (low === "2" || low.includes("eco")) cat = "eco-assets";
      else if (low === "3" || low.includes("waste")) cat = "waste";
      else if (low === "4" || low.includes("mobility") || low.includes("transit")) cat = "mobility";
      else if (low === "5" || low.includes("water") || low.includes("drain")) cat = "water";

      setWizard({ ...wizard, step: 4, category: cat });
      addLine({
        type: "stdout",
        customNode: (
          <div style={{ marginTop: "4px" }}>
            <div style={{ color: "var(--term-muted)", fontSize: "0.75rem" }}>Step 4 of 6</div>
            <div style={{ color: "#fff" }}>
              ❯ Enter Street Location / Landmark (or press Enter for city center):
            </div>
          </div>
        )
      });
      return;
    }

    if (step === 4) {
      const meta = CITY_METAS[wizard.city] || CITY_METAS.bengaluru;
      const loc = val.trim() || meta.defaultLoc;

      setWizard({ ...wizard, step: 5, location: loc });
      addLine({
        type: "stdout",
        customNode: (
          <div style={{ marginTop: "4px" }}>
            <div style={{ color: "var(--term-muted)", fontSize: "0.75rem" }}>Step 5 of 6</div>
            <div style={{ color: "#fff" }}>
              ❯ Priority Level [1: Low | 2: Medium | 3: High | 4: Critical]:
            </div>
          </div>
        )
      });
      return;
    }

    if (step === 5) {
      let urg: UrgencyLevel = "LVL_2_MODERATE";
      const low = val.toLowerCase();
      if (low === "1" || low.includes("low")) urg = "LVL_1_NOMINAL";
      else if (low === "3" || low.includes("high")) urg = "LVL_3_ELEVATED";
      else if (low === "4" || low.includes("crit")) urg = "LVL_4_CRITICAL";

      setWizard({ ...wizard, step: 6, urgency: urg });
      addLine({
        type: "stdout",
        customNode: (
          <div style={{ marginTop: "4px" }}>
            <div style={{ color: "var(--term-muted)", fontSize: "0.75rem" }}>Step 6 of 6</div>
            <div style={{ color: "#fff" }}>
              ❯ Observations / Diagnosis Details (optional, or press Enter):
            </div>
          </div>
        )
      });
      return;
    }

    if (step === 6) {
      const diag = val.trim() || "Report dispatched via EcoMap CLI workstation terminal.";
      const currentWizard = { ...wizard, diagnosis: diag };

      const meta = CITY_METAS[currentWizard.city] || CITY_METAS.bengaluru;
      let finalLoc = currentWizard.location;
      if (!finalLoc.toLowerCase().includes(meta.name.toLowerCase())) {
        finalLoc = `${finalLoc}, ${meta.name}`;
      }

      const generatedId = `REP-${Math.floor(8300 + Math.random() * 600)}`;
      const newReport: CadReportItem = {
        id: generatedId,
        specCode: "SDG 11 / Terminal Submission",
        title: currentWizard.title,
        category: currentWizard.category,
        categoryLabel: currentWizard.category === "infrastructure" ? "Infrastructure" : currentWizard.category === "eco-assets" ? "Eco-Asset" : currentWizard.category === "waste" ? "Waste & Recycling" : currentWizard.category === "mobility" ? "Clean Mobility" : "Water Drainage",
        status: "INVESTIGATING",
        urgency: currentWizard.urgency,
        gridSector: meta.sector,
        location: finalLoc,
        coords: meta.coords,
        reportedTime: "Just now",
        upvotes: 1,
        reporterId: "Terminal Operator",
        structuralDiagnosis: diag,
        toleranceDelta: "Status: Logged into City Queue",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        blueprintDim: "Grid Survey Pending",
        actions: [
          { timestamp: "Just now", txCode: "TX-CLI", operation: "Workorder dispatched via terminal session", nodeOperator: "EcoMap CLI Gateway" }
        ]
      };

      onAddReport(newReport);
      setWizard(null);

      addLine({
        type: "success",
        customNode: (
          <div className="term-success-receipt">
            <div style={{ color: "var(--term-green)", fontWeight: 700, fontSize: "0.9rem" }}>
              ✓ WORKORDER {generatedId} COMPILED & DISPATCHED
            </div>
            <div style={{ color: "var(--term-muted)", marginTop: "4px" }}>
              Target: {meta.name} | Sector: {meta.sector}
            </div>
            <div>Title: {currentWizard.title}</div>
            <div>Location: {finalLoc}</div>
            <div style={{ marginTop: "6px", color: "var(--term-cyan)" }}>
              &gt; Type 'map {currentWizard.city}' to view marker on GIS grid
            </div>
          </div>
        )
      });
    }
  };

  const renderHelp = () => {
    addLine({
      type: "stdout",
      customNode: (
        <div className="term-help-grid">
          <div style={{ color: "var(--term-cyan)", fontWeight: 700, marginBottom: "6px" }}>
            AVAILABLE COMMANDS:
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">map [city]</span>
            <span className="term-cmd-desc">Open GIS map dashboard (e.g. 'map delhi', 'map mumbai', 'map all')</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">report</span>
            <span className="term-cmd-desc">Interactive in-terminal wizard to file issue or eco-asset</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">list [city]</span>
            <span className="term-cmd-desc">Print tabulated database of civic reports (or filter by city)</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">inspect &lt;id&gt;</span>
            <span className="term-cmd-desc">Display structural diagnosis and actions for a report (e.g. 'inspect REP-8041')</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">verify &lt;id&gt;</span>
            <span className="term-cmd-desc">Verify / upvote a civic report from the terminal</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">cities</span>
            <span className="term-cmd-desc">List all monitored Indian metropolitan regions and active nodes</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">stats</span>
            <span className="term-cmd-desc">Print municipal resolution metrics and active coverage rates</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">sdg11</span>
            <span className="term-cmd-desc">Display UN SDG 11 urban sustainability targets and standards</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">api / carto</span>
            <span className="term-cmd-desc">Inspect CARTO GIS Engine status, API key &amp; live telemetry pipelines</span>
          </div>
          <div className="term-help-row">
            <span className="term-cmd-name">clear</span>
            <span className="term-cmd-desc">Clear the terminal screen buffer</span>
          </div>
        </div>
      )
    });
  };

  const renderReportList = (filterCity?: string) => {
    let subset = reports;
    if (filterCity) {
      const low = filterCity.toLowerCase();
      subset = reports.filter(r => `${r.location} ${r.gridSector}`.toLowerCase().includes(low));
    }

    addLine({
      type: "stdout",
      customNode: (
        <div style={{ margin: "6px 0" }}>
          <div style={{ color: "var(--term-cyan)", fontWeight: 700, marginBottom: "4px" }}>
            CIVIC REPORTS DATABASE ({subset.length} records)
          </div>
          <div className="term-table-wrapper">
            <table className="term-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CATEGORY</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>URGENCY</th>
                  <th>VOTES</th>
                </tr>
              </thead>
              <tbody>
                {subset.slice(0, 10).map((r) => (
                  <tr key={r.id} onClick={() => onSelectReport(r.id)} style={{ cursor: "pointer" }}>
                    <td style={{ color: "var(--term-cyan)", fontWeight: 700 }}>{r.id}</td>
                    <td>{r.categoryLabel}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.location}
                    </td>
                    <td style={{ color: r.status === "CREW_DISPATCHED" ? "var(--term-green)" : r.status === "INVESTIGATING" ? "var(--term-yellow)" : "#94a3b8" }}>
                      {r.status}
                    </td>
                    <td style={{ color: r.urgency === "LVL_4_CRITICAL" ? "var(--term-red)" : "inherit" }}>
                      {r.urgency.replace("LVL_", "L")}
                    </td>
                    <td>{r.upvotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ color: "var(--term-muted)", fontSize: "0.72rem", marginTop: "4px" }}>
            Type 'inspect &lt;id&gt;' for details &bull; Click any row to focus &bull; Type 'map' to view on GIS
          </div>
        </div>
      )
    });
  };

  const handleInspect = (idArg: string) => {
    const cleanId = idArg.trim().toUpperCase();
    if (!cleanId) {
      addLine({ type: "stderr", text: "Usage: inspect <report_id> (e.g. inspect REP-8041)" });
      return;
    }

    const report = reports.find(r => r.id.toUpperCase() === cleanId);
    if (!report) {
      addLine({ type: "stderr", text: `Report '${cleanId}' not found in active database.` });
      return;
    }

    onSelectReport(report.id);

    addLine({
      type: "stdout",
      customNode: (
        <div className="term-inspect-card">
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-term)", paddingBottom: "4px", marginBottom: "6px" }}>
            <span style={{ color: "var(--term-cyan)", fontWeight: 700 }}>
              [{report.id}] {report.title}
            </span>
            <span style={{ color: report.urgency === "LVL_4_CRITICAL" ? "var(--term-red)" : "var(--term-yellow)" }}>
              {report.urgency}
            </span>
          </div>
          <div>Location: <span style={{ color: "#fff" }}>{report.location}</span></div>
          <div>Sector: <span style={{ color: "var(--term-muted)" }}>{report.gridSector}</span></div>
          <div>Coordinates: <span style={{ color: "var(--term-cyan)" }}>[{report.coords[0].toFixed(4)}, {report.coords[1].toFixed(4)}]</span></div>
          <div>Status: <span style={{ color: "var(--term-green)", fontWeight: 600 }}>{report.status}</span> | Upvotes: {report.upvotes}</div>
          <div style={{ marginTop: "6px", color: "var(--term-muted)", fontSize: "0.75rem" }}>
            Tolerance Delta: {report.toleranceDelta}
          </div>
          <div style={{ marginTop: "4px", background: "rgba(0,0,0,0.3)", padding: "6px", border: "1px solid var(--border-term)" }}>
            Diagnosis: {report.structuralDiagnosis}
          </div>
        </div>
      )
    });
  };

  const handleVerify = (idArg: string) => {
    const cleanId = idArg.trim().toUpperCase();
    if (!cleanId) {
      addLine({ type: "stderr", text: "Usage: verify <report_id> (e.g. verify REP-8041)" });
      return;
    }

    const report = reports.find(r => r.id.toUpperCase() === cleanId);
    if (!report) {
      addLine({ type: "stderr", text: `Report '${cleanId}' not found in active database.` });
      return;
    }

    onUpvoteReport(report.id);
    addLine({
      type: "success",
      text: `[OK] Verification logged for ${report.id}. Community trust incremented.`
    });
  };

  const renderCities = () => {
    addLine({
      type: "stdout",
      customNode: (
        <div style={{ margin: "6px 0" }}>
          <div style={{ color: "var(--term-cyan)", fontWeight: 700, marginBottom: "4px" }}>
            METROPOLITAN HUBS & COVERAGE:
          </div>
          <div className="term-help-grid">
            <div className="term-help-row">
              <span className="term-cmd-name">Bengaluru (KA)</span>
              <span className="term-cmd-desc">12.9716° N, 77.5946° E &bull; BBMP Gateway &bull; 6 Reports</span>
            </div>
            <div className="term-help-row">
              <span className="term-cmd-name">New Delhi (NCR)</span>
              <span className="term-cmd-desc">28.6139° N, 77.2090° E &bull; NDMC / PWD &bull; 3 Reports</span>
            </div>
            <div className="term-help-row">
              <span className="term-cmd-name">Mumbai (MH)</span>
              <span className="term-cmd-desc">19.0760° N, 72.8777° E &bull; BMC / BEST &bull; 3 Reports</span>
            </div>
            <div className="term-help-row">
              <span className="term-cmd-name">Hyderabad (TG)</span>
              <span className="term-cmd-desc">17.3850° N, 78.4867° E &bull; GHMC &bull; 3 Reports</span>
            </div>
            <div className="term-help-row">
              <span className="term-cmd-name">Chennai (TN)</span>
              <span className="term-cmd-desc">13.0827° N, 80.2707° E &bull; GCC / CRRT &bull; 3 Reports</span>
            </div>
          </div>
          <div style={{ color: "var(--term-muted)", fontSize: "0.72rem", marginTop: "4px" }}>
            Type 'map &lt;city&gt;' to fly camera to any hub.
          </div>
        </div>
      )
    });
  };

  const renderStats = () => {
    addLine({
      type: "stdout",
      customNode: (
        <div className="term-inspect-card">
          <div style={{ color: "var(--term-cyan)", fontWeight: 700, marginBottom: "4px" }}>
            SYS METRICS & TELEMETRY
          </div>
          <div>Active Metropolitan Wards: <span style={{ color: "#fff" }}>142</span></div>
          <div>Total Issues Resolved: <span style={{ color: "var(--term-green)" }}>28,490+</span></div>
          <div>Eco-Assets / Bioswales Catalogued: <span style={{ color: "var(--term-cyan)" }}>1,280+</span></div>
          <div>Avg Resolution Latency: <span style={{ color: "#fff" }}>38 Hours</span></div>
          <div>Network Status: <span style={{ color: "var(--term-green)" }}>OPTIMAL (0 packet loss)</span></div>
        </div>
      )
    });
  };

  const renderSdg = () => {
    addLine({
      type: "stdout",
      customNode: (
        <div className="term-inspect-card">
          <div style={{ color: "var(--term-cyan)", fontWeight: 700, marginBottom: "4px" }}>
            UN SDG 11: SUSTAINABLE CITIES AND COMMUNITIES
          </div>
          <div style={{ color: "var(--term-muted)", fontSize: "0.75rem", marginBottom: "6px" }}>
            Engineering standards embedded into EcoMap Local spatial pipelines:
          </div>
          <div>&bull; <strong style={{ color: "#fff" }}>11.1 Housing Upgrades:</strong> Safe & affordable shelter with water connections</div>
          <div>&bull; <strong style={{ color: "#fff" }}>11.2 Clean Mobility:</strong> Protected bike lanes, universal transit access (NACTO)</div>
          <div>&bull; <strong style={{ color: "#fff" }}>11.6 Urban Waste:</strong> Smart battery/e-waste sorting & municipal recycling</div>
          <div>&bull; <strong style={{ color: "#fff" }}>11.7 Green Spaces:</strong> Rewilding buffers, solar arrays, bioswales</div>
          <div>&bull; <strong style={{ color: "#fff" }}>11.B Flood Adaptation:</strong> Permeable paving, stormwater culvert telemetry</div>
        </div>
      )
    });
  };

  const renderApiStatus = () => {
    const cartoKey = import.meta.env.VITE_CARTO_API_KEY || "cb1_47a4_1_82a07ee95c175b1d02813034";
    const maskedKey = cartoKey.length > 8 ? `${cartoKey.substring(0, 8)}...${cartoKey.substring(cartoKey.length - 4)}` : cartoKey;

    addLine({
      type: "stdout",
      customNode: (
        <div className="term-inspect-card" style={{ borderLeft: "3px solid var(--term-cyan)", margin: "6px 0" }}>
          <div style={{ color: "var(--term-cyan)", fontWeight: 700, marginBottom: "8px", fontSize: "0.85rem" }}>
            [LIVE DATA PIPELINES &amp; API TELEMETRY]
          </div>

          <div style={{ marginBottom: "8px" }}>
            <div style={{ color: "var(--cad-green)", fontWeight: 600 }}>
              ● CARTO SPATIAL GIS ENGINE: ONLINE (AUTHENTICATED)
            </div>
            <div style={{ color: "var(--text-dim)", marginLeft: "14px", fontSize: "0.74rem", marginTop: "2px" }}>
              • API Key: <code style={{ color: "var(--term-cyan)", background: "rgba(0,0,0,0.4)", padding: "1px 4px" }}>{maskedKey}</code> (Active from .env)
            </div>
            <div style={{ color: "var(--text-dim)", marginLeft: "14px", fontSize: "0.74rem" }}>
              • Tile Pipeline: <span style={{ color: "var(--text-muted)" }}>https://*.basemaps.cartocdn.com/rastertiles/dark_all</span>
            </div>
            <div style={{ color: "var(--text-dim)", marginLeft: "14px", fontSize: "0.74rem" }}>
              • Scope: Real-time global high-res geospatial map rendering across all 5 Indian sectors.
            </div>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <div style={{ color: "var(--cad-green)", fontWeight: 600 }}>
              ● LIVE ENVIRONMENTAL SENSOR FEED: CONNECTED
            </div>
            <div style={{ color: "var(--text-dim)", marginLeft: "14px", fontSize: "0.74rem", marginTop: "2px" }}>
              • Telemetry: Real-time PM2.5, PM10, AQI indices (Open-Meteo Air Quality Network)
            </div>
            <div style={{ color: "var(--text-dim)", marginLeft: "14px", fontSize: "0.74rem" }}>
              • Status: Updating live per selected metropolitan sector (Bengaluru, Delhi, Mumbai, Hyderabad, Chennai)
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-cad)", paddingTop: "6px", marginTop: "6px", color: "var(--text-muted)", fontSize: "0.72rem" }}>
            <span style={{ color: "var(--cad-amber)", fontWeight: 600 }}>[INFO]</span> CARTO Basemaps provides the live geospatial map layer. Citizen reports are persisted locally in browser state. If you have an external municipal complaint backend/endpoint (e.g. Supabase, Firebase, or Open311), you can connect it directly to stream live municipal reports.
          </div>
        </div>
      )
    });
  };

  const renderFleetStatus = () => {
    const crews = [
      { id: "CREW-BLR-01", callsign: "RAPID-ALPHA", unit: "BBMP Rapid Pothole Rig", city: "Bengaluru", eta: "3.8 min", channel: "VHF-148.250", status: "EN ROUTE" },
      { id: "CREW-BLR-02", callsign: "HYDRO-ECHO", unit: "BWSSB Storm Sump Pump", city: "Bengaluru", eta: "2.4 min", channel: "VHF-152.100", status: "EN ROUTE" },
      { id: "CREW-DEL-01", callsign: "CAPITAL-BRAVO", unit: "NDMC Emergency PWD Crane", city: "Delhi", eta: "4.6 min", channel: "UHF-462.575", status: "EN ROUTE" },
      { id: "CREW-BOM-01", callsign: "COASTAL-FOXTROT", unit: "BMC High-Flow Dewatering", city: "Mumbai", eta: "3.1 min", channel: "VHF-156.800", status: "EN ROUTE" },
      { id: "CREW-HYD-01", callsign: "CYBER-DELTA", unit: "GHMC High-Voltage Line Crew", city: "Hyderabad", eta: "5.5 min", channel: "UHF-464.325", status: "EN ROUTE" },
      { id: "CREW-MAA-01", callsign: "BAY-SIERRA", unit: "GCC Bio-Retention Crew", city: "Chennai", eta: "3.4 min", channel: "VHF-149.750", status: "EN ROUTE" },
    ];

    addLine({
      type: "stdout",
      customNode: (
        <div className="term-inspect-card" style={{ borderLeft: "3px solid var(--term-green)" }}>
          <div style={{ color: "var(--term-green)", fontWeight: 700, marginBottom: "8px", fontSize: "0.85rem" }}>
            [AUTONOMOUS FLEET DISPATCH — LIVE STATUS]
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.72rem", marginBottom: "8px" }}>
            {crews.length} units active across {5} metropolitan sectors • All GPS-tracked
          </div>
          <div className="term-table-wrapper">
            <table className="term-table">
              <thead>
                <tr>
                  <th>UNIT ID</th>
                  <th>CALLSIGN</th>
                  <th>CITY</th>
                  <th>TYPE</th>
                  <th>ETA</th>
                  <th>CHANNEL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {crews.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--term-cyan)", fontWeight: 700 }}>{c.id}</td>
                    <td style={{ color: "#fff", fontWeight: 600 }}>{c.callsign}</td>
                    <td>{c.city}</td>
                    <td style={{ color: "var(--term-muted)", fontSize: "0.72rem" }}>{c.unit}</td>
                    <td style={{ color: "var(--term-yellow)" }}>{c.eta}</td>
                    <td style={{ color: "var(--text-dim)", fontSize: "0.72rem" }}>{c.channel}</td>
                    <td style={{ color: "var(--term-green)", fontWeight: 600 }}>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ color: "var(--term-muted)", fontSize: "0.72rem", marginTop: "6px" }}>
            Type 'map' to see live crew positions on GIS • ETAs update every 3s
          </div>
        </div>
      )
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(inputVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!commandHistory.length) return;
      const nextPtr = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPtr);
      setInputVal(commandHistory[nextPtr]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer === -1) return;
      if (historyPointer < commandHistory.length - 1) {
        const nextPtr = historyPointer + 1;
        setHistoryPointer(nextPtr);
        setInputVal(commandHistory[nextPtr]);
      } else {
        setHistoryPointer(-1);
        setInputVal("");
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const meta = CITY_METAS[formCity] || CITY_METAS.bengaluru;
    let finalLoc = formLocation.trim() || meta.defaultLoc;
    if (!finalLoc.toLowerCase().includes(meta.name.toLowerCase())) {
      finalLoc = `${finalLoc}, ${meta.name}`;
    }

    const generatedId = `REP-${Math.floor(8300 + Math.random() * 600)}`;
    const newReport: CadReportItem = {
      id: generatedId,
      specCode: "SDG 11 / Terminal Submission",
      title: formTitle.trim(),
      category: formCategory,
      categoryLabel: formCategory === "infrastructure" ? "Infrastructure" : formCategory === "eco-assets" ? "Eco-Asset" : formCategory === "waste" ? "Waste & Recycling" : formCategory === "mobility" ? "Clean Mobility" : "Water Drainage",
      status: "INVESTIGATING",
      urgency: formUrgency,
      gridSector: meta.sector,
      location: finalLoc,
      coords: meta.coords,
      reportedTime: "Just now",
      upvotes: 1,
      reporterId: "Terminal Form Operator",
      structuralDiagnosis: formDiagnosis.trim() || "Report dispatched via integrated terminal form.",
      toleranceDelta: "Status: Logged into City Queue",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      blueprintDim: "Site Survey Pending",
      actions: [
        { timestamp: "Just now", txCode: "TX-FORM", operation: "Workorder created via terminal form", nodeOperator: "EcoMap Terminal" }
      ]
    };

    onAddReport(newReport);
    setFormSubmittedMsg(`[SUCCESS] Workorder ${generatedId} created and dispatched for ${meta.name}!`);

    addLine({
      type: "success",
      text: `[FORM DISPATCH] Workorder ${generatedId} (${formTitle.trim()}) routed to ${meta.name} municipal queue.`
    });

    setFormTitle("");
    setFormLocation("");
    setFormDiagnosis("");

    setTimeout(() => {
      setFormSubmittedMsg(null);
    }, 4000);
  };

  const getPromptPrefix = () => {
    if (wizard) {
      return `ecomap(wizard-step-${wizard.step})#`;
    }
    return "ecomap@urban-ops:~$";
  };

  return (
    <div className="term-window">
      <div className="term-window-header">
        <div className="term-dots">
          <span className="term-dot red" />
          <span className="term-dot yellow" />
          <span className="term-dot green" />
        </div>
        <div className="term-title">
          <Terminal size={12} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
          <span>ecomap-shistech@civic-grid: ~ (v2.4.0)</span>
        </div>
        <div className="term-tabs">
          <button
            className={`term-tab-btn ${activeMode === "cli" ? "active" : ""}`}
            onClick={() => setActiveMode("cli")}
          >
            &gt;_ CLI Console
          </button>
          <button
            className={`term-tab-btn ${activeMode === "form" ? "active" : ""}`}
            onClick={() => setActiveMode("form")}
          >
            + Report Form
          </button>
        </div>
      </div>

      {activeMode === "cli" ? (
        <div className="term-body" ref={terminalBodyRef} onClick={() => inputRef.current?.focus()}>
          <div
            className="term-output-stream"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            {lines.map((l) => (
              <div key={l.id} className={`term-line term-line-${l.type}`}>
                {l.type === "input" && (
                  <span className="term-prompt-echo">
                    <span className="term-path">ecomap@urban-ops</span>
                    <span className="term-sep">:</span>
                    <span className="term-prompt-char">$ </span>
                    <span className="term-input-text">{l.text}</span>
                  </span>
                )}
                {l.type !== "input" && l.customNode}
                {l.type !== "input" && !l.customNode && (
                  <div className="term-text-msg">{l.text}</div>
                )}
              </div>
            ))}
          </div>

          <div className="term-input-row">
            <span className="term-prompt-label">
              <span className="term-user">ecomap</span>
              <span className="term-sep">:</span>
              <span className="term-path">~</span>
              <span className="term-prompt-char">{wizard ? `# ` : `$ `}</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="term-input-field"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={wizard ? "Enter response..." : "Type command (e.g. 'map delhi', 'report', 'list', 'help')..."}
              autoFocus
              spellCheck={false}
            />
            <button
              className="term-send-btn"
              onClick={() => {
                executeCommand(inputVal);
                setInputVal("");
              }}
            >
              <CornerDownLeft size={13} />
            </button>
          </div>

          <div className="term-quick-bar">
            <span className="term-quick-label">QUICK CMDS:</span>
            <button className="term-chip" onClick={() => executeCommand("map")}>map</button>
            <button className="term-chip" onClick={() => executeCommand("map delhi")}>map delhi</button>
            <button className="term-chip" onClick={() => executeCommand("map mumbai")}>map mumbai</button>
            <button className="term-chip" onClick={() => executeCommand("report")}>report</button>
            <button className="term-chip" onClick={() => executeCommand("list")}>list</button>
            <button className="term-chip" onClick={() => executeCommand("stats")}>stats</button>
            <button className="term-chip" onClick={() => executeCommand("help")}>help</button>
            <button className="term-chip" onClick={() => executeCommand("clear")}>clear</button>
          </div>
        </div>
      ) : (
        <div
          className="term-form-body"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="term-form-header">
            <span style={{ color: "var(--term-cyan)", fontWeight: 700 }}>
              &gt;_ INTEGRATED CIVIC ISSUE REPORTING BUFFER
            </span>
            <span style={{ color: "var(--term-muted)", fontSize: "0.72rem" }}>
              Direct Gateway to Municipal Workorder Systems
            </span>
          </div>

          {formSubmittedMsg && (
            <div className="term-form-alert success">
              <CheckCircle2 size={14} />
              <span>{formSubmittedMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="term-cli-form">
            <div className="term-form-group">
              <label className="term-label">
                <span>[01] ISSUE TITLE *</span>
                <span className="term-hint">Short description of problem or green asset</span>
              </label>
              <input
                type="text"
                className="term-form-input"
                placeholder="e.g. Broken pavement along 100 Feet Road"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div className="term-form-row">
              <div className="term-form-group" style={{ flex: 1 }}>
                <label className="term-label">[02] TARGET CITY *</label>
                <div className="term-btn-group">
                  {(["bengaluru", "delhi", "mumbai", "hyderabad", "chennai"] as const).map((cKey) => (
                    <button
                      key={cKey}
                      type="button"
                      className={`term-choice-btn ${formCity === cKey ? "active" : ""}`}
                      onClick={() => setFormCity(cKey)}
                    >
                      {CITY_METAS[cKey].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="term-form-group" style={{ flex: 1 }}>
                <label className="term-label">[03] CATEGORY *</label>
                <div className="term-btn-group">
                  {(["infrastructure", "eco-assets", "waste", "mobility", "water"] as IssueCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`term-choice-btn ${formCategory === cat ? "active" : ""}`}
                      onClick={() => setFormCategory(cat)}
                    >
                      {cat === "infrastructure" ? "Infrastructure" : cat === "eco-assets" ? "Eco-Asset" : cat === "waste" ? "Waste" : cat === "mobility" ? "Mobility" : "Water"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="term-form-row">
              <div className="term-form-group" style={{ flex: 2 }}>
                <label className="term-label">[04] LOCATION / INTERSECTION *</label>
                <input
                  type="text"
                  className="term-form-input"
                  placeholder="e.g. Rajiv Chowk Gate 6, Connaught Place"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                />
              </div>

              <div className="term-form-group" style={{ flex: 1 }}>
                <label className="term-label">[05] PRIORITY</label>
                <select
                  className="term-form-select"
                  value={formUrgency}
                  onChange={(e) => setFormUrgency(e.target.value as UrgencyLevel)}
                >
                  <option value="LVL_1_NOMINAL">L1 — Nominal / Eco-Asset</option>
                  <option value="LVL_2_MODERATE">L2 — Moderate / Maintenance</option>
                  <option value="LVL_3_ELEVATED">L3 — Elevated / Safety Hazard</option>
                  <option value="LVL_4_CRITICAL">L4 — Critical Hazard</option>
                </select>
              </div>
            </div>

            <div className="term-form-group">
              <label className="term-label">[06] STRUCTURAL DIAGNOSIS / OBSERVATIONS</label>
              <textarea
                className="term-form-textarea"
                rows={3}
                placeholder="Provide physical dimensions, hazard details, or community context..."
                value={formDiagnosis}
                onChange={(e) => setFormDiagnosis(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button type="submit" className="term-submit-btn">
                <span>[DISPATCH WORKORDER TO GATEWAY]</span>
              </button>
              <button
                type="button"
                className="term-alt-btn"
                onClick={() => {
                  setActiveMode("cli");
                  executeCommand("map " + formCity);
                }}
              >
                <span>[OPEN MAP: {CITY_METAS[formCity]?.name.toUpperCase()}]</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
