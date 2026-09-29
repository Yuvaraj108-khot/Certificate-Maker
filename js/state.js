/* =========================================================================
   STUDIO STATE & EXPANDED FONT CONFIGURATION
   ========================================================================= */

export const studioState = {
  // User Template
  templateImage: null,
  templateWidth: 0,
  templateHeight: 0,
  templateLoaded: false,
  templateFileName: '',

  // Recipients
  names: [],
  currentIndex: 0,

  // Name Typography & Coordinates (Fraction 0.0 - 1.0)
  posXFrac: 0.50,
  posYFrac: 0.52,
  fontFamily: 'Playfair Display',
  fontWeight: '700',
  fontSize: 64,
  color: '#0f172a',
  textAlign: 'center',
  letterCase: 'title',
  shrinkToFit: true,
  maxWidthFrac: 0.75,

  // Drag interaction
  isDragging: false,

  // Export
  isGenerating: false,
  cancelRequested: false,
  exportFormat: 'pdf',

  // Theme
  isDark: true
};

// Comprehensive Library of Google Fonts categorized for Certificate Design
export const FONT_CATALOG = [
  {
    category: "📜 Elegant Calligraphy & Scripts",
    fonts: [
      { name: "Great Vibes", weights: ["400"] },
      { name: "Pinyon Script", weights: ["400"] },
      { name: "Alex Brush", weights: ["400"] },
      { name: "Allura", weights: ["400"] },
      { name: "Parisienne", weights: ["400"] },
      { name: "Dancing Script", weights: ["400", "600", "700"] },
      { name: "Tangerine", weights: ["400", "700"] },
      { name: "Sacramento", weights: ["400"] },
      { name: "Satisfy", weights: ["400"] },
      { name: "Italianno", weights: ["400"] },
      { name: "Marck Script", weights: ["400"] },
      { name: "Rochester", weights: ["400"] },
      { name: "Rouge Script", weights: ["400"] },
      { name: "Montez", weights: ["400"] }
    ]
  },
  {
    category: "🏛️ Luxury & Editorial Serifs",
    fonts: [
      { name: "Playfair Display", weights: ["400", "600", "700", "900"] },
      { name: "Cinzel", weights: ["400", "600", "700", "800", "900"] },
      { name: "Cinzel Decorative", weights: ["700", "900"] },
      { name: "Cormorant Garamond", weights: ["400", "600", "700"] },
      { name: "Bodoni Moda", weights: ["400", "600", "700", "800", "900"] },
      { name: "Lora", weights: ["400", "500", "600", "700"] },
      { name: "EB Garamond", weights: ["400", "600", "700", "800"] },
      { name: "Prata", weights: ["400"] },
      { name: "DM Serif Display", weights: ["400"] },
      { name: "Libre Baskerville", weights: ["400", "700"] },
      { name: "Marcellus", weights: ["400"] },
      { name: "Spectral", weights: ["400", "600", "700", "800"] },
      { name: "Merriweather", weights: ["400", "700", "900"] }
    ]
  },
  {
    category: "✨ Modern Clean Sans-Serif",
    fonts: [
      { name: "Montserrat", weights: ["400", "500", "600", "700", "800", "900"] },
      { name: "Poppins", weights: ["400", "500", "600", "700", "800"] },
      { name: "Plus Jakarta Sans", weights: ["400", "500", "600", "700", "800"] },
      { name: "Figtree", weights: ["400", "500", "600", "700", "800"] },
      { name: "Outfit", weights: ["400", "500", "600", "700", "800"] },
      { name: "Inter", weights: ["400", "500", "600", "700", "800", "900"] },
      { name: "Raleway", weights: ["400", "500", "600", "700", "800"] },
      { name: "Oswald", weights: ["400", "500", "600", "700"] },
      { name: "Lato", weights: ["400", "700", "900"] },
      { name: "Nunito", weights: ["400", "600", "700", "800"] },
      { name: "Cabin", weights: ["400", "500", "600", "700"] }
    ]
  },
  {
    category: "👑 Gothic & Vintage Diplomas",
    fonts: [
      { name: "UnifrakturMaguntia", weights: ["400"] },
      { name: "MedievalSharp", weights: ["400"] },
      { name: "Playfair Display SC", weights: ["400", "700", "900"] },
      { name: "Syne", weights: ["400", "600", "700", "800"] }
    ]
  }
];

// Helper to look up font weights
export function getAvailableWeightsForFont(fontFamily) {
  for (const cat of FONT_CATALOG) {
    const found = cat.fonts.find(f => f.name.toLowerCase() === fontFamily.toLowerCase());
    if (found) return found.weights;
  }
  return ["400", "600", "700"];
}

// Compute an actually supported weight for the font to prevent canvas fallback
export function getEffectiveFontWeight(fontFamily, desiredWeight) {
  const available = getAvailableWeightsForFont(fontFamily);
  const target = String(desiredWeight || '400');
  if (available.includes(target)) return target;

  // If desired is bold (600+) and font has 700 or boldest, return it
  if (parseInt(target, 10) >= 600) {
    if (available.includes('700')) return '700';
    if (available.includes('600')) return '600';
    if (available.includes('800')) return '800';
  }
  if (available.includes('400')) return '400';
  return available[0] || '400';
}

