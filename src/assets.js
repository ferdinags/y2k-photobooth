// Asset Library for PIXEL POP Y2K Photobooth

// High-aesthetic SVG-based procedural photos for demo / fallback
function createDemoPhoto(title, sub, gradient, emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        ${gradient}
      </linearGradient>
      <radialGradient id="flash" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
      </radialGradient>
      <pattern id="grain" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="1.5" fill="rgba(255,255,255,0.08)"/>
        <circle cx="25" cy="18" r="1" fill="rgba(0,0,0,0.06)"/>
        <circle cx="15" cy="32" r="1.5" fill="rgba(255,255,255,0.08)"/>
        <circle cx="35" cy="28" r="1" fill="rgba(0,0,0,0.06)"/>
      </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="600" height="450" fill="url(#bg)"/>
    <rect width="600" height="450" fill="url(#grain)"/>
    <rect width="600" height="450" fill="url(#flash)"/>

    <!-- Y2K Decorative Sparkles in background -->
    <text x="50" y="90" font-size="34" fill="#ffffff" opacity="0.8">✦</text>
    <text x="520" y="80" font-size="28" fill="#ffd166" opacity="0.9">★</text>
    <text x="80" y="380" font-size="30" fill="#ffb7d5" opacity="0.85">✧</text>
    <text x="500" y="390" font-size="32" fill="#70d6ff" opacity="0.85">✦</text>
    
    <!-- Central Character Silhouette & Pose -->
    <g transform="translate(300, 230)">
      <!-- Vignette aura -->
      <circle cx="0" cy="-10" r="130" fill="rgba(255,255,255,0.2)"/>
      <circle cx="0" cy="-40" r="65" fill="#fbcfe8" stroke="#2B213A" stroke-width="4"/>
      <!-- Sunglasses / Eyes -->
      <rect x="-42" y="-55" width="36" height="20" rx="8" fill="#ff69b4" stroke="#2B213A" stroke-width="3"/>
      <rect x="6" y="-55" width="36" height="20" rx="8" fill="#ff69b4" stroke="#2B213A" stroke-width="3"/>
      <line x1="-6" y1="-45" x2="6" y2="-45" stroke="#2B213A" stroke-width="3"/>
      <!-- Smile -->
      <path d="M -20 -15 Q 0 5 20 -15" fill="none" stroke="#2B213A" stroke-width="4" stroke-linecap="round"/>
      <!-- Cheeks -->
      <circle cx="-35" cy="-22" r="8" fill="#ff85a1" opacity="0.7"/>
      <circle cx="35" cy="-22" r="8" fill="#ff85a1" opacity="0.7"/>
      <!-- Body & Shirt -->
      <path d="M -80 120 C -70 40 -40 25 0 25 C 40 25 70 40 80 120 Z" fill="#70d6ff" stroke="#2B213A" stroke-width="4"/>
      <!-- Pose Accessories -->
      <text x="0" y="80" font-family="'Space Grotesk', sans-serif" font-weight="bold" font-size="16" fill="#2B213A" text-anchor="middle">PIXEL POP</text>
    </g>

    <!-- Main Pose Badge -->
    <g transform="translate(300, 360)">
      <rect x="-140" y="-22" width="280" height="44" rx="22" fill="#ffffff" stroke="#2B213A" stroke-width="3"/>
      <text x="0" y="7" font-family="'Epilogue', sans-serif" font-weight="800" font-size="18" fill="#2B213A" text-anchor="middle" letter-spacing="1">
        ${emoji} ${title}
      </text>
    </g>

    <!-- Retro Date Stamp -->
    <text x="40" y="420" font-family="'Space Grotesk', monospace" font-weight="700" font-size="14" fill="#ffd166" letter-spacing="2">
      OCT 24 '26 16:20
    </text>
    <text x="560" y="420" font-family="'Space Grotesk', monospace" font-weight="700" font-size="14" fill="#ffffff" text-anchor="end" letter-spacing="1">
      ${sub}
    </text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export const DEFAULT_PHOTOS = [
  createDemoPhoto('Wink & Peace', '#01 FLASH', '<stop offset="0%" stop-color="#ff758c"/><stop offset="100%" stop-color="#ff7eb3"/>', '✌️'),
  createDemoPhoto('Cute Besties', '#02 CUTE', '<stop offset="0%" stop-color="#4facfe"/><stop offset="100%" stop-color="#00f2fe"/>', '✨'),
  createDemoPhoto('Heart Hands', '#03 SWEET', '<stop offset="0%" stop-color="#f093fb"/><stop offset="100%" stop-color="#f5576c"/>', '💖'),
  createDemoPhoto('Forever Laugh', '#04 FOREVER', '<stop offset="0%" stop-color="#a18cd1"/><stop offset="100%" stop-color="#fbc2eb"/>', '⭐')
];

// 40+ Curated Y2K Scrapbook Stickers
export const STICKER_COLLECTION = [
  // Stars & Sparkles
  { id: 'star-yellow', category: 'stars', type: 'emoji', content: '⭐', label: 'Gold Star' },
  { id: 'star-cyber', category: 'stars', type: 'emoji', content: '★', label: 'Cyber Star', bg: '#ffd166', color: '#2B213A' },
  { id: 'sparkle-pink', category: 'stars', type: 'emoji', content: '✦', label: 'Pink Sparkle', bg: '#ffb7d5', color: '#2B213A' },
  { id: 'glitter-gem', category: 'stars', type: 'emoji', content: '✨', label: 'Glitter Sparkle' },
  { id: 'dizzy-star', category: 'stars', type: 'emoji', content: '💫', label: 'Dizzy Stars' },
  { id: 'star-burst', category: 'stars', type: 'emoji', content: '🌟', label: 'Glow Star' },
  { id: 'sparkle-white', category: 'stars', type: 'emoji', content: '✧', label: 'Silver Star', bg: '#ffffff', color: '#2B213A' },

  // Hearts & Romance
  { id: 'heart-sparkle', category: 'hearts', type: 'emoji', content: '💖', label: 'Sparkle Heart' },
  { id: 'heart-fire', category: 'hearts', type: 'emoji', content: '❤️‍🔥', label: 'Flame Heart' },
  { id: 'heart-ribbon', category: 'hearts', type: 'emoji', content: '💝', label: 'Heart Ribbon' },
  { id: 'heart-double', category: 'hearts', type: 'emoji', content: '💕', label: 'Double Heart' },
  { id: 'cherry-duo', category: 'hearts', type: 'emoji', content: '🍒', label: 'Cherry Duo' },
  { id: 'strawberry', category: 'hearts', type: 'emoji', content: '🍓', label: 'Sweet Berry' },
  { id: 'love-letter', category: 'hearts', type: 'emoji', content: '💌', label: 'Love Letter' },

  // Y2K Tech & Nostalgia
  { id: 'cd-disc', category: 'tech', type: 'emoji', content: '💿', label: 'Mini CD-ROM' },
  { id: 'floppy-disk', category: 'tech', type: 'emoji', content: '💾', label: 'Floppy Disk' },
  { id: 'tamagotchi', category: 'tech', type: 'emoji', content: '👾', label: 'Pixel Alien' },
  { id: 'gameboy', category: 'tech', type: 'emoji', content: '🎮', label: 'Pocket Game' },
  { id: 'flip-phone', category: 'tech', type: 'emoji', content: '📱', label: 'Cyber Phone' },
  { id: 'headphones', category: 'tech', type: 'emoji', content: '🎧', label: 'Retro Beats' },
  { id: 'digicam', category: 'tech', type: 'emoji', content: '📸', label: 'Digi-Cam' },

  // Badges & Word Stamps
  { id: 'badge-cute', category: 'words', type: 'badge', content: '★ CUTE ★', bg: '#ff69b4', color: '#ffffff', label: 'Cute Badge', isBadge: true },
  { id: 'badge-bff', category: 'words', type: 'badge', content: 'BFF 4EVER', bg: '#70d6ff', color: '#2B213A', label: 'BFF Badge', isBadge: true },
  { id: 'badge-angel', category: 'words', type: 'badge', content: 'ʚ ANGEL ɞ', bg: '#bdb2ff', color: '#2B213A', label: 'Angel Badge', isBadge: true },
  { id: 'badge-freeware', category: 'words', type: 'badge', content: '★ FREEWARE', bg: '#ffd166', color: '#2B213A', label: 'Freeware', isBadge: true },
  { id: 'badge-hot', category: 'words', type: 'badge', content: '🔥 HOT', bg: '#ff85a1', color: '#ffffff', label: 'Hot Badge', isBadge: true },
  { id: 'badge-vip', category: 'words', type: 'badge', content: 'VIP 2000', bg: '#ffffff', color: '#ac2471', label: 'VIP Badge', isBadge: true },
  { id: 'badge-cyber', category: 'words', type: 'badge', content: 'CYBER ★ 2000', bg: '#a0e7e5', color: '#2B213A', label: 'Cyber 2000', isBadge: true },
  { id: 'badge-xoxo', category: 'words', type: 'badge', content: '♥ XOXO ♥', bg: '#ffb7d5', color: '#2B213A', label: 'XOXO', isBadge: true },

  // Cute Icons & Doodles
  { id: 'butterfly', category: 'doodles', type: 'emoji', content: '🦋', label: 'Holo Butterfly' },
  { id: 'daisy', category: 'doodles', type: 'emoji', content: '🌼', label: 'Daisy Flower' },
  { id: 'flame', category: 'doodles', type: 'emoji', content: '🔥', label: 'Y2K Flame' },
  { id: 'rainbow', category: 'doodles', type: 'emoji', content: '🌈', label: 'Rainbow' },
  { id: 'ribbon', category: 'doodles', type: 'emoji', content: '🎀', label: 'Pink Ribbon' },
  { id: 'lollipop', category: 'doodles', type: 'emoji', content: '🍭', label: 'Sweet Pop' },
  { id: 'lipstick', category: 'doodles', type: 'emoji', content: '💄', label: 'Lip Gloss' },
  { id: 'shades', category: 'doodles', type: 'emoji', content: '🕶️', label: 'Tinted Shades' },
  { id: 'crown', category: 'doodles', type: 'emoji', content: '👑', label: 'Princess Crown' }
];

// Filter Presets with CSS filter strings and overlay properties
export const FILTER_PRESETS = [
  {
    id: 'original',
    name: 'Original',
    desc: 'Pure crisp camera feed',
    cssFilter: 'none',
    canvasFilter: 'none',
    overlay: null,
    icon: 'photo_camera'
  },
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    desc: 'Warm 2000s pastel glow',
    cssFilter: 'contrast(1.08) brightness(1.06) saturate(1.15) sepia(0.08) hue-rotate(-8deg)',
    canvasFilter: 'contrast(1.08) brightness(1.06) saturate(1.15) sepia(0.08) hue-rotate(-8deg)',
    overlay: 'rgba(255, 105, 180, 0.12)',
    icon: 'favorite'
  },
  {
    id: 'cool-blue',
    name: 'Cool Blue',
    desc: 'Cyber sky nostalgic tint',
    cssFilter: 'contrast(1.14) brightness(1.05) saturate(1.1) hue-rotate(18deg)',
    canvasFilter: 'contrast(1.14) brightness(1.05) saturate(1.1) hue-rotate(18deg)',
    overlay: 'rgba(112, 214, 255, 0.12)',
    icon: 'ac_unit'
  },
  {
    id: 'vintage-flash',
    name: 'Vintage Flash',
    desc: 'High contrast direct flash',
    cssFilter: 'contrast(1.28) brightness(1.14) saturate(0.95) sepia(0.1)',
    canvasFilter: 'contrast(1.28) brightness(1.14) saturate(0.95) sepia(0.1)',
    overlay: 'rgba(255, 240, 220, 0.08)',
    icon: 'flash_on'
  },
  {
    id: 'cyber-sepia',
    name: 'Cyber Sepia',
    desc: 'Warm golden memories',
    cssFilter: 'sepia(0.48) contrast(1.12) brightness(1.02) saturate(1.2)',
    canvasFilter: 'sepia(0.48) contrast(1.12) brightness(1.02) saturate(1.2)',
    overlay: 'rgba(255, 209, 102, 0.1)',
    icon: 'history'
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    desc: 'Vibrant saturated pop',
    cssFilter: 'contrast(1.22) saturate(1.55) brightness(1.06) hue-rotate(-12deg)',
    canvasFilter: 'contrast(1.22) saturate(1.55) brightness(1.06) hue-rotate(-12deg)',
    overlay: 'rgba(189, 178, 255, 0.14)',
    icon: 'auto_awesome'
  }
];

// Layout Presets
export const LAYOUT_PRESETS = [
  {
    id: 'vertical-4',
    name: '4-Frame Strip',
    frames: 4,
    cols: 1,
    tag: 'Classic 2x6',
    desc: 'Standard vertical photostrip'
  },
  {
    id: 'collage-2x2',
    name: '2×2 Grid',
    frames: 4,
    cols: 2,
    tag: 'Square Club',
    desc: 'Square scrapbook collage'
  },
  {
    id: 'vertical-3',
    name: '3-Frame Mini',
    frames: 3,
    cols: 1,
    tag: 'Pocket Mini',
    desc: 'Cute 3-pose pocket strip'
  }
];

// Border Card Styles
export const BORDER_STYLES = [
  { id: 'baby-pink', name: 'Baby Pink', color: '#ffebf3', border: '#2B213A' },
  { id: 'lilac', name: 'Lilac Dream', color: '#f2edff', border: '#2B213A' },
  { id: 'glitter', name: 'Glitter Holo', color: '#ffffff', isHolo: true, border: '#2B213A' },
  { id: 'checker', name: 'Pink Checker', color: '#ffffff', isChecker: true, border: '#2B213A' },
  { id: 'polaroid-white', name: 'Classic White', color: '#ffffff', border: '#2B213A' }
];

// Backdrop Styles
export const BACKDROP_STYLES = [
  { id: 'dot-matrix', name: 'Dot Matrix', cssClass: 'bg-dot-matrix' },
  { id: 'scrapbook-desk', name: 'Checker Desk', cssClass: 'scrapbook-desk' },
  { id: 'retro-grid', name: 'Retro Grid', cssClass: 'retro-grid-bg' },
  { id: 'lilac-dream', name: 'Lilac Pastel', cssClass: 'bg-lilac-dream', color: '#f2ebff' },
  { id: 'candy-pink', name: 'Candy Pink', cssClass: 'bg-candy-pink', color: '#fdf0f6' },
  { id: 'dark-cyber', name: 'Dark Cyber', cssClass: 'bg-dark-cyber', color: '#1d1733' }
];

