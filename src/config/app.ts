/**
 * Configuração da marca. Para mudar o nome, defina VITE_APP_NAME no ficheiro .env
 * (ver .env.example) — não é preciso alterar o código.
 */
export const APP_CONFIG = {
  name: (import.meta.env?.VITE_APP_NAME as string | undefined)?.trim() || 'DutchPath',
  tagline: 'Neerlandês para quem fala português',
  courseLanguage: 'nl-NL',
  interfaceLanguage: 'pt-PT',
} as const;
