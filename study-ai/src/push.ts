// Lembretes no telemóvel: pedir autorização e subscrever as notificações (Web Push).
import { api } from './api';
import { isIOS, isStandalone } from './pwa';

export type PushSupport = 'ok' | 'ios-install' | 'unsupported' | 'denied';

export function pushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported';
  const has = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  // No iPhone/iPad, as notificações da web só funcionam na app adicionada ao ecrã principal (iOS 16.4+).
  if (!has) return isIOS() && !isStandalone() ? 'ios-install' : 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return 'ok';
}

const keyBytes = (b64: string) => {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  return navigator.serviceWorker.register('/sw.js');
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (pushSupport() !== 'ok') return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/** Tem de ser chamado num toque (o navegador pede autorização). */
export async function enablePush(publicKey: string, settings: object): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Sem autorização para notificações. Podes autorizá-las nas definições do navegador.');
  const reg = await registration();
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
  await api('/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON(), settings } });
}

export async function disablePush(): Promise<void> {
  const sub = await currentSubscription();
  await api('/push/subscribe', { method: 'DELETE', body: { endpoint: sub?.endpoint ?? null } });
  await sub?.unsubscribe().catch(() => {});
}
