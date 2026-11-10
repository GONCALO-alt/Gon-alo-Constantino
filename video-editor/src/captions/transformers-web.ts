// Na versão web (cloud) o Whisper não está disponível: os modelos teriam de ser descarregados de outro site.
export const env: any = {};
export async function pipeline(): Promise<never> {
  throw new Error('As legendas automáticas só estão disponíveis na app desktop.');
}
