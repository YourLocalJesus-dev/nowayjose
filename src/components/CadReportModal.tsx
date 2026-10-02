import React, { useState, useEffect } from "react";
import { CadReportItem, IssueCategory, UrgencyLevel } from "../types";
import { X, CheckCircle, Crosshair } from "lucide-react";

interface CadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (newReport: CadReportItem) => void;
}

const CITY_METAS: Record<string, { name: string; sector: string; coords: [number, number]; defaultLoc: string }> = {
  bengaluru: { name: "Bengaluru", sector: "Bengaluru Central Ward", coords: [12.9716, 77.5946], defaultLoc: "MG Road & Brigade Road, Bengaluru" },
  delhi: { name: "New Delhi", sector: "New Delhi NDMC Zone", coords: [28.6139, 77.2090], defaultLoc: "Connaught Place Inner Circle, New Delhi" },
  mumbai: { name: "Mumbai", sector: "Mumbai Central Ward", coords: [19.0760, 72.8777], defaultLoc: "Dadar TT Circle, Mumbai" },
  hyderabad: { name: "Hyderabad", sector: "Hyderabad GHMC Zone", coords: [17.3850, 78.4867], defaultLoc: "Cyber Towers Junction, Madhapur, Hyderabad" },
  chennai: { name: "Chennai", sector: "Chennai GCC Zone", coords: [13.0827, 80.2707], defaultLoc: "T. Nagar CMBT Hub, Chennai" }
};

export const CadReportModal: React.FC<CadReportModalProps> = ({
  isOpen,
  onClose,
  onAddReport
}) => {
  const [selectedCity, setSelectedCity] = useState<string>("bengaluru");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IssueCategory>("infrastructure");
  const [urgency, setUrgency] = useState<UrgencyLevel>("LVL_2_MODERATE");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<[number, number]>([12.9716, 77.5946]);
  const [diagnosis, setDiagnosis] = useState("");
  const [selectedImage, setSelectedImage] = useState("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCitySelect = (cityKey: string) => {
    setSelectedCity(cityKey);
    const meta = CITY_METAS[cityKey];
    if (meta) {
      setCoords(meta.coords);
      if (!location) {
        setLocation(meta.defaultLoc);
      }
    }
  };

  const handleGpsScan = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.latitude, pos.coords.longitude]);
          setLocation(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (${CITY_METAS[selectedCity]?.name || "Local"})`);
        },
        () => {
          const meta = CITY_METAS[selectedCity] || CITY_METAS.bengaluru;
          const lat = meta.coords[0] + (Math.random() - 0.5) * 0.03;
          const lng = meta.coords[1] + (Math.random() - 0.5) * 0.03;
          setCoords([lat, lng]);
          setLocation(meta.defaultLoc);
        },
        { timeout: 3000 }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `REP-${Math.floor(8200 + Math.random() * 800)}`;
      const meta = CITY_METAS[selectedCity] || CITY_METAS.bengaluru;
      let loc = location.trim() || meta.defaultLoc;
      if (!loc.toLowerCase().includes(meta.name.toLowerCase())) {
        loc = `${loc}, ${meta.name}`;
      }

      const newReport: CadReportItem = {
        id: generatedId,
        specCode: `SDG 11 / Community Finding`,
        title: title.trim(),
        category,
        categoryLabel: category === "infrastructure" ? "Infrastructure" : category === "eco-assets" ? "Eco-Asset" : category === "waste" ? "Waste & Recycling" : category === "mobility" ? "Clean Mobility" : "Water Drainage",
        status: "INVESTIGATING",
        urgency,
        gridSector: meta.sector,
        location: loc,
        coords,
        reportedTime: "Just now",
        upvotes: 1,
        reporterId: "Citizen Contributor",
        structuralDiagnosis: diagnosis || "Report submitted via EcoMap Local community portal.",
        toleranceDelta: "Status: Logged into City Queue",
        image: selectedImage,
        blueprintDim: "Site Survey Pending",
        actions: [
          { timestamp: "Just now", txCode: `REC-01`, operation: "Report logged into city queue", nodeOperator: "Citizen Portal" }
        ]
      };

      onAddReport(newReport);
      setSubmittedReportId(generatedId);
      setIsSubmitting(false);
    }, 600);
  };

  const handleReset = () => {
    setTitle("");
    setLocation("");
    setDiagnosis("");
    setSubmittedReportId(null);
  };

  return (
    <div
      className={`cad-modal-backdrop ${isOpen ? "open" : ""}`}
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="cad-modal-console"
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="cad-corner cad-corner-tl" />
        <div className="cad-corner cad-corner-tr" />
        <div className="cad-corner cad-corner-bl" />
        <div className="cad-corner cad-corner-br" />

        <div className="cad-console-header">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#fff", fontWeight: 700 }}>
            Report an Issue or Eco-Asset
          </span>
          <button className="btn-cad" style={{ padding: "4px 8px" }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {!submittedReportId ? (
          <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                <span>Issue Title *</span>
              </div>
              <input
                type="text"
                className="cad-input-field"
                placeholder="e.g. Broken pavement or damaged asset"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <div style={{ marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Target City *
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "4px" }}>
                {(["bengaluru", "delhi", "mumbai", "hyderabad", "chennai"] as const).map((cKey) => (
                  <button
                    key={cKey}
                    type="button"
                    className={`cad-filter-btn ${selectedCity === cKey ? "active" : ""}`}
                    onClick={() => handleCitySelect(cKey)}
                  >
                    {CITY_METAS[cKey].name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Category *
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "4px" }}>
                {(["infrastructure", "eco-assets", "waste", "mobility", "water"] as IssueCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`cad-filter-btn ${category === cat ? "active" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat === "infrastructure" ? "Infrastructure" : cat === "eco-assets" ? "Eco-Asset" : cat === "waste" ? "Waste" : cat === "mobility" ? "Mobility" : "Water"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                <span>Location or Intersection *</span>
                <button
                  type="button"
                  className="btn-cad"
                  style={{ padding: "2px 6px", fontSize: "0.68rem" }}
                  onClick={handleGpsScan}
                >
                  <Crosshair size={11} />
                  <span>Use GPS</span>
                </button>
              </div>
              <input
                type="text"
                className="cad-input-field"
                placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div>
              <div style={{ marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Priority Level
              </div>
              <select
                className="cad-select-field"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
              >
                <option value="LVL_1_NOMINAL">Low — Eco-asset or general suggestion</option>
                <option value="LVL_2_MODERATE">Medium — Standard maintenance needed</option>
                <option value="LVL_3_ELEVATED">High — Safety or environmental hazard</option>
                <option value="LVL_4_CRITICAL">Critical — Urgent hazard to pedestrians or cyclists</option>
              </select>
            </div>

            <div>
              <div style={{ marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Observations and Description
              </div>
              <textarea
                className="cad-textarea-field"
                rows={3}
                placeholder="Provide helpful details about the problem or asset..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            <div>
              <div style={{ marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Select Photo Preset
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=400&q=80"
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="preset"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                      border: selectedImage === img ? "2px solid var(--cad-blue)" : "1px solid var(--border-cad)"
                    }}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-cad btn-cad-primary"
              style={{ padding: "10px", justifyContent: "center", marginTop: "4px" }}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Submitting..." : "Submit Report"}</span>
            </button>
          </form>
        ) : (
          <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "44px", height: "44px", border: "1px solid var(--cad-blue)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", background: "#111A2E" }}>
              <CheckCircle size={24} color="var(--cad-blue)" />
            </div>

            <h3 style={{ fontFamily: "var(--font-cad)", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>
              Report Successfully Submitted
            </h3>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--cad-blue)", background: "var(--bg-navy)", padding: "4px 10px", border: "1px solid var(--border-cad)", marginBottom: "1rem" }}>
              Tracking Code: {submittedReportId}
            </div>

            <p style={{ color: "var(--text-dim)", maxWidth: "420px", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Your report has been placed on the public map and sent to the district public works review list.
            </p>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-cad btn-cad-primary" onClick={onClose}>
                <span>View on Map</span>
              </button>
              <button className="btn-cad" onClick={handleReset}>
                <span>Submit Another</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
