// Tipos de letra incluídos na app (Google Fonts, licença livre, funcionam offline).
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/raleway/400.css';
import '@fontsource/raleway/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/quicksand/400.css';
import '@fontsource/quicksand/700.css';
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/700.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/josefin-sans/400.css';
import '@fontsource/josefin-sans/700.css';
import '@fontsource/syne/400.css';
import '@fontsource/syne/700.css';
import '@fontsource/comfortaa/400.css';
import '@fontsource/comfortaa/700.css';
import '@fontsource/baloo-2/400.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/sniglet/400.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/anton/400.css';
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/700.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/bangers/400.css';
import '@fontsource/luckiest-guy/400.css';
import '@fontsource/titan-one/400.css';
import '@fontsource/lilita-one/400.css';
import '@fontsource/bowlby-one-sc/400.css';
import '@fontsource/alfa-slab-one/400.css';
import '@fontsource/bungee/400.css';
import '@fontsource/staatliches/400.css';
import '@fontsource/russo-one/400.css';
import '@fontsource/black-ops-one/400.css';
import '@fontsource/teko/400.css';
import '@fontsource/teko/700.css';
import '@fontsource/barlow-condensed/400.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/righteous/400.css';
import '@fontsource/chewy/400.css';
import '@fontsource/rubik-mono-one/400.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/abril-fatface/400.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/700.css';
import '@fontsource/lora/400.css';
import '@fontsource/lora/700.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/lobster/400.css';
import '@fontsource/dancing-script/400.css';
import '@fontsource/dancing-script/700.css';
import '@fontsource/great-vibes/400.css';
import '@fontsource/satisfy/400.css';
import '@fontsource/kaushan-script/400.css';
import '@fontsource/sacramento/400.css';
import '@fontsource/courgette/400.css';
import '@fontsource/yellowtail/400.css';
import '@fontsource/playball/400.css';
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/700.css';
import '@fontsource/permanent-marker/400.css';
import '@fontsource/shadows-into-light/400.css';
import '@fontsource/rock-salt/400.css';
import '@fontsource/amatic-sc/400.css';
import '@fontsource/amatic-sc/700.css';
import '@fontsource/monoton/400.css';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/vt323/400.css';
import '@fontsource/special-elite/400.css';
import '@fontsource/creepster/400.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/700.css';

export const FONT_CATEGORIES: { name: string; fonts: string[] }[] = [
  { name: 'Moderno', fonts: ['Inter', 'Montserrat', 'Poppins', 'Raleway', 'Nunito', 'Quicksand', 'Rubik', 'Space Grotesk', 'Josefin Sans', 'Syne', 'Comfortaa', 'Baloo 2', 'Fredoka', 'Sniglet'] },
  { name: 'Impacto', fonts: ['Bebas Neue', 'Anton', 'Oswald', 'Archivo Black', 'Bangers', 'Luckiest Guy', 'Titan One', 'Lilita One', 'Bowlby One SC', 'Alfa Slab One', 'Bungee', 'Staatliches', 'Russo One', 'Black Ops One', 'Teko', 'Barlow Condensed', 'Righteous', 'Chewy', 'Rubik Mono One'] },
  { name: 'Elegante', fonts: ['Playfair Display', 'Abril Fatface', 'DM Serif Display', 'Cinzel', 'Merriweather', 'Lora'] },
  { name: 'Manuscrito', fonts: ['Pacifico', 'Lobster', 'Dancing Script', 'Great Vibes', 'Satisfy', 'Kaushan Script', 'Sacramento', 'Courgette', 'Yellowtail', 'Playball', 'Caveat', 'Permanent Marker', 'Shadows Into Light', 'Rock Salt', 'Amatic SC'] },
  { name: 'Retro', fonts: ['Monoton', 'Press Start 2P', 'Orbitron', 'VT323', 'Special Elite', 'Creepster', 'Roboto Mono'] },
  { name: 'Sistema', fonts: ['Arial', 'Georgia', 'Impact', 'Times New Roman', 'Courier New', 'Verdana'] },
];

export const FONTS = FONT_CATEGORIES.flatMap((c) => c.fonts);
