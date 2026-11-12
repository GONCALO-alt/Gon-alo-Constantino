// Definições → «Lembretes no telemóvel».
import { useEffect, useState } from 'react';
import { Bell, BellRing, Send, Smartphone } from 'lucide-react';
import { api } from '../api';
import { currentSubscription, disablePush, enablePush, pushSupport } from '../push';
import { invalidate, useApp, useQuery } from '../state';
import { Button, Toggle } from './ui';

interface Settings {
  sessions: boolean;
  tests: boolean;
  minutesBefore: number;
  testTime: string;
}
interface Config {
  publicKey: string;
  subscribed: boolean;
  devices: number;
  settings: Settings;
}

export function RemindersCard() {
  const { toast } = useApp();
  const cfg = useQuery<Config>('/push/config');
  const [support, setSupport] = useState(pushSupport);
  const [here, setHere] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    currentSubscription().then((s) => setHere(!!s)).catch(() => setHere(false));
  }, []);
  useEffect(() => {
    if (cfg.data) setSettings(cfg.data.settings);
  }, [cfg.data]);

  async function turn(on: boolean) {
    if (!cfg.data || !settings) return;
    setBusy(true);
    try {
      if (on) {
        await enablePush(cfg.data.publicKey, settings);
        toast('Lembretes ligados neste dispositivo. 🔔');
      } else {
        await disablePush();
        toast('Lembretes desligados.');
      }
      setHere(on);
      invalidate('/push/config');
    } catch (err) {
      toast((err as Error).message, 'error');
      setSupport(pushSupport());
    } finally {
      setBusy(false);
    }
  }

  async function save(patch: Partial<Settings>) {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      await api('/push/settings', { method: 'PUT', body: next });
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function test() {
    setBusy(true);
    try {
      await api('/push/test', { method: 'POST' });
      toast('Enviada! Deve aparecer daqui a uns segundos.');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const on = !!here;
  return (
    <section className="card pad-lg" id="lembretes">
      <div className="card-head"><span className="card-title"><BellRing /> Lembretes no telemóvel</span></div>
      <p className="muted small" style={{ marginBottom: 12 }}>
        Recebe uma notificação à hora de cada sessão do plano e na véspera dos testes — mesmo com a app fechada.
      </p>
      {support === 'ios-install' ? (
        <div className="notice">
          <Smartphone />
          <div>
            <b>No iPhone, os lembretes só funcionam com a app no ecrã principal.</b> No Safari, toca em <b>Partilhar → Adicionar ao ecrã principal</b> e depois abre a
            STUDY AI a partir do ícone. Volta aqui para ligar os lembretes.
          </div>
        </div>
      ) : support === 'unsupported' ? (
        <div className="notice"><Bell /><div>Este navegador não recebe notificações. Experimenta o Chrome, ou no iPhone a app no ecrã principal.</div></div>
      ) : support === 'denied' ? (
        <div className="notice"><Bell /><div>As notificações estão bloqueadas para esta app. Autoriza-as nas definições do telemóvel (Notificações → STUDY AI) e volta aqui.</div></div>
      ) : (
        <div className="settings-list">
          <div className="setting">
            <div>
              <div className="s-title">Lembretes neste dispositivo</div>
              <div className="s-desc">{on ? 'Ligados.' : 'Desligados.'}{cfg.data && cfg.data.devices > (on ? 1 : 0) ? ` Também ligados noutro dispositivo.` : ''}</div>
            </div>
            {busy && here === null ? <span className="spinner" /> : <Toggle on={on} onChange={(v) => !busy && void turn(v)} label="Lembretes neste dispositivo" />}
          </div>
          {settings && (
            <>
              <div className="setting">
                <div>
                  <div className="s-title">Sessões do plano</div>
                  <div className="s-desc">Avisa-te antes de cada sessão de estudo (as que já marcaste como feitas não contam).</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <select className="input" style={{ width: 'auto' }} value={settings.minutesBefore} disabled={!settings.sessions} onChange={(e) => void save({ minutesBefore: Number(e.target.value) })} aria-label="Quando avisar">
                    <option value={0}>À hora</option>
                    <option value={5}>5 min antes</option>
                    <option value={10}>10 min antes</option>
                    <option value={15}>15 min antes</option>
                    <option value={30}>30 min antes</option>
                  </select>
                  <Toggle on={settings.sessions} onChange={(v) => void save({ sessions: v })} label="Lembretes das sessões" />
                </div>
              </div>
              <div className="setting">
                <div>
                  <div className="s-title">Véspera dos testes e trabalhos</div>
                  <div className="s-desc">Um aviso na véspera, para fazeres uma revisão.</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <select className="input" style={{ width: 'auto' }} value={settings.testTime} disabled={!settings.tests} onChange={(e) => void save({ testTime: e.target.value })} aria-label="Hora do aviso">
                    {['17:00', '18:00', '19:00', '20:00', '21:00'].map((t) => <option key={t} value={t}>às {t}</option>)}
                  </select>
                  <Toggle on={settings.tests} onChange={(v) => void save({ tests: v })} label="Lembretes dos testes" />
                </div>
              </div>
              {on && (
                <div className="setting">
                  <div><div className="s-title">Experimentar</div><div className="s-desc">Envia já uma notificação para veres como fica.</div></div>
                  <Button variant="secondary" size="sm" icon={<Send />} loading={busy} onClick={test}>Enviar teste</Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
