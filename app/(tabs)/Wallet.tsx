import { Redirect } from 'expo-router';

// L'onglet Wallet redirige vers /wallet/Wallet plutôt que de réexporter le
// composant directement : la page a besoin du contexte WalletHeaderContext
// (titre dynamique, safe-area) fourni par app/wallet/_layout.tsx, qui n'est
// jamais monté si on réexporte le composant directement dans (tabs).
export default function WalletTab() {
  return <Redirect href="/wallet/Wallet" />;
}
