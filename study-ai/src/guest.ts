// Usar a app sem conta: avisos comuns.
import type { MeResponse } from '../shared/types';

export const GUEST_LOGOUT_WARNING =
  'Estás a usar a STUDY AI sem conta. Se saíres, perdes o acesso a tudo o que fizeste (plano, conversas, resumos…).\n\n' +
  'Para não perderes nada, cria primeiro a conta em Definições → Conta.\n\nSair mesmo assim?';

/** Quem usa sem conta tem de confirmar antes de sair (não há forma de voltar a entrar). */
export function confirmLogout(me: MeResponse | null): boolean {
  return !me?.user.guest || window.confirm(GUEST_LOGOUT_WARNING);
}
