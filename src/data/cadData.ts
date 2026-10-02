import { CadReportItem, SdgTargetSpec, CadChecklistItem } from "../types";

export const INITIAL_CAD_REPORTS: CadReportItem[] = [
  {
    id: "REP-8041",
    specCode: "SDG 11.7 / Solar Asset",
    title: "Broken Solar Micro-Inverter at Cubbon Park Bamboo Grove",
    category: "eco-assets",
    categoryLabel: "Eco-Asset",
    status: "INVESTIGATING",
    urgency: "LVL_3_ELEVATED",
    gridSector: "Central Ward / Cubbon Park, Bengaluru",
    location: "Cubbon Park Green Corridor, Bengaluru",
    coords: [12.9763, 77.5929],
    reportedTime: "14 mins ago",
    upvotes: 48,
    reporterId: "Kavitha Sundaram (Urban Horticulturist)",
    structuralDiagnosis: "Hybrid solar battery inverter tripped during noon heat. Water pumps currently running on emergency backup. Needs certified capacitor reset.",
    toleranceDelta: "Voltage Delta: +14.8% Out of Spec",
    image: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "3400 x 1200 mm // Roof Array",
    actions: [
      { timestamp: "12m ago", txCode: "REC-9901", operation: "Issue logged into district workorder system", nodeOperator: "BBMP Gateway" },
      { timestamp: "4m ago", txCode: "REC-9902", operation: "Forwarded to BESCOM solar clean energy maintenance", nodeOperator: "City Operations" }
    ]
  },
  {
    id: "REP-8042",
    specCode: "SDG 11.2 / Bike Lane",
    title: "Deep Pothole & Trench on 100 Feet Road Cycle Track",
    category: "infrastructure",
    categoryLabel: "Infrastructure",
    status: "WORKORDER_QUEUED",
    urgency: "LVL_4_CRITICAL",
    gridSector: "Indiranagar Ward 112, Bengaluru",
    location: "100 Feet Road & 12th Main, Indiranagar, Bengaluru",
    coords: [12.9719, 77.6412],
    reportedTime: "48 mins ago",
    upvotes: 93,
    reporterId: "Arjun Reddy (Bengaluru Transit Coalition)",
    structuralDiagnosis: "Asphalt substrate collapsed along a 2.4-meter linear utility cut. 210mm trench forcing cyclists into vehicle traffic lanes. Two flat tires reported this morning.",
    toleranceDelta: "Surface Depth: -210 mm Trench",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "2400 x 450 mm // Road Cut",
    actions: [
      { timestamp: "32m ago", txCode: "REC-8841", operation: "Report verified by 8 nearby commuters", nodeOperator: "Citizen App" },
      { timestamp: "18m ago", txCode: "REC-8842", operation: "Asphalt patching crew scheduled for 2:30 PM", nodeOperator: "BBMP Road Works" }
    ]
  },
  {
    id: "REP-8043",
    specCode: "SDG 11.6 / Recycling",
    title: "Overflowing Smart Battery & E-Waste Bin at Metro Gate 2",
    category: "waste",
    categoryLabel: "Waste & Recycling",
    status: "CREW_DISPATCHED",
    urgency: "LVL_3_ELEVATED",
    gridSector: "MG Road Transit Corridor, Bengaluru",
    location: "MG Road Metro Station Entry, Bengaluru",
    coords: [12.9756, 77.6066],
    reportedTime: "2 hours ago",
    upvotes: 36,
    reporterId: "Priya Nair (Metro Commuter)",
    structuralDiagnosis: "Lithium battery dropoff bin reached 104% capacity. Exposed batteries exposed to morning moisture. Hazard sensor triggered dispatch alert.",
    toleranceDelta: "Bin Volume: 104% (Overflow)",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "1200 x 1200 x 1800 mm",
    actions: [
      { timestamp: "1h ago", txCode: "REC-7712", operation: "Automated overflow ticket created", nodeOperator: "Bin Sensor" },
      { timestamp: "25m ago", txCode: "REC-7714", operation: "Collection vehicle dispatched, ETA 15 mins", nodeOperator: "BMRCL Sanitation" }
    ]
  },
  {
    id: "REP-8044",
    specCode: "SDG 11.7 / Green Space",
    title: "Restored Rainwater Bioswale and Native Buffer at Agara Lake",
    category: "eco-assets",
    categoryLabel: "Eco-Asset",
    status: "RESOLVED_VERIFIED",
    urgency: "LVL_1_NOMINAL",
    gridSector: "HSR Layout Sector 1, Bengaluru",
    location: "Agara Lake Wetland Perimeter, HSR Layout, Bengaluru",
    coords: [12.9237, 77.6521],
    reportedTime: "3 hours ago",
    upvotes: 128,
    reporterId: "Meera Deshpande (Rewilding Volunteer)",
    structuralDiagnosis: "Citizen-planted gravel bioswale successfully absorbed runoff during last rainstorm. Zero pooling on adjacent sidewalk. Healthy native grass growth.",
    toleranceDelta: "Infiltration Rate: 52 mm/hr (Optimal)",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "48 x 2.2 m Retention Strip",
    actions: [
      { timestamp: "3h ago", txCode: "REC-6041", operation: "Infiltration rate survey completed", nodeOperator: "Field Volunteer" },
      { timestamp: "2h ago", txCode: "REC-6043", operation: "Added to municipal natural asset inventory", nodeOperator: "Karnataka Forest Dept" }
    ]
  },
  {
    id: "REP-8045",
    specCode: "SDG 11.2 / Transit Shelter",
    title: "Damaged Bus Queue Canopy & Missing Wheelchair Ramp",
    category: "mobility",
    categoryLabel: "Clean Mobility",
    status: "INVESTIGATING",
    urgency: "LVL_2_MODERATE",
    gridSector: "Majestic Interchange, Bengaluru",
    location: "Majestic BMTC Bus Terminal Platform 4, Bengaluru",
    coords: [12.9772, 77.5713],
    reportedTime: "4 hours ago",
    upvotes: 31,
    reporterId: "Ravi Krishnamurthy (Commuter)",
    structuralDiagnosis: "Real-time bus arrival display unpowered for two days. Shelter canopy shade cracked, leaving passengers in direct sun during hot afternoon waits.",
    toleranceDelta: "Surface Temp: +12°C Above Ambient",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "6200 x 2400 mm Canopy",
    actions: [
      { timestamp: "4h ago", txCode: "REC-5510", operation: "Display outage verified via transit feed", nodeOperator: "BMTC API" },
      { timestamp: "3h ago", txCode: "REC-5512", operation: "Replacement controller assigned to field team", nodeOperator: "BMTC Maintenance" }
    ]
  },
  {
    id: "REP-8046",
    specCode: "SDG 11.B / Storm Drain",
    title: "Clogged Stormwater Culvert at Bellandur Tech Corridor",
    category: "water",
    categoryLabel: "Water Drainage",
    status: "RESOLVED_VERIFIED",
    urgency: "LVL_4_CRITICAL",
    gridSector: "Outer Ring Road Ward 150, Bengaluru",
    location: "Outer Ring Road at Bellandur Flyover, Bengaluru",
    coords: [12.9304, 77.6784],
    reportedTime: "6 hours ago",
    upvotes: 82,
    reporterId: "Namma Clean Lakes Volunteer Group",
    structuralDiagnosis: "Stormwater outfall grate clogged with plastic waste causing 140mm water pooling on pedestrian walkway. Completely cleared by community volunteer crew.",
    toleranceDelta: "Drainage Flow: 100% Restored",
    image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "900 mm Diameter Outfall",
    actions: [
      { timestamp: "5h ago", txCode: "REC-4401", operation: "Volunteer squad cleared 48kg debris", nodeOperator: "Community Cleanup" },
      { timestamp: "4h ago", txCode: "REC-4405", operation: "Ward engineer verified clean water flow", nodeOperator: "BBMP Stormwater Dept" }
    ]
  },
  {
    id: "REP-9001",
    specCode: "SDG 11.2 / Footpath",
    title: "Broken Footpath Tiles Near Connaught Place Metro Exit",
    category: "infrastructure",
    categoryLabel: "Infrastructure",
    status: "WORKORDER_QUEUED",
    urgency: "LVL_3_ELEVATED",
    gridSector: "New Delhi Municipal Council Zone, Delhi",
    location: "Rajiv Chowk Metro Gate 6, Connaught Place, New Delhi",
    coords: [28.6328, 77.2197],
    reportedTime: "22 mins ago",
    upvotes: 67,
    reporterId: "Amit Sharma (Pedestrian Safety Advocate)",
    structuralDiagnosis: "Loose and cracked vitrified tiles along a 12-meter stretch near metro exit creating trip hazard for commuters. Two elderly pedestrians reported falls this week.",
    toleranceDelta: "Surface Level: -85mm Depression",
    image: "https://images.unsplash.com/photo-1517732306149-e8f829eb588a?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "12000 x 1800 mm Footpath",
    actions: [
      { timestamp: "18m ago", txCode: "REC-9101", operation: "Reported via NDMC Swachh Delhi App", nodeOperator: "NDMC Portal" },
      { timestamp: "8m ago", txCode: "REC-9102", operation: "Tile replacement crew assigned for evening shift", nodeOperator: "NDMC Public Works" }
    ]
  },
  {
    id: "REP-9002",
    specCode: "SDG 11.7 / Urban Forest",
    title: "Community Tree Plantation Drive at Lodhi Garden Buffer",
    category: "eco-assets",
    categoryLabel: "Eco-Asset",
    status: "RESOLVED_VERIFIED",
    urgency: "LVL_1_NOMINAL",
    gridSector: "Lodhi Colony Ward, South Delhi",
    location: "Lodhi Garden South Gate, New Delhi",
    coords: [28.5916, 77.2274],
    reportedTime: "5 hours ago",
    upvotes: 112,
    reporterId: "Sunita Verma (Delhi Green Warriors)",
    structuralDiagnosis: "Successfully planted 45 native Neem and Peepal saplings along the southern boundary wall. Drip irrigation installed. Expected canopy coverage in 3 years.",
    toleranceDelta: "Canopy Projection: +380 sq.m in 3 Years",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "120 m Linear Buffer Strip",
    actions: [
      { timestamp: "5h ago", txCode: "REC-9201", operation: "Plantation drive completed with 60 volunteers", nodeOperator: "Delhi Green Warriors" },
      { timestamp: "3h ago", txCode: "REC-9203", operation: "Added to DDA urban forestry inventory", nodeOperator: "DDA Horticulture" }
    ]
  },
  {
    id: "REP-9003",
    specCode: "SDG 11.6 / Waste",
    title: "Illegal Debris Dump Blocking Pedestrian Path at Andheri Station",
    category: "waste",
    categoryLabel: "Waste & Recycling",
    status: "CREW_DISPATCHED",
    urgency: "LVL_4_CRITICAL",
    gridSector: "Andheri West Ward, Mumbai",
    location: "Andheri Railway Station West Exit, Mumbai",
    coords: [19.1197, 72.8464],
    reportedTime: "35 mins ago",
    upvotes: 54,
    reporterId: "Farhan Patel (Daily Commuter)",
    structuralDiagnosis: "Construction debris illegally dumped overnight blocking the entire pedestrian walkway from station west exit. Commuters forced onto the road during rush hour.",
    toleranceDelta: "Obstruction: 100% Path Blocked",
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "8000 x 2400 mm Debris Spread",
    actions: [
      { timestamp: "30m ago", txCode: "REC-9301", operation: "Photo evidence forwarded to BMC complaint cell", nodeOperator: "BMC Helpline" },
      { timestamp: "12m ago", txCode: "REC-9302", operation: "BMC debris removal truck dispatched, ETA 20 mins", nodeOperator: "BMC Solid Waste Dept" }
    ]
  },
  {
    id: "REP-9004",
    specCode: "SDG 11.2 / Bus Shelter",
    title: "Damaged BEST Bus Shelter Roof at Dadar TT Circle",
    category: "mobility",
    categoryLabel: "Clean Mobility",
    status: "INVESTIGATING",
    urgency: "LVL_3_ELEVATED",
    gridSector: "Dadar Ward, Central Mumbai",
    location: "Dadar TT Circle BEST Bus Stop, Mumbai",
    coords: [19.0178, 72.8478],
    reportedTime: "1 hour ago",
    upvotes: 41,
    reporterId: "Neha Kulkarni (Transit Rider)",
    structuralDiagnosis: "Shelter roof panel cracked from last monsoon storm, leaking heavily during rain. LED route display also non-functional for 5 days.",
    toleranceDelta: "Structural Integrity: Compromised",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "5400 x 2200 mm Canopy",
    actions: [
      { timestamp: "55m ago", txCode: "REC-9401", operation: "Complaint logged via BEST Sahayak app", nodeOperator: "BEST Transport" },
      { timestamp: "30m ago", txCode: "REC-9402", operation: "Site inspection scheduled for tomorrow AM", nodeOperator: "BEST Maintenance" }
    ]
  },
  {
    id: "REP-9005",
    specCode: "SDG 11.B / Flood Zone",
    title: "Waterlogged Underpass at Begumpet Railway Crossing",
    category: "water",
    categoryLabel: "Water Drainage",
    status: "CREW_DISPATCHED",
    urgency: "LVL_4_CRITICAL",
    gridSector: "Begumpet Ward, Secunderabad, Hyderabad",
    location: "Begumpet Railway Underpass, Hyderabad",
    coords: [17.4432, 78.4672],
    reportedTime: "40 mins ago",
    upvotes: 73,
    reporterId: "Venkat Rao (Neighbourhood Watch)",
    structuralDiagnosis: "Underpass flooded to 450mm depth after overnight rain. Two-wheelers stranded, pedestrians wading through contaminated water. Pump station motor appears non-functional.",
    toleranceDelta: "Water Level: 450mm (Impassable)",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "80m Underpass Length",
    actions: [
      { timestamp: "35m ago", txCode: "REC-9501", operation: "Alert raised on GHMC Dial 100 portal", nodeOperator: "GHMC Helpline" },
      { timestamp: "15m ago", txCode: "REC-9502", operation: "Dewatering pump crew dispatched from Secunderabad depot", nodeOperator: "GHMC Drainage Wing" }
    ]
  },
  {
    id: "REP-9006",
    specCode: "SDG 11.7 / Park Restoration",
    title: "Restored Walking Trail and Native Planting at KBR Park",
    category: "eco-assets",
    categoryLabel: "Eco-Asset",
    status: "RESOLVED_VERIFIED",
    urgency: "LVL_1_NOMINAL",
    gridSector: "Jubilee Hills Ward, Hyderabad",
    location: "KBR National Park East Trail, Hyderabad",
    coords: [17.4156, 78.4347],
    reportedTime: "8 hours ago",
    upvotes: 96,
    reporterId: "Lakshmi Iyer (GHMC Green Volunteer)",
    structuralDiagnosis: "Eroded walking trail re-graveled with permeable laterite aggregate. 28 native Gulmohar and Tabebuia saplings planted along 200m stretch. Benches repainted.",
    toleranceDelta: "Trail Surface: 100% Restored",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "200 x 2.5 m Trail Section",
    actions: [
      { timestamp: "8h ago", txCode: "REC-9601", operation: "Trail restoration completed by 32 volunteers", nodeOperator: "KBR Park Trust" },
      { timestamp: "6h ago", txCode: "REC-9603", operation: "Verified and added to Hyderabad green asset registry", nodeOperator: "GHMC Parks Dept" }
    ]
  },
  {
    id: "REP-9007",
    specCode: "SDG 11.2 / Cycle Lane",
    title: "Missing Bollards on Marina Beach Cycling Track",
    category: "infrastructure",
    categoryLabel: "Infrastructure",
    status: "WORKORDER_QUEUED",
    urgency: "LVL_3_ELEVATED",
    gridSector: "Mylapore-Triplicane Ward, Chennai",
    location: "Marina Beach Promenade Cycle Track, Chennai",
    coords: [13.0500, 80.2824],
    reportedTime: "1 hour ago",
    upvotes: 58,
    reporterId: "Karthik Subramanian (Chennai Cycling Club)",
    structuralDiagnosis: "12 protective bollards removed or broken along 400m stretch of dedicated cycle track. Cars now parking on the cycling lane, forcing riders onto the main road.",
    toleranceDelta: "Barrier Coverage: 30% Missing",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "400 m Track Section",
    actions: [
      { timestamp: "50m ago", txCode: "REC-9701", operation: "Photo evidence uploaded to GCC complaint portal", nodeOperator: "GCC Smart City" },
      { timestamp: "25m ago", txCode: "REC-9702", operation: "Bollard replacement order placed with vendor", nodeOperator: "GCC Road Division" }
    ]
  },
  {
    id: "REP-9008",
    specCode: "SDG 11.6 / E-Waste",
    title: "Overflowing E-Waste Collection Point at T. Nagar Bus Stand",
    category: "waste",
    categoryLabel: "Waste & Recycling",
    status: "INVESTIGATING",
    urgency: "LVL_2_MODERATE",
    gridSector: "T. Nagar Ward 173, Chennai",
    location: "T. Nagar CMBT Bus Stand E-Waste Hub, Chennai",
    coords: [13.0418, 80.2341],
    reportedTime: "3 hours ago",
    upvotes: 29,
    reporterId: "Divya Rajan (Resident)",
    structuralDiagnosis: "E-waste collection bin overflowing with old phone chargers, batteries, and CRT monitor parts. Bin not emptied in over 10 days despite scheduled weekly pickup.",
    toleranceDelta: "Bin Capacity: 120% (Overflow)",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "1500 x 1500 x 2000 mm Bin",
    actions: [
      { timestamp: "2h ago", txCode: "REC-9801", operation: "Complaint registered on GCC Namma Chennai app", nodeOperator: "GCC Portal" },
      { timestamp: "1h ago", txCode: "REC-9802", operation: "Awaiting pickup schedule confirmation from vendor", nodeOperator: "GCC Solid Waste Mgmt" }
    ]
  },
  {
    id: "REP-9009",
    specCode: "SDG 11.B / Drainage",
    title: "Blocked Stormwater Channel Near ITO Ring Road Crossing",
    category: "water",
    categoryLabel: "Water Drainage",
    status: "CREW_DISPATCHED",
    urgency: "LVL_4_CRITICAL",
    gridSector: "ITO Junction Ward, Central Delhi",
    location: "Vikas Marg & Ring Road Underpass, ITO, New Delhi",
    coords: [28.6289, 77.2410],
    reportedTime: "18 mins ago",
    upvotes: 79,
    reporterId: "Rajesh Malhotra (Commuter)",
    structuralDiagnosis: "Stormwater outfall blocked by silt and dry leaves causing 180mm backflow onto Vikas Marg junction. Delhi Traffic Police diverting left turns.",
    toleranceDelta: "Backflow Depth: +180mm",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "1200 mm Outfall Culvert",
    actions: [
      { timestamp: "15m ago", txCode: "REC-9901", operation: "Emergency alert routed to PWD Drainage Cell", nodeOperator: "Delhi Traffic Control" },
      { timestamp: "5m ago", txCode: "REC-9902", operation: "Super-sucker suction vehicle en route from Barakhamba depot", nodeOperator: "PWD Delhi" }
    ]
  },
  {
    id: "REP-9010",
    specCode: "SDG 11.7 / Solar Asset",
    title: "Non-Functional Solar Streetlight Cluster on Marine Drive",
    category: "eco-assets",
    categoryLabel: "Eco-Asset",
    status: "WORKORDER_QUEUED",
    urgency: "LVL_3_ELEVATED",
    gridSector: "Churchgate Ward, South Mumbai",
    location: "Marine Drive Promenade opposite Brabourne Stadium, Mumbai",
    coords: [18.9322, 72.8264],
    reportedTime: "52 mins ago",
    upvotes: 43,
    reporterId: "Aaditya Merchant (Marine Drive Citizens Forum)",
    structuralDiagnosis: "Six consecutive solar-powered LED masts failed to activate at dusk due to salt spray corrosion on terminal junction boxes.",
    toleranceDelta: "Photovoltaic Output: 0 V (Open Circuit)",
    image: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "240 m Linear Lighting Zone",
    actions: [
      { timestamp: "40m ago", txCode: "REC-9911", operation: "Logged via MCGM 24x7 Citizen Portal", nodeOperator: "MCGM Portal" },
      { timestamp: "20m ago", txCode: "REC-9912", operation: "Electrical maintenance team assigned to replace weather seals", nodeOperator: "MCGM Streetlights" }
    ]
  },
  {
    id: "REP-9011",
    specCode: "SDG 11.2 / Pedestrian Safety",
    title: "Damaged Tactile Paving & Open Utility Pit at Hitec City Cyber Towers",
    category: "infrastructure",
    categoryLabel: "Infrastructure",
    status: "INVESTIGATING",
    urgency: "LVL_4_CRITICAL",
    gridSector: "Madhapur Ward, Hitec City, Hyderabad",
    location: "Cyber Towers Junction Footpath, Madhapur, Hyderabad",
    coords: [17.4504, 78.3808],
    reportedTime: "30 mins ago",
    upvotes: 62,
    reporterId: "Pranathi Reddy (Tech Corridor Commuter)",
    structuralDiagnosis: "Fiber-optic pit lid shattered by heavy vehicle encroachment. 600mm deep unshielded hole directly on tactile footpath lane near metro pillar 12.",
    toleranceDelta: "Hazard Void: 600mm Deep Uncovered",
    image: "https://images.unsplash.com/photo-1517732306149-e8f829eb588a?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "900 x 900 x 600 mm Utility Pit",
    actions: [
      { timestamp: "25m ago", txCode: "REC-9921", operation: "Urgent citizen hazard ticket submitted", nodeOperator: "GHMC App" },
      { timestamp: "10m ago", txCode: "REC-9922", operation: "Barricades placed by traffic marshal awaiting slab replacement", nodeOperator: "Madhapur Traffic PS" }
    ]
  },
  {
    id: "REP-9012",
    specCode: "SDG 11.7 / Wetland",
    title: "Restored Mangrove Buffer & Retention Basin at Adyar Eco Park",
    category: "eco-assets",
    categoryLabel: "Eco-Asset",
    status: "RESOLVED_VERIFIED",
    urgency: "LVL_1_NOMINAL",
    gridSector: "Adyar Ward 172, Chennai",
    location: "Adyar Poonga Wetland Boundary, Raja Annamalaipuram, Chennai",
    coords: [13.0180, 80.2588],
    reportedTime: "7 hours ago",
    upvotes: 119,
    reporterId: "S. Balasubramanian (Adyar Wetland Society)",
    structuralDiagnosis: "120 meters of littoral mangrove embankment reinforced with geo-textile coir matting. Native Avicennia marina saplings thriving with 96% survival rate.",
    toleranceDelta: "Salinity Tolerance: Within Healthy Brackish Range",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    blueprintDim: "120 x 4.5 m Tidal Zone",
    actions: [
      { timestamp: "7h ago", txCode: "REC-9931", operation: "Citizen inspection and water testing completed", nodeOperator: "Adyar Eco Trust" },
      { timestamp: "5h ago", txCode: "REC-9932", operation: "Verified by Chennai Rivers Restoration Trust", nodeOperator: "CRRT Field Team" }
    ]
  }
];

export const SDG11_CAD_SPECS: SdgTargetSpec[] = [
  {
    id: "11.1",
    subsystem: "Adequate Housing & Upgrades",
    title: "Safe, Resilient and Affordable Housing",
    specDesignation: "UN SDG Target 11.1",
    engineeringStandard: "Housing Safety & Insulation Standards",
    description: "Ensure everyone has access to adequate, safe, and affordable housing with basic clean water and energy services, upgrading vulnerable settlements into resilient neighborhoods.",
    metricsRatio: "Global Need: 1.1 Billion people lack adequate shelter",
    cadAction: "Map poorly insulated rental housing, unpiped water connections, and unreinforced buildings for city retrofit budgets.",
    diagramSvgType: "housing"
  },
  {
    id: "11.2",
    subsystem: "Clean & Active Mobility",
    title: "Affordable and Sustainable Transport Systems",
    specDesignation: "UN SDG Target 11.2",
    engineeringStandard: "NACTO Urban Street Design Guidelines",
    description: "Provide safe, affordable, accessible, and sustainable public transit and protected bike paths for all, paying special attention to women, children, and people with disabilities.",
    metricsRatio: "Current Transit Access: Only 51.6% of urban residents",
    cadAction: "Document bike lane gaps, missing curb ramps, and unshaded bus stops to generate municipal repair work orders.",
    diagramSvgType: "mobility"
  },
  {
    id: "11.3",
    subsystem: "Participatory Planning",
    title: "Inclusive and Citizen-Driven Urban Planning",
    specDesignation: "UN SDG Target 11.3",
    engineeringStandard: "ISO 37120 Sustainable Cities Standard",
    description: "Strengthen inclusive, participatory, and sustainable city planning by giving residents transparent map data and tools to participate in neighborhood design.",
    metricsRatio: "Community-led planning reduces climate vulnerability by 64%",
    cadAction: "Share neighborhood report data directly with local district councils during public comment meetings.",
    diagramSvgType: "planning"
  },
  {
    id: "11.6",
    subsystem: "Air Quality & Waste",
    title: "Reduce Urban Air Pollution & Manage Waste",
    specDesignation: "UN SDG Target 11.6",
    engineeringStandard: "WHO Clean Air Guidelines & Circular Waste",
    description: "Reduce the per-capita environmental impact of cities by improving ambient air quality and building neighborhood composting and battery recycling networks.",
    metricsRatio: "Air Quality: 99% of global city residents breathe polluted air",
    cadAction: "Log overflowing recycling bins, unauthorized trash dumps, and local composting hubs on the city map.",
    diagramSvgType: "waste"
  },
  {
    id: "11.7",
    subsystem: "Green Public Spaces",
    title: "Universal Access to Safe, Green Spaces",
    specDesignation: "UN SDG Target 11.7",
    engineeringStandard: "Nature-Based Urban Infrastructure",
    description: "Ensure universal access to safe, inclusive, green public spaces and street canopies to reduce urban heat islands by 3°C to 5°C.",
    metricsRatio: "Urban Canopy: Lowers neighborhood peak heat by up to 4.2°C",
    cadAction: "Identify asphalt areas for pocket parks, report dying street trees, and map neighborhood community gardens.",
    diagramSvgType: "green"
  },
  {
    id: "11.B",
    subsystem: "Disaster Resilience",
    title: "Disaster Risk Reduction and Climate Adaptation",
    specDesignation: "UN SDG Target 11.B",
    engineeringStandard: "Climate Adaptation Framework",
    description: "Build municipal infrastructure that withstands flash floods, extreme heat, and storms through permeable surfaces and decentralized emergency power.",
    metricsRatio: "Cost Benefit: Every $1 invested in resilience saves $7 in repairs",
    cadAction: "Flag clogged storm drains and flood-prone intersections before heavy seasonal rains.",
    diagramSvgType: "resilience"
  }
];

export const CAD_CHECKLIST_ITEMS: CadChecklistItem[] = [
  {
    id: "TASK-01",
    componentCode: "Urban Canopy",
    role: "Local Explorer",
    taskTitle: "Map 1 Tree Canopy or Green Space",
    impactXp: 35,
    cadTolerance: "Accuracy: ±1 meter",
    specification: "Pin a street tree, community garden, or bioswale in your neighborhood on the EcoMap."
  },
  {
    id: "TASK-02",
    componentCode: "Transit Safety",
    role: "Pedestrian Auditor",
    taskTitle: "Check a Crosswalk or Bus Stop for Wheelchair Access",
    impactXp: 50,
    cadTolerance: "Grade: Compliant Ramp",
    specification: "Confirm crosswalk curb ramps are clear of cracks and bus stops have clear waiting room."
  },
  {
    id: "TASK-03",
    componentCode: "Stormwater Intake",
    role: "Neighborhood Steward",
    taskTitle: "Inspect a Street Catch Basin Before Rains",
    impactXp: 65,
    cadTolerance: "Grate Opening: Clear of Debris",
    specification: "Check if the storm drain on your block is free of leaves and plastic trash to prevent street flooding."
  },
  {
    id: "TASK-04",
    componentCode: "E-Waste Safety",
    role: "Circular Recycler",
    taskTitle: "Drop Off Old Batteries at a Certified Hub",
    impactXp: 80,
    cadTolerance: "Safety: Proper Dropoff",
    specification: "Keep lithium batteries and small electronics out of household trash bins."
  },
  {
    id: "TASK-05",
    componentCode: "Civic Voice",
    role: "Community Advocate",
    taskTitle: "Submit a Report to Your Local Council",
    impactXp: 120,
    cadTolerance: "Data: Open Access",
    specification: "Export verified neighborhood repair findings to share during city council public comments."
  }
];
