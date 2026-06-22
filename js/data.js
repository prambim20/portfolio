/**
 * Global Deployment Configurations & Map Datasets
 */


/* --- STATIC WORK DATA --- */
export const services = [
  {
    num: "01",
    tag: "Workflow",
    title: "X2Flood",
    description: "A framework developed during the 2025 Bekasi flood, utilizing a large language model (LLM) to analyze X (Twitter) posts. The pipeline combined scraping, filtering to cancel out noise, sentiment analysis to capture flood impacts, and reverse geocoding to anchor posts into a spatial model.",
    imageUrl: "./data/images/X2Flood.webp",
    imageAlt: "X2Flood-Telemetry",
    legend: {
      type: "continuous",
      title: "Post Density (points/30m)",
      min: "0",
      max: "150",
      gradient: "linear-gradient(to right, #f7fbff, #08306b)"
    }
  },
  {
    num: "02",
    tag: "Workflow",
    title: "RoadMatcher",
    description: "A framework designed to compare OSM and Microsoft RoadDetections datasets in Surabaya. By preprocessing road data and applying topological logic and geometric descriptors, the framework identifies differences between the two sources and finds gaps in mapped road networks.",
    imageUrl: "./data/images/RoadMatcher.webp",
    imageAlt: "RoadMatcher-Telemetry",
    legend: {
      type: "discrete",
      title: "Road Detection",
      items: [
        { label: "Existing", color: "#ffffff" },
        { label: "Missing", color: "#e31a1c" }
      ]
    }
  },
  {
    num: "03",
    tag: "Model",
    title: "OilPalm3DETR",
    description: "A model developed for palm oil tree inventory and monitoring, adapted from RF-DETR for drone RGB imagery. The model was trained and fine-tuned to address imbalanced datasets, incorporating sliding window inference and non-max merging to improve detection in dense plantation areas.",
    imageUrl: "./data/images/OilPalm3DETR.webp",
    imageAlt: "OilPalm3DETR-Telemetry",
    legend: {
      type: "discrete",
      title: "Oil Palm Tree Condition",
      items: [
        { label: "Intact/Healthy", color: "#fff000" },
        { label: "Degraded/Unhealthy", color: "#f00000" }
      ]
    }
  },
  {
    num: "04",
    tag: "Dataset",
    title: "BuildHeight",
    description: "A dataset developed to represent building heights across the entire Jakarta mainland, derived from multi-source satellite imagery. Buildings were segmented using U-Net++ and heights estimated to approximate floor counts. The dataset serves as a proxy for building height information.",
    imageUrl: "./data/images/BuildHeight.webp",
    imageAlt: "BuildHeight-Telemetry",
    legend: {
      type: "continuous",
      title: "Building Height (m)",
      min: "0",
      max: "98",
      gradient: "linear-gradient(to right, #fee5d9, #fcbba1, #fb6a4a, #de2d26, #a50f15)"
    }
  },
  {
    num: "05",
    tag: "Dataset",
    title: "BuildResident",
    description: "A dataset created using a dasymetric technique, representing settlement footprints with estimated resident counts across the Jakarta mainland. Predictors such as building charateristics and land value were applied to distinguish settlements from non-residential structures.",
    imageUrl: "./data/images/BuildResident.webp",
    imageAlt: "BuildResident-Telemetry",
    legend: {
      type: "continuous",
      title: "Building Resident (persons)",
      min: "0",
      max: "100",
      gradient: "linear-gradient(to right, #feebe2, #fcc5c0, #f768a1, #c51b8a, #7a0177)"
    }
  },
  {
    num: "06",
    tag: "Model",
    title: "DSM2NDSM",
    description: "A model developed to translate DSM into NDSM using U-Net with VGG-16 backbone, providing true relative height estimates for urban analysis and planning across the Jakarta mainland, while reducing DSM noise to better align with ground reality.",
    imageUrl: "./data/images/DSM2NDSM.webp",
    imageAlt: "DSM2NDSM-Telemetry",
    legend: {
      type: "continuous",
      title: "Height (m)",
      min: "0.0",
      max: "7.5",
      gradient: "linear-gradient(to right, #000004, #52137c, #ba3878, #fb8560, #fcfdbf)"
    }
  },
  {
    num: "07",
    tag: "Model",
    title: "SAR∞Optics",
    description: "A model developed using CycleGAN to translate SAR intensity data into multispectral imagery, and vice versa (∞). It enables representation when clouds or haze obscure vision, while enriching temporal density by bridging SAR and optical observations for urban and environmental analysis.",
    imageUrl: "./data/images/SAR∞Optics.webp",
    imageAlt: "SAR∞Optics-Telemetry"
  },
  {
    num: "08",
    tag: "Model",
    title: "ThermalScale",
    description: "A model developed using machine learning ensemble methods to downscale Landsat LST data with ancillary predictors from multiple sources. Based on mean-ensemble and residual correction, it produces finer-resolution thermal estimates that support urban heat analysis and environmental planning.",
    imageUrl: "./data/images/ThermalScale.webp",
    imageAlt: "ThermalScale-Telemetry",
    legend: {
      type: "continuous",
      title: "Temperature (°C)",
      min: "24.0",
      max: "30.0",
      gradient: "linear-gradient(to right, #042434, #4234a0, #8e548c, #d86d6a, #fca93c, #e8fa5b)"
    }
  },
  {
    num: "09",
    tag: "Model",
    title: "SparseΣDense",
    description: "A model developed to generate dense raster data from sparse points using a convolutional architecture. By leveraging ancillary inputs such as aerial imagery as guiding information, it can be fine‑tuned to densify datasets like NDSM, extrapolating from limited observations to produce continuous surfaces.",
    imageUrl: "./data/images/SparseΣDense.webp",
    imageAlt: "SparseΣDense-Telemetry",
    legend: {
      type: "discrete",
      title: "Point",
      items: [
        { label: "Observation/Data Point", color: "#ffffff" }
      ]
    }
  }
];


/* --- INTERACTIVE SHOWCASE DATA --- */
export const projects = [
  {
    id: "sar2chm",
    title: "SAR 2 CHM",
    hudTitle: "Canopy Height Model",
    badges: ["Biophysics", "Deep Learning", "Regression"],
    coords: [3.65805725, 116.88734747],
    zoom: 10.3,
    maxZoom: 11,
    hudCoords: "Tana Tidung, IDN | 3.66° N, 116.89° E",
    description: "Canopy Height Map (CHM) derived from Sentinel-1 SAR GRD dual-pol (VV, VH) amplitude data using Visual Transformers.",
    imageOverlay: {
      url: "./data/images/SAR2CHM_Map.webp", 
      // [ [South, West], [North, East] ] format for Leaflet bounds
      bounds: [
        [3.3487662448960700, 116.2410994497819416], // Southwest corner
        [3.9672897295046297, 117.5336411218864185]  // Northeast corner
      ],
      opacity: 0.85
    },
    // Define the dynamic legend schema
    legend: {
      title: "Canopy Height (meters)",
      min: "0.00",
      max: "33.10",
      gradient: "linear-gradient(to right, #440154 0%, #414487 25%, #2a788e 50%, #22a884 75%, #fde725 100%)",
      ticks: ["0m", "8m", "16m", "24m", "33.10m"]
    }
  },
  {
    id: "detect3",
    title: "DETECT 3",
    hudTitle: "Tree Detection Map",
    badges: ["Agriculture", "Deep Learning", "Object Detection"],
    coords: [-6.63413455, 106.79214609],
    zoom: 18.95,
    maxZoom: 20,
    hudCoords: "Bogor City, IDN | -6.63° N, 106.79° E",
    description: "Tree Detection Map from drone RGB imagery, using RetinaNet fine-tuned with semi-supervised learning to identify tree species.",
    imageOverlay: {
      url: "./data/images/DETECT3_Map.webp", 
      // [ [South, West], [North, East] ] format for Leaflet bounds
      bounds: [
        [-6.6348913944271564, 106.7905781396979137], // Southwest corner
        [-6.6333777006122787, 106.7937140358448573]  // Northeast corner
      ],
      opacity: 0.85
    },
    geoJsonPath: "./data/vector/Tree_Canopy_Object.geojson",
    geoJsonStyle: {
      property: "label",
      categories: {
        "Banana": { color: "#fbbf24", fillColor: "#fbbf24", fillOpacity: 0.25, weight: 1.5 },       // Yellow/Amber
        "Other Tree": { color: "#10b981", fillColor: "#10b981", fillOpacity: 0.25, weight: 1.5 },   // Forest Green
        "Palm": { color: "#00f0ff", fillColor: "#00f0ff", fillOpacity: 0.25, weight: 1.5 }          // Cyan
      },
      default: { color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.25, weight: 1 }             // Purple Fallback
    }
  },
  {
    id: "forestmass",
    title: "FORESTMASS",
    hudTitle: "Above Ground Biomass Density Map",
    badges: ["Ecology", "Allometry", "Regression"],
    coords: [-8.61326989, 114.41520306],
    zoom: 11,
    maxZoom: 12,
    hudCoords: "Alas Purwo Park, IDN | -8.61° S, 114.42° E",
    description: "Above Ground Biomass Density (AGBD) Map from multi-source data, estimated with allometric models.",
    imageOverlay: {
      url: "./data/images/FORESTMASS_Map.webp", 
      // [ [South, West], [North, East] ] format for Leaflet bounds
      bounds: [
        [-8.7933538312069626, 114.2124461684275190],  // Southwest corner
        [-8.4331859544704795,114.6179599606793431]    // Northeast corner
      ],
      opacity: 0.85
    },
    // Define the dynamic legend schema
    legend: {
      title: "AGBD (Mg/ha)",
      min: "0.00",
      max: "359",
      gradient: "linear-gradient(to right, #ffffff 0%, #c7a75c 14%, #e7d57a 28%, #a5ba6f 42%, #3e8a59 56%, #346945 70%, #183e29 84%, #050603 100%)",
      ticks: ["0Mg/ha", "179.5Mg/ha", "359Mg/ha"]
    }
  },
  {
    id: "sar2ndvi",
    title: "SAR 2 NDVI",
    hudTitle: "Synthetic NDVI Map",
    badges: ["Monitoring", "Deep Learning", "Translation"],
    coords: [-3.05472112, 105.04198247],
    zoom: 10,
    maxZoom: 11,
    hudCoords: "Palembang City, IDN | -3.05° S, 105.04° E",
    description: "NDVI Map generated from Sentinel-1 SAR GRD dual-pol (VV, VH) imagery, translated using Attention U-Net.",
    imageOverlay: {
      url: "./data/images/SAR2NDVI_Map.webp", 
      // [ [South, West], [North, East] ] format for Leaflet bounds
      bounds: [
        [-3.8392198612700112, 104.3092266884644204], // Southwest corner
        [-2.2702223860268549, 105.7747382429770084]  // Northeast corner
      ],
      opacity: 0.85
    },
    // Define the dynamic legend schema
    legend: {
      title: "NDVI (Unitless)",
      min: "-1",
      max: "1",
      gradient: "linear-gradient(to right, #FE3C19 0%, #F2FE2A 50%, #147218 100%)",
      ticks: ["-1", "0", "1"]
    }
  },
  {
    id: "starfm4ndvi",
    title: "STARFM 4 NDVI",
    hudTitle: "NDVI Map | MODIS vs. Landsat",
    badges: ["Monitoring", "Statistic", "Gap Filling"],
    coords: [49.20793107, 26.10001001],
    zoom: 12.8,
    maxZoom: 13.8,
    hudCoords: "Postolivka, UKR | 49.21° N, 26.10° E",
    description: "Gap-filled satellite imagery from MODIS and Landsat data, processed with the STARFM algorithm ported to Google Earth Engine JS.",
    // Base Layer: LANDSAT Map (Raster)
    imageOverlay: {
      url: "./data/images/STARFM4NDVI_LANDSAT_Map.webp",
      bounds: [
        [49.1527853366355814, 26.0163318007782536], // Southwest corner
        [49.2630767973474377, 26.1836882168004124]  // Northeast corner
      ],
      opacity: 0.85
    },
    // Comparison Swipe Layer: MODIS Map (Raster)
    comparisonImageOverlay: {
      url: "./data/images/STARFM4NDVI_MODIS_Map.webp",
      bounds: [
        [49.15278533663558, 26.01633180077825], 
        [49.26307679734744, 26.18368821680041]
      ],
      opacity: 1.00
    },
    // Define the dynamic legend schema
    legend: {
      title: "Scaled NDVI (Unitless)",
      min: "0",
      max: "1",
      gradient: "linear-gradient(to right, #FFFFE5 0%, #D9F0A3 25%, #78C679 50%, #238443 75%, #004529 100%)",
      ticks: ["0", "0.5", "1"]
    }
  },
  {
    id: "thermalx",
    title: "THERMAL X",
    hudTitle: "Thermal Bright Map | Low vs. High",
    badges: ["Urban", "Deep Learning", "Super-Resolution"],
    coords: [-7.63283960, 111.53184570],
    zoom: 13.6,
    maxZoom: 14.8,
    hudCoords: "Madiun City, IDN | -7.63° S, 111.53° E",
    description: "Thermal Super-Resolved Map generated from Landsat TIR data, trained and fine-tuned using Conditional GAN (CGAN).",
    // Base Layer: High Resolution Map (Raster)
    imageOverlay: {
      url: "./data/images/THERMALX_HIGH_Map.webp",
      bounds: [
        [-7.6894656552271510, 111.4890706249904753], // Southwest corner
        [-7.5762135475621548, 111.5746207782625987]  // Northeast corner
      ],
      opacity: 0.85
    },
    // Comparison Swipe Layer: Low Resolution Map (Raster)
    comparisonImageOverlay: {
      url: "./data/images/THERMALX_LOW_Map.webp",
      bounds: [
        [-7.6894656552271510, 111.4890706249904753],
        [-7.5762135475621548, 111.5746207782625987]
      ],
      opacity: 1.00
    },
    // Define the dynamic legend schema
    legend: {
      title: "Thermal Brightness (°C)",
      min: "22.4",
      max: "30.0",
      gradient: "linear-gradient(to right, #38A1D0 0%, #F1FB7C 50%, #EF2820 100%)",
      ticks: ["22.4", "26.2", "30.0"]
    }
  },
  {
    id: "shape4parcel",
    title: "SHAPE 4 PARCEL",
    hudTitle: "Parcel Shape Map",
    badges: ["Planning", "Deep Learning", "Classification"],
    coords: [-6.17382101, 106.86860001],
    zoom: 15.95,
    maxZoom: 17,
    hudCoords: "Central Jakarta City, IDN | -6.17° N, 106.87° E",
    description: "Parcel Shape Classifier derived from parcel vector data, trained with CNN ResNet-18 to categorize land parcels into different shapes.",
    geoJsonPath: "./data/vector/Parcel_Shape_Object.geojson",
    geoJsonStyle: {
      property: "Shape",
      categories: {
        "Square"    : { color: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.18, weight: 1.5 }, // Sky Blue
        "Rectangle" : { color: "#60a5fa", fillColor: "#60a5fa", fillOpacity: 0.18, weight: 1.5 }, // Azure Blue
        "L"         : { color: "#34d399", fillColor: "#34d399", fillOpacity: 0.18, weight: 1.5 }, // Emerald Green
        "Trapezoid" : { color: "#c084fc", fillColor: "#c084fc", fillOpacity: 0.18, weight: 1.5 }, // Amethyst Purple
        "Triangle"  : { color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.18, weight: 1.5 }, // Sunset Amber
        "Irregular" : { color: "#f43f5e", fillColor: "#f43f5e", fillOpacity: 0.22, weight: 1.8 }, // Rose Red (Alerts to anomalies)
      },
       default: { color: "#64748b", fillColor: "#64748b", fillOpacity: 0.12, weight: 1.2 }
    }
  },
];


/* --- PUBLICATIONS --- */
export const publications = [
  {
    num: "01 / ARTICLE",
    title: "Exploring optimal integration schemes for Sentinel-1 SAR and Sentinel-2 multispectral data in land cover mapping across different atmospheric conditions",
    publisher: "[Elsevier] Remote Sensing Applications: Society and Environment 2024",
    description: "Integrating Sentinel-1 SAR with Sentinel-2 multispectral data to overcome cloud and haze, boosting land cover mapping accuracy and efficiency in tropical regions.",
    linkUrl: "https://doi.org/10.1016/j.rsase.2024.101185",
    linkText: "Read Article"
  },
  {
    num: "02 / ARTICLE",
    title: "Synergistic Integration of LANDSAT-8 and MODIS Data for Enhanced Paddy Phenology Assessment and Crop Frequency Mapping: A Fusion of Phenological Insights and Machine Learning Algorithms",
    publisher: "[Geographia Technica] Technical Geography 2024",
    description: "Fusing Landsat and MODIS with STARFM and machine learning to map paddy phenology and cropping frequency, delivering dense time-series imagery for food security planning.",
    linkUrl: "http://dx.doi.org/10.21163/GT_2024.191.09",
    linkText: "Read Article"
  },
  {
    num: "03 / ORAL PRESENTATION",
    title: "Deriving Urban Footprint and Simulating Future Growth with GIS-Based Analysis in Bali Island",
    publisher: "[IRSA] The 20th Conference 2025",
    description: "Modeling Bali's urban footprint with Landsat-based LCM and Markov simulations, projecting built-up growth to 2045 and aligning scenarios with spatial planning policies.",
    linkUrl: "https://semarang2025.irsa.or.id/wp-content/uploads/2025/07/Conference-Agenda_2July2025.pdf",
    linkText: "Conference Agenda"
  }
];


/* --- BORING SKILL --- */
export const capabilities = [
  {
    branchTitle: "Software",
    nodes: [
      {
        title: "Microsoft SQL Server",
        description: "Maintaining and optimizing DB.",
        leaves: [
          { title: "Query Optimization" },
          { title: "C# Scalar function development" }
        ]
      },
      {
        title: "n8n (nodemation)",
        description: "ETL Pipelines maintenance and development.",
        leaves: [
          { title: "Updating security patches" },
          { title: "n8n compatible program development & integration" },
        ]
      },
      {
        title: "QGIS, ARCGIS Pro, ENVI, Google Earth Engine, TerrSet, SNAP Sentinel, Metashape",
        description: "Geospatial analysis.",
        leaves: [
          { title: "Custom plugin development" },
          { title: "Automated geoprocessing workflows" }
        ]
      },
      {
        title: "BitBucket, Jira",
        description: "Task management and version control."
      },
      {
        title: "Microsoft Office Suite (Excel, Word, PowerPoint)",
        description: "Documentation, reporting, and presentation."
      }
    ]
  },
  {
    branchTitle: "Programming Languages",
    nodes: [
      {
        title: "Python",
        description: "Main programming language for the development of data-processing-related algorithms.",
        leaves: [
          { title: "Web Scrapper" },
          { title: "Language Translator" },
          { title: "Wrapper for other programs" },
          { title: "Big Data Downloading / Extraction" },
          { title: "Geospatial & Non-Geospatial Data Processing and Automation" },
          { title: "Model Development: Machine Learning & Statistical Modeling" }
        ]
      },
      {
        title: "Structured Query Language (SQL)",
        description: "Main database query language."
      },
      {
        title: "R",
        description: "Go-to programming language for experimental data analysis emphasizing on stability and clear readability.",
      },
      {
        title: "JavaScript",
        description: "Web-based geospatial data processing and visualization in Google Earth Engine (GEE).",
      },
      {
        title: "C#",
        description: "Microsoft SQL Server scalar function development."
      }
    ]
  },
  {
    branchTitle: "Tools for Production",
    nodes: [
      {
        title: "File2DBMS",
        description: "Fast data insertion into MSSQL Server utilizing Bulk Copy Program (BCP)."
      },
      {
        title: "DBMS2File",
        description: "Efficient data extraction from DBMS (not just MSSQL Server) to local files in various different formats utilizing parallel executions."
      },
      {
        title: "Scrapper4Toll",
        description: "Scraping tool for extracting toll prices."
      },
      {
        title: "Scrapper4POI",
        description: "Scraping tool for extracting defined Point of Interest (POI) data."
      },
      {
        title: "Phoneme4Transcription",
        description: "Tool for mass converting phonetic transcriptions to text."
      },
      {
        title: "Translator4LocalData",
        description: "Tool for mass converting data attribute values from local script to english script."
      },
      {
        title: "FileChecker",
        description: "Tool for validating and checking file integrity from A-Z.",
        leaves: [
          { title: "Filename Convention Compliance" },
          { title: "ID Uniqueness Validation" },
          { title: "ERD Validation" },
          { title: "Data Type and Value Validation" },
          { title: "Automated Reporting" }
        ]
      },
      {
        title: "DataUnifier",
        description: "Tool for standardizing and unifying data from multiple sources."
      },
      {
        title: "Refitted Legacy System",
        description: "Legacy system refitting & vulnerability patching for company internal systems."
      }
    ]
  }
];