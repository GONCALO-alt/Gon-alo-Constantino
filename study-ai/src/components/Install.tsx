import { useState } from 'react';
import { Check, Download, EllipsisVertical, Share, SquarePlus } from 'lucide-react';
import { useInstall } from '../pwa';
import { useApp } from '../state';
import { LogoMark } from './Logo';
import { Button, Modal } from './ui';

/** Passos para instalar quando o navegador não tem botão de instalação (iPhone, Firefox…). */
export function InstallHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { ios } = useInstall();
  return (
    <Modal open={open} onClose={onClose} title="Instalar no telemóvel">
      <div className="stack lg">
        <div className="row" style={{ gap: 14 }}>
          <LogoMark size={48} />
          <p className="muted small">A STUDY AI fica no ecrã principal como uma aplicação: abre em ecrã inteiro, sem a barra do navegador.</p>
        </div>
        {ios ? (
          <ol className="install-steps">
            <li><span className="n">1</span><span>Abre esta página no <b>Safari</b>.</span></li>
            <li><span className="n">2</span><span>Toca em <b>Partilhar</b> <Share size={16} className="yellow" /> (na barra de baixo).</span></li>
            <li><span className="n">3</span><span>Escolhe <b>Adicionar ao ecrã principal</b> <SquarePlus size={16} className="yellow" />.</span></li>
            <li><span className="n">4</span><span>Toca em <b>Adicionar</b>. Pronto!</span></li>
          </ol>
        ) : (
          <ol className="install-steps">
            <li><span className="n">1</span><span>Abre o menu do navegador <EllipsisVertical size={16} className="yellow" /> (no canto de cima).</span></li>
            <li><span className="n">2</span><span>Escolhe <b>Instalar aplicação</b> ou <b>Adicionar ao ecrã principal</b>.</span></li>
            <li><span className="n">3</span><span>Confirma. O ícone amarelo da STUDY AI aparece no ecrã principal.</span></li>
          </ol>
        )}
        <Button block onClick={onClose}>Percebi</Button>
      </div>
    </Modal>
  );
}

/** Botão «Instalar aplicação»: usa a instalação do navegador quando existe, senão mostra os passos. */
export function InstallButton({ block, size }: { block?: boolean; size?: 'sm' | 'lg' }) {
  const install = useInstall();
  const { toast } = useApp();
  const [help, setHelp] = useState(false);
  if (install.installed)
    return (
      <span className="badge green" style={{ height: 32, padding: '0 12px' }}>
        <Check /> Aplicação instalada
      </span>
    );
  return (
    <>
      <Button
        block={block}
        size={size}
        icon={<Download />}
        onClick={async () => {
          if (install.canPrompt) {
            if (await install.prompt()) toast('A STUDY AI foi instalada.');
          } else setHelp(true);
        }}
      >
        Instalar aplicação
      </Button>
      <InstallHelp open={help} onClose={() => setHelp(false)} />
    </>
  );
}
