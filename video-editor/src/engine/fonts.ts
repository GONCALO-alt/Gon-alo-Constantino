// Tipos de letra incluídos na app (Google Fonts, licença livre, funcionam offline).
import './fontFiles';

export const FONT_CATEGORIES: { name: string; fonts: string[] }[] = [
  { name: 'Moderno', fonts: ['Inter', 'Montserrat', 'Poppins', 'Raleway', 'Nunito', 'Quicksand', 'Rubik', 'Space Grotesk', 'Josefin Sans', 'Syne', 'Comfortaa', 'Baloo 2', 'Fredoka', 'Sniglet'] },
  { name: 'Impacto', fonts: ['Bebas Neue', 'Anton', 'Oswald', 'Archivo Black', 'Bangers', 'Luckiest Guy', 'Titan One', 'Lilita One', 'Bowlby One SC', 'Alfa Slab One', 'Bungee', 'Staatliches', 'Russo One', 'Black Ops One', 'Teko', 'Barlow Condensed', 'Righteous', 'Chewy', 'Rubik Mono One'] },
  { name: 'Elegante', fonts: ['Playfair Display', 'Abril Fatface', 'DM Serif Display', 'Cinzel', 'Merriweather', 'Lora'] },
  { name: 'Manuscrito', fonts: ['Pacifico', 'Lobster', 'Dancing Script', 'Great Vibes', 'Satisfy', 'Kaushan Script', 'Sacramento', 'Courgette', 'Yellowtail', 'Playball', 'Caveat', 'Permanent Marker', 'Shadows Into Light', 'Rock Salt', 'Amatic SC'] },
  { name: 'Retro', fonts: ['Monoton', 'Press Start 2P', 'Orbitron', 'VT323', 'Special Elite', 'Creepster', 'Roboto Mono'] },
  { name: 'Sistema', fonts: ['Arial', 'Georgia', 'Impact', 'Times New Roman', 'Courier New', 'Verdana'] },
];

export const FONTS = FONT_CATEGORIES.flatMap((c) => c.fonts);
