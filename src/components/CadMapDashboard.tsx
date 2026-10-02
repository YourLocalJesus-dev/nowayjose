import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { CadReportItem } from "../types";
import { ThumbsUp, MapPin, Info, Clock, Activity, User, Navigation, Truck, Radio, Crosshair, X, ShieldAlert } from "lucide-react";

interface CadMapDashboardProps {
  reports: CadReportItem[];
  selectedReportId: string | null;
  verifiedReportIds: string[];
  initialCity?: string;
  onSelectReport: (id: string) => void;
  onUpvoteReport: (id: string) => void;
  onOpenReportModal: () => void;
  onOpenTerminal?: () => void;
}

export interface LiveCrewUnit {
  id: string;
  callsign: string;
  unitType: string;
  city: string;
  coords: [number, number];
  targetCoords: [number, number];
  targetReportId: string;
  targetTitle: string;
  speedKmh: number;
  radioChannel: string;
  etaMinutes: number;
}

const INITIAL_CREWS: LiveCrewUnit[] = [
  {
    id: "CREW-BLR-01",
    callsign: "RAPID-ALPHA",
    unitType: "BBMP Rapid Pothole & Road Rig",
    city: "bengaluru",
    coords: [12.9780, 77.6010],
    targetCoords: [12.9716, 77.5946],
    targetReportId: "REP-8041",
    targetTitle: "Structural Sinkhole / Void",
    speedKmh: 32,
    radioChannel: "VHF-148.250",
    etaMinutes: 3.8
  },
  {
    id: "CREW-BLR-02",
    callsign: "HYDRO-ECHO",
    unitType: "BWSSB Storm Sump & Culvert Pump",
    city: "bengaluru",
    coords: [12.9650, 77.6320],
    targetCoords: [12.9720, 77.6408],
    targetReportId: "REP-8043",
    targetTitle: "Main Water Aqueduct Fracture",
    speedKmh: 28,
    radioChannel: "VHF-152.100",
    etaMinutes: 2.4
  },
  {
    id: "CREW-DEL-01",
    callsign: "CAPITAL-BRAVO",
    unitType: "NDMC Emergency PWD Crane",
    city: "delhi",
    coords: [28.6250, 77.2180],
    targetCoords: [28.6139, 77.2090],
    targetReportId: "REP-DEL-01",
    targetTitle: "Heritage Facade Structural Crack",
    speedKmh: 35,
    radioChannel: "UHF-462.575",
    etaMinutes: 4.6
  },
  {
    id: "CREW-BOM-01",
    callsign: "COASTAL-FOXTROT",
    unitType: "BMC High-Flow Dewatering Rig",
    city: "mumbai",
    coords: [19.0680, 72.8650],
    targetCoords: [19.0760, 72.8777],
    targetReportId: "REP-BOM-01",
    targetTitle: "Storm Culvert Blockage",
    speedKmh: 24,
    radioChannel: "VHF-156.800",
    etaMinutes: 3.1
  },
  {
    id: "CREW-HYD-01",
    callsign: "CYBER-DELTA",
    unitType: "GHMC High-Voltage Line Crew",
    city: "hyderabad",
    coords: [17.3980, 78.4720],
    targetCoords: [17.3850, 78.4867],
    targetReportId: "REP-HYD-01",
    targetTitle: "Substation Transformer Overheat",
    speedKmh: 40,
    radioChannel: "UHF-464.325",
    etaMinutes: 5.5
  },
  {
    id: "CREW-MAA-01",
    callsign: "BAY-SIERRA",
    unitType: "GCC Bio-Retention Dredging Crew",
    city: "chennai",
    coords: [13.0720, 80.2610],
    targetCoords: [13.0827, 80.2707],
    targetReportId: "REP-MAA-01",
    targetTitle: "Bioswale Silt Inundation",
    speedKmh: 27,
    radioChannel: "VHF-149.750",
    etaMinutes: 3.4
  }
];

const calcDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const parseTimeAgo = (str: string): number => {
  if (str.includes("Just now")) return 0;
  const match = str.match(/(\d+)\s*(min|hour|h)/i);
  if (!match) return 0;
  const val = parseInt(match[1]);
  if (match[2].startsWith("hour") || match[2] === "h") return val * 60;
  return val;
};

const formatLiveTime = (totalMinutes: number): string => {
  if (totalMinutes < 1) return "Just now";
  if (totalMinutes < 60) return `${totalMinutes} min${totalMinutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `${hours}h ago`;
  return `${hours}h ${mins}m ago`;
};

const STATUS_LABELS: Record<string, string> = {
  "INVESTIGATING": "Investigating",
  "WORKORDER_QUEUED": "Work Order Queued",
  "CREW_DISPATCHED": "Crew Dispatched",
  "RESOLVED_VERIFIED": "Resolved"
};

const STATUS_COLORS: Record<string, string> = {
  "INVESTIGATING": "var(--cad-amber)",
  "WORKORDER_QUEUED": "var(--cad-blue)",
  "CREW_DISPATCHED": "var(--cad-green)",
  "RESOLVED_VERIFIED": "#64748b"
};

const CITY_KEYWORDS: Record<string, string[]> = {
  bengaluru: ["bengaluru", "bangalore"],
  delhi: ["delhi", "new delhi", "ncr"],
  mumbai: ["mumbai", "bombay"],
  hyderabad: ["hyderabad", "secunderabad"],
  chennai: ["chennai", "madras"]
};

const matchesCity = (r: CadReportItem, city: string) => {
  if (city === "all") return true;
  const keywords = CITY_KEYWORDS[city] || [city];
  const text = `${r.location} ${r.gridSector}`.toLowerCase();
  return keywords.some(kw => text.includes(kw));
};

const CITY_COORDS: Record<string, { coords: [number, number]; zoom: number }> = {
  "all":       { coords: [20.5937, 78.9629], zoom: 5 },
  "bengaluru": { coords: [12.9716, 77.5946], zoom: 13 },
  "delhi":     { coords: [28.6139, 77.2090], zoom: 13 },
  "mumbai":    { coords: [19.0760, 72.8777], zoom: 13 },
  "hyderabad": { coords: [17.3850, 78.4867], zoom: 13 },
  "chennai":   { coords: [13.0827, 80.2707], zoom: 13 }
};

export const CadMapDashboard: React.FC<CadMapDashboardProps> = ({
  reports,
  selectedReportId,
  verifiedReportIds,
  initialCity,
  onSelectReport,
  onUpvoteReport,
  onOpenReportModal,
  onOpenTerminal
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const crewMarkerLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerLayerRef = useRef<L.LayerGroup | null>(null);
  const userWatchIdRef = useRef<number | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>(initialCity || "bengaluru");
  const [volunteerStatus, setVolunteerStatus] = useState<string>("Volunteer to Help");
  const [liveClock, setLiveClock] = useState<string>("");
  const [tickCount, setTickCount] = useState<number>(0);
  const [quickCmd, setQuickCmd] = useState<string>("");
  const [cmdFeedback, setCmdFeedback] = useState<string | null>(null);
  const baseTimesRef = useRef<Map<string, number>>(new Map());

  // Live GPS & Fleet Tracking States
  const [isTrackingUser, setIsTrackingUser] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [showCrews, setShowCrews] = useState(true);
  const [liveCrews, setLiveCrews] = useState<LiveCrewUnit[]>(INITIAL_CREWS);
  const [selectedCrew, setSelectedCrew] = useState<LiveCrewUnit | null>(null);

  const cityReports = selectedCity === "all"
    ? reports
    : reports.filter(r => matchesCity(r, selectedCity));

  const filteredReports = activeFilter === "all"
    ? cityReports
    : cityReports.filter(r => r.category === activeFilter);

  const selectedReport = filteredReports.find(r => r.id === selectedReportId)
    || cityReports.find(r => r.id === selectedReportId)
    || filteredReports[0]
    || cityReports[0]
    || reports.find(r => r.id === selectedReportId)
    || reports[0]
    || null;

  useEffect(() => {
    reports.forEach(r => {
      if (!baseTimesRef.current.has(r.id)) {
        baseTimesRef.current.set(r.id, parseTimeAgo(r.reportedTime));
      }
    });
  }, [reports]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      const ss = now.getSeconds().toString().padStart(2, "0");
      setLiveClock(`${hh}:${mm}:${ss}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickCount(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  interface CityTelemetry {
    pm2_5?: number;
    pm10?: number;
    aqi?: number;
    status?: string;
  }

  const [cityTelemetry, setCityTelemetry] = useState<CityTelemetry | null>(null);

  useEffect(() => {
    if (selectedCity === "all") {
      setCityTelemetry(null);
      return;
    }
    const coords = CITY_COORDS[selectedCity]?.coords;
    if (!coords) return;
    const [lat, lng] = coords;

    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,european_aqi`)
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          const aqi = Math.round(data.current.european_aqi || 0);
          setCityTelemetry({
            pm2_5: Math.round(data.current.pm2_5 || 0),
            pm10: Math.round(data.current.pm10 || 0),
            aqi,
            status: aqi > 80 ? "POOR" : aqi > 50 ? "MODERATE" : "GOOD"
          });
        }
      })
      .catch(() => {});
  }, [selectedCity]);

  const getLiveTime = (reportId: string): string => {
    const base = baseTimesRef.current.get(reportId) ?? 0;
    return formatLiveTime(base + tickCount);
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const startCity = initialCity && CITY_COORDS[initialCity] ? initialCity : "bengaluru";
    const startCoords = CITY_COORDS[startCity].coords;
    const startZoom = CITY_COORDS[startCity].zoom;

    const map = L.map(mapContainerRef.current, {
      center: startCoords,
      zoom: startZoom,
      zoomControl: false,
      attributionControl: true
    });

    // CartoDB free public dark tiles — no API key needed, always works.
    // CARTO's rastertiles endpoint is enterprise-only and returns "API Key Required"
    // tiles even with a valid key unless on a paid plan.
    const baseTile = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: "abcd",
        maxZoom: 19
      }
    ).addTo(map);


    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    const crewGroup = L.layerGroup().addTo(map);
    crewMarkerLayerRef.current = crewGroup;

    const userGroup = L.layerGroup().addTo(map);
    userMarkerLayerRef.current = userGroup;

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
      // Always ensure we are centered on the correct city
      map.setView(startCoords, startZoom);
    }, 150);

    return () => {
      if (userWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(userWatchIdRef.current);
        userWatchIdRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      crewMarkerLayerRef.current = null;
      userMarkerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredReports.forEach((report) => {
      const isCritical = report.urgency === "LVL_4_CRITICAL";
      const isSelected = report.id === selectedReport?.id;

      const markerHtml = `
        <div class="cad-map-marker ${isCritical ? 'crit' : ''} ${isSelected ? 'active-target' : ''}">
          <div class="cross-h"></div>
          <div class="cross-v"></div>
          <div class="cross-box"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: "",
        html: markerHtml,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker(report.coords, { icon });
      marker.on("click", () => {
        onSelectReport(report.id);
        map.flyTo(report.coords, 15, { duration: 1.0 });
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredReports, selectedReport, onSelectReport]);

  // Autonomous crew movement simulation
  useEffect(() => {
    if (!showCrews) {
      crewMarkerLayerRef.current?.clearLayers();
      return;
    }

    const interval = setInterval(() => {
      setLiveCrews((prev) =>
        prev.map((crew) => {
          const [lat, lng] = crew.coords;
          const [tLat, tLng] = crew.targetCoords;
          const dLat = tLat - lat;
          const dLng = tLng - lng;
          const dist = Math.hypot(dLat, dLng);

          if (dist < 0.0003) {
            return {
              ...crew,
              etaMinutes: Math.max(0.5, +(crew.etaMinutes - 0.05).toFixed(1))
            };
          }

          const step = 0.00018;
          const nextLat = lat + (dLat / dist) * step;
          const nextLng = lng + (dLng / dist) * step;
          const newEta = Math.max(0.5, +(crew.etaMinutes - 0.05).toFixed(1));
          const newSpeed = Math.floor(25 + Math.random() * 15);

          return {
            ...crew,
            coords: [nextLat, nextLng],
            etaMinutes: newEta,
            speedKmh: newSpeed
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [showCrews]);

  // Render Municipal Response Crew Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const crewGroup = crewMarkerLayerRef.current;
    if (!map || !crewGroup) return;

    crewGroup.clearLayers();
    if (!showCrews) return;

    const visibleCrews = selectedCity === "all"
      ? liveCrews
      : liveCrews.filter((c) => c.city === selectedCity);

    visibleCrews.forEach((crew) => {
      const isSelected = selectedCrew?.id === crew.id;
      const html = `
        <div class="cad-crew-marker">
          <div class="cad-crew-badge">
            <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#10b981;"></span>
            ${crew.callsign} (${crew.etaMinutes}m)
          </div>
          <div class="cad-crew-icon-box" style="${isSelected ? 'background:#38bdf8;border-color:#fff;box-shadow:0 0 16px #38bdf8;' : ''}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
          <div class="cad-crew-radar"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: "",
        html,
        iconSize: [80, 50],
        iconAnchor: [40, 42]
      });

      const marker = L.marker(crew.coords, { icon, zIndexOffset: 600 });
      marker.on("click", () => {
        setSelectedCrew(crew);
        map.flyTo(crew.coords, 15, { duration: 1.0 });
      });

      crewGroup.addLayer(marker);
    });
  }, [liveCrews, selectedCity, showCrews, selectedCrew]);

  // Render User GPS Position Marker
  useEffect(() => {
    const userGroup = userMarkerLayerRef.current;
    if (!userGroup) return;

    userGroup.clearLayers();
    if (!userPos || !isTrackingUser) return;

    const html = `
      <div class="cad-user-beacon">
        <div class="cad-user-pulse"></div>
        <div class="cad-user-dot"></div>
      </div>
    `;

    const icon = L.divIcon({
      className: "",
      html,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([userPos.lat, userPos.lng], { icon, zIndexOffset: 1000 });
    userGroup.addLayer(marker);

    const circle = L.circle([userPos.lat, userPos.lng], {
      radius: Math.max(25, userPos.accuracy),
      color: "#38bdf8",
      weight: 1.5,
      fillColor: "#38bdf8",
      fillOpacity: 0.12,
      dashArray: "4, 6"
    });
    userGroup.addLayer(circle);
  }, [userPos, isTrackingUser]);

  const toggleUserGps = () => {
    if (isTrackingUser) {
      if (userWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(userWatchIdRef.current);
        userWatchIdRef.current = null;
      }
      userMarkerLayerRef.current?.clearLayers();
      setIsTrackingUser(false);
      setUserPos(null);
      setCmdFeedback("[GPS] Live tracking disabled");
      setTimeout(() => setCmdFeedback(null), 2500);
    } else {
      if (!navigator.geolocation) {
        setCmdFeedback("[ERR] Geolocation not supported by browser");
        setTimeout(() => setCmdFeedback(null), 3000);
        return;
      }

      setCmdFeedback("[GPS] Acquiring satellite fix...");
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const isFirstFix = !userPos;
          setUserPos({ lat: latitude, lng: longitude, accuracy: Math.round(accuracy) });
          setIsTrackingUser(true);
          setCmdFeedback(`[GPS LOCKED] ±${Math.round(accuracy)}m`);
          setTimeout(() => setCmdFeedback(null), 3000);

          if (isFirstFix && mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });
          }
        },
        (err) => {
          setCmdFeedback(`[GPS ERR] ${err.message || 'Permission denied'}`);
          setTimeout(() => setCmdFeedback(null), 3500);
          setIsTrackingUser(false);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
      userWatchIdRef.current = id;
    }
  };

  const handleCityChange = (cityKey: string) => {
    setSelectedCity(cityKey);
    const map = mapInstanceRef.current;
    if (!map) return;

    const target = CITY_COORDS[cityKey];
    if (target) {
      map.flyTo(target.coords, target.zoom, { duration: 1.4 });
    }

    const matching = cityKey === "all" ? reports : reports.filter(r => matchesCity(r, cityKey));
    if (matching.length > 0) {
      onSelectReport(matching[0].id);
    }
  };

  const handleQuickCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = quickCmd.trim().toLowerCase();
    if (!val) return;

    if (val === "terminal" || val === "cli" || val === "home") {
      onOpenTerminal?.();
      return;
    }

    if (val === "report" || val === "new") {
      onOpenReportModal();
      setQuickCmd("");
      return;
    }

    const cityMatch = ["bengaluru", "delhi", "mumbai", "hyderabad", "chennai", "all"].find(c => val.includes(c));
    if (cityMatch) {
      handleCityChange(cityMatch);
      setCmdFeedback(`[OK] Filtered: ${cityMatch.toUpperCase()}`);
      setQuickCmd("");
      setTimeout(() => setCmdFeedback(null), 2500);
      return;
    }

    const catMatch = ["infrastructure", "eco-assets", "waste", "mobility", "water"].find(c => val.includes(c));
    if (catMatch) {
      setActiveFilter(catMatch);
      setCmdFeedback(`[OK] Category: ${catMatch}`);
      setQuickCmd("");
      setTimeout(() => setCmdFeedback(null), 2500);
      return;
    }

    if (val === "all" || val === "reset") {
      setActiveFilter("all");
      setCmdFeedback(`[OK] All categories`);
      setQuickCmd("");
      setTimeout(() => setCmdFeedback(null), 2500);
      return;
    }

    if (val === "gps" || val === "locate" || val === "track") {
      toggleUserGps();
      setQuickCmd("");
      return;
    }

    if (val === "fleet" || val === "crews") {
      setShowCrews(prev => !prev);
      setCmdFeedback(`[FLEET] Tracking ${!showCrews ? "ENABLED" : "PAUSED"}`);
      setQuickCmd("");
      setTimeout(() => setCmdFeedback(null), 2500);
      return;
    }

    setCmdFeedback(`[ERR] Unknown command '${val}'`);
    setTimeout(() => setCmdFeedback(null), 2500);
  };

  return (
    <div className="map-view-layout">
      <div className="map-cad-control-bar">
        <div className="cad-filter-cluster">
          <button
            className={`cad-filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All ({cityReports.length})
          </button>
          <button
            className={`cad-filter-btn ${activeFilter === "infrastructure" ? "active" : ""}`}
            onClick={() => setActiveFilter("infrastructure")}
          >
            Infrastructure ({cityReports.filter(r => r.category === "infrastructure").length})
          </button>
          <button
            className={`cad-filter-btn ${activeFilter === "eco-assets" ? "active" : ""}`}
            onClick={() => setActiveFilter("eco-assets")}
          >
            Eco-Assets ({cityReports.filter(r => r.category === "eco-assets").length})
          </button>
          <button
            className={`cad-filter-btn ${activeFilter === "waste" ? "active" : ""}`}
            onClick={() => setActiveFilter("waste")}
          >
            Waste ({cityReports.filter(r => r.category === "waste").length})
          </button>
          <button
            className={`cad-filter-btn ${activeFilter === "mobility" ? "active" : ""}`}
            onClick={() => setActiveFilter("mobility")}
          >
            Mobility ({cityReports.filter(r => r.category === "mobility").length})
          </button>
          <button
            className={`cad-filter-btn ${activeFilter === "water" ? "active" : ""}`}
            onClick={() => setActiveFilter("water")}
          >
            Water ({cityReports.filter(r => r.category === "water").length})
          </button>
        </div>

        <form onSubmit={handleQuickCmdSubmit} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--term-green)" }}>
            ❯
          </span>
          <input
            type="text"
            className="cad-input-field"
            style={{ width: "180px", padding: "4px 8px", fontSize: "0.72rem", background: "#090d12" }}
            placeholder="cmd: 'delhi', 'report', 'cli'..."
            value={quickCmd}
            onChange={(e) => setQuickCmd(e.target.value)}
          />
          {cmdFeedback && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--term-cyan)", whiteSpace: "nowrap" }}>
              {cmdFeedback}
            </span>
          )}
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            title="CARTO Global Geospatial Vector/Raster Engine (Active & Authenticated with VITE_CARTO_API_KEY)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--term-cyan)",
              background: "rgba(34, 211, 238, 0.08)",
              border: "1px solid rgba(34, 211, 238, 0.25)",
              padding: "3px 7px",
              borderRadius: "2px"
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--term-cyan)", display: "inline-block" }} />
            <span>CARTO API: ACTIVE</span>
          </div>

          {cityTelemetry && (
            <div
              title={`Live Sensor Telemetry for ${selectedCity.toUpperCase()}: PM2.5 ${cityTelemetry.pm2_5} µg/m³, PM10 ${cityTelemetry.pm10} µg/m³`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: cityTelemetry.status === "GOOD" ? "var(--cad-green)" : cityTelemetry.status === "MODERATE" ? "var(--cad-amber)" : "var(--cad-red)",
                background: "rgba(0,0,0,0.35)",
                border: "1px solid var(--border-cad)",
                padding: "3px 7px",
                borderRadius: "2px"
              }}
            >
              <Activity size={10} />
              <span>AQI {cityTelemetry.aqi} • PM2.5 {cityTelemetry.pm2_5}µg</span>
            </div>
          )}

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--cad-blue)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={11} />
            <span>{liveClock}</span>
          </div>
          {/* Live GPS Track Button */}
          <button
            type="button"
            className={`cad-track-btn ${isTrackingUser ? "active" : ""}`}
            onClick={toggleUserGps}
            title={isTrackingUser && userPos ? `Live GPS Locked: ${userPos.lat.toFixed(4)}, ${userPos.lng.toFixed(4)}` : "Click to activate real-time GPS tracking"}
          >
            <Navigation size={11} style={{ transform: isTrackingUser ? "rotate(-45deg)" : "none", color: isTrackingUser ? "var(--term-cyan)" : "inherit" }} />
            <span>{isTrackingUser ? "GPS: TRACKING" : "Track GPS"}</span>
          </button>

          {/* Live Fleet Track Button */}
          <button
            type="button"
            className={`cad-track-btn ${showCrews ? "crew-active" : ""}`}
            onClick={() => setShowCrews(prev => !prev)}
            title="Toggle autonomous rapid-response municipal crew tracking"
          >
            <Truck size={11} style={{ color: showCrews ? "var(--cad-green)" : "inherit" }} />
            <span>{showCrews ? `Fleet (${selectedCity === "all" ? liveCrews.length : liveCrews.filter(c => c.city === selectedCity).length})` : "Fleet: OFF"}</span>
          </button>

          <select
            className="cad-select-field"
            style={{ width: "auto", padding: "4px 8px", fontSize: "0.75rem" }}
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
          >
            <option value="bengaluru">Bengaluru, KA</option>
            <option value="delhi">New Delhi, NCR</option>
            <option value="mumbai">Mumbai, MH</option>
            <option value="hyderabad">Hyderabad, TG</option>
            <option value="chennai">Chennai, TN</option>
            <option value="all">Pan-India (All)</option>
          </select>
          {onOpenTerminal && (
            <button
              className="btn-cad"
              style={{ padding: "4px 10px", fontSize: "0.72rem", color: "var(--term-cyan)" }}
              onClick={onOpenTerminal}
            >
              &gt;_ Terminal
            </button>
          )}
        </div>
      </div>

      <div className="map-cad-workspace">
        <aside className="cad-events-feed">
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-cad)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--cad-blue)" }}>
              Recent Reports ({filteredReports.length})
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--cad-green)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="live-pulse-dot" />
              Live Feed
            </span>
          </div>

          <div className="cad-feed-scroll">
            {filteredReports.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.76rem" }}>
                <div>NO REPORTS IN THIS CATEGORY</div>
                <div style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "0.7rem" }}>TRY SWITCHING CATEGORY OR CITY</div>
              </div>
            ) : (
              filteredReports.map((rep) => (
              <div
                key={rep.id}
                className={`cad-feed-item ${rep.id === selectedReport?.id ? "selected" : ""}`}
                onClick={() => {
                  onSelectReport(rep.id);
                  mapInstanceRef.current?.flyTo(rep.coords, 15, { duration: 1.0 });
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "3px" }}>
                  <span style={{ color: "var(--cad-blue)" }}>{rep.categoryLabel}</span>
                  <span>{getLiveTime(rep.id)}</span>
                </div>
                <div style={{ fontFamily: "var(--font-cad)", fontSize: "0.85rem", fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: "3px" }}>
                  {rep.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: "3px" }}>
                  <MapPin size={11} color="var(--cad-blue)" />
                  <span style={{ maxWidth: userPos ? "140px" : "auto", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rep.location}</span>
                  {userPos && (
                    <span style={{ marginLeft: "auto", color: "var(--term-cyan)", fontSize: "0.68rem", fontWeight: 600 }}>
                      📍 {calcDistanceKm(userPos.lat, userPos.lng, rep.coords[0], rep.coords[1]).toFixed(1)} km
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                    <User size={10} />
                    {rep.reporterId.split("(")[0].trim()}
                  </span>
                  <span style={{ color: STATUS_COLORS[rep.status] || "var(--text-dim)", fontWeight: 600 }}>
                    {STATUS_LABELS[rep.status] || rep.status}
                  </span>
                </div>
              </div>
            )))}
          </div>
        </aside>

        <div id="cad-leaflet-map" ref={mapContainerRef} />

        <aside className="cad-telemetry-sidebar">
          {selectedCrew && (
            <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid #10b981", padding: "10px", margin: "10px", borderRadius: "2px", fontFamily: "var(--font-mono)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ color: "var(--term-green)", fontWeight: 700, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Truck size={13} />
                  LIVE DISPATCH: {selectedCrew.callsign}
                </span>
                <button
                  type="button"
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
                  onClick={() => setSelectedCrew(null)}
                >
                  <X size={13} />
                </button>
              </div>

              <div style={{ color: "#fff", fontSize: "0.74rem", marginBottom: "4px" }}>
                {selectedCrew.unitType}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "0.68rem", marginTop: "8px", background: "rgba(0,0,0,0.45)", padding: "6px", border: "1px solid var(--border-cad)" }}>
                <div>Speed: <strong style={{ color: "var(--term-cyan)" }}>{selectedCrew.speedKmh} km/h</strong></div>
                <div>Radio: <strong style={{ color: "#fff" }}>{selectedCrew.radioChannel}</strong></div>
                <div>ETA: <strong style={{ color: "var(--term-yellow)" }}>{selectedCrew.etaMinutes} mins</strong></div>
                <div>Coords: <strong style={{ color: "var(--text-dim)" }}>{selectedCrew.coords[0].toFixed(3)}, {selectedCrew.coords[1].toFixed(3)}</strong></div>
              </div>

              <div style={{ marginTop: "8px", fontSize: "0.7rem", borderTop: "1px dashed rgba(16, 185, 129, 0.3)", paddingTop: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Target Incident: </span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{selectedCrew.targetTitle} ({selectedCrew.targetReportId})</span>
              </div>
            </div>
          )}

          {selectedReport ? (
            <>
              <div className="cad-corner cad-corner-tl" />
              <div className="cad-corner cad-corner-tr" />
              <div className="cad-corner cad-corner-bl" />
              <div className="cad-corner cad-corner-br" />

              <div className="cad-console-header">
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)" }}>Report ID: </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--cad-blue)", fontWeight: 700 }}>
                    {selectedReport.id}
                  </span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={10} />
                  {liveClock}
                </span>
              </div>

              <div className="cad-sidebar-scroll">
                <div style={{ position: "relative", marginBottom: "1rem" }}>
                  <img
                    src={selectedReport.image}
                    alt={selectedReport.title}
                    style={{ width: "100%", height: "160px", objectFit: "cover", border: "1px solid var(--border-cad)" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "6px",
                      left: "6px",
                      background: "rgba(10, 14, 23, 0.9)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      padding: "2px 6px",
                      border: "1px solid var(--border-cad)",
                      color: "var(--cad-blue)"
                    }}
                  >
                    {selectedReport.blueprintDim}
                  </span>
                </div>

                <div className="cad-block-header">
                  <span>{selectedReport.specCode}</span>
                  <span style={{ color: selectedReport.urgency === "LVL_4_CRITICAL" ? "var(--cad-red)" : "var(--cad-amber)" }}>
                    {selectedReport.urgency === "LVL_4_CRITICAL" ? "Critical Priority" : "Standard Priority"}
                  </span>
                </div>

                <h3 style={{ fontFamily: "var(--font-cad)", fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                  {selectedReport.title}
                </h3>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: "0.5rem" }}>
                  <span>Status:</span>
                  <span style={{ color: STATUS_COLORS[selectedReport.status] || "var(--cad-blue)", fontWeight: 600 }}>
                    {STATUS_LABELS[selectedReport.status] || selectedReport.status}
                  </span>
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <User size={11} color="var(--cad-blue)" />
                  {selectedReport.reporterId}
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} color="var(--text-muted)" />
                  {getLiveTime(selectedReport.id)}
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={11} color="var(--cad-blue)" />
                  {selectedReport.location} ({selectedReport.coords[0].toFixed(4)}, {selectedReport.coords[1].toFixed(4)})
                </div>

                {cityTelemetry && (
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "8px 10px", marginBottom: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                    <div style={{ color: "var(--cad-green)", fontSize: "0.68rem", display: "flex", justifyContent: "space-between" }}>
                      <span>LIVE ENVIRONMENTAL SENSOR:</span>
                      <span>STATUS: {cityTelemetry.status}</span>
                    </div>
                    <div style={{ color: "#fff", fontWeight: 600, marginTop: "4px", display: "flex", gap: "12px", fontSize: "0.74rem" }}>
                      <span>AQI: {cityTelemetry.aqi}</span>
                      <span>PM2.5: {cityTelemetry.pm2_5} µg/m³</span>
                      <span>PM10: {cityTelemetry.pm10} µg/m³</span>
                    </div>
                  </div>
                )}

                <div style={{ background: "rgba(56, 189, 248, 0.05)", border: "1px solid var(--border-cad)", padding: "8px 10px", marginBottom: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                  <div style={{ color: "var(--text-dim)", fontSize: "0.68rem" }}>Field Assessment:</div>
                  <div style={{ color: "var(--cad-blue)", fontWeight: 600, marginTop: "2px" }}>
                    {selectedReport.toleranceDelta}
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: 1.55, background: "var(--bg-deep)", padding: "10px", border: "1px solid var(--border-cad)", marginBottom: "1.2rem" }}>
                  {selectedReport.structuralDiagnosis}
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--cad-blue)", marginBottom: "6px" }}>
                  Update History:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderLeft: "2px solid var(--border-cad)", paddingLeft: "10px", marginLeft: "4px", marginBottom: "1.5rem" }}>
                  {selectedReport.actions.map((act, i) => (
                    <div key={i} style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>
                      <span style={{ color: "var(--text-muted)" }}>[{act.timestamp}] </span>
                      <span style={{ color: "var(--text-dim)" }}>{act.operation}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "0.8rem 1rem", background: "var(--bg-navy)", borderTop: "1px solid var(--border-cad)", display: "flex", gap: "8px" }}>
                <button
                  className={`btn-cad ${selectedReport && verifiedReportIds.includes(selectedReport.id) ? "btn-cad-primary" : ""}`}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => onUpvoteReport(selectedReport.id)}
                >
                  <ThumbsUp size={13} />
                  <span>{selectedReport && verifiedReportIds.includes(selectedReport.id) ? `✓ Verified (${selectedReport.upvotes})` : `Verify (${selectedReport.upvotes})`}</span>
                </button>

                <button
                  className="btn-cad btn-cad-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => {
                    setVolunteerStatus("✓ Enrolled");
                    setTimeout(() => setVolunteerStatus("Volunteer to Help"), 3000);
                  }}
                >
                  <span>{volunteerStatus}</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "var(--text-dim)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Info size={28} color="var(--cad-blue)" style={{ marginBottom: "1rem" }} />
              <h4 style={{ fontFamily: "var(--font-cad)", color: "#fff", marginBottom: "0.5rem" }}>
                Telemetry Inspector
              </h4>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                Click any report marker on the map or from the feed list to view detailed community diagnoses and action items.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
