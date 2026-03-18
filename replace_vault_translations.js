const fs = require('fs');
const filePath = 'c:/Users/LENOVO/node/node-course/native/myapp/app/rec/[vaultId].tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes("from '@/components/contexts/language'")) {
  content = content.replace(
    "import { useAuth } from '@/components/contexts/authContext/AuthContext';",
    "import { useAuth } from '@/components/contexts/authContext/AuthContext';\nimport { useLanguage } from '@/components/contexts/language';"
  );
}

// 2. Add t inside component
if (!content.includes("const { t } = useLanguage();")) {
  content = content.replace(
    "const { user } = useAuth();",
    "const { user } = useAuth();\n  const { t } = useLanguage();"
  );
}

// 3. ratioLabel mapping
content = content.replace(
  "const ratioLabel = (r: number) => r >= 200 ? 'Sûr' : r >= 150 ? 'Attention' : 'Danger';",
  "const getRatioLabel = (r: number, t: any) => r >= 200 ? t('vaultDetail.safe') : r >= 150 ? t('vaultDetail.warning') : t('vaultDetail.danger');"
);

// Replace calls to ratioLabel
content = content.replace(/ratioLabel\(debtRatio\)/g, "getRatioLabel(debtRatio, t)");

// 4. Alert messages & TABS
content = content.replace(/'Succès'/g, "t('common.success')");
content = content.replace(/`\$\{amount.toLocaleString\(\)\} \$\{vault.collateralToken\} ajoutés au vault.`/g, "t('vaultDetail.depositSuccess', { amount: amount.toLocaleString(), token: vault.collateralToken })");
// Let's use generic strings for alerts if they aren't exactly in frAdditions.
content = content.replace(/'Succès \(démo\)'/g, "t('common.success') + ' (démo)'");
content = content.replace(/`\$\{amount.toLocaleString\(\)\} \$\{vault.collateralToken\} ajoutés.`/g, "`\${amount.toLocaleString()} \${vault.collateralToken} ajoutés.`"); // Leave demo unchanged or wrap
content = content.replace(/`\$\{amount.toFixed\(2\)\} REC remboursés.`/g, "`${amount.toFixed(2)} REC remboursés.`"); // Same
content = content.replace(/'Dette en cours'/g, "t('vaultDetail.activeDebt')");
content = content.replace(/'Remboursez tous vos REC avant de retirer votre collatéral.'/g, "t('vaultDetail.withdrawBlockedDesc')");
content = content.replace(/'Vault fermé'/g, "t('vaultDetail.statusClosed')");
content = content.replace(/`Vos \$\{vault.collateralAmount.toLocaleString\(\)\} \$\{vault.collateralToken\} ont été retournés dans votre Wallet.`/g, "t('vaultDetail.withdrawReadyDesc', { amount: vault.collateralAmount.toLocaleString(), token: vault.collateralToken })");
content = content.replace(/'Vault fermé \(démo\)'/g, "t('vaultDetail.statusClosed') + ' (démo)'");

// TABS labels
content = content.replace(/label: 'Aperçu'/g, "label: t('vaultDetail.tabOverview')");
content = content.replace(/label: 'Déposer'/g, "label: t('vaultDetail.tabDeposit')");
content = content.replace(/label: 'Rembourser'/g, "label: t('vaultDetail.tabRepay')");
content = content.replace(/label: 'Retirer'/g, "label: t('vaultDetail.tabWithdraw')");

// JSX Text replacements
content = content.replace(/'Actif' : vault.status === 'liquidated' \? 'Liquidé' : 'Fermé'/g, "t('vaultDetail.statusActive') : vault.status === 'liquidated' ? t('vaultDetail.statusLiquidated') : t('vaultDetail.statusClosed')");

content = content.replace(/Ce vault a été liquidé car le ratio est passé sous le seuil de sécurité./g, "{t('vaultDetail.liquidatedBanner')}");

content = content.replace(/>Collatéral</g, ">{t('vaultDetail.collateral')}<");
content = content.replace(/>REC minté</g, ">{t('vaultDetail.recMinted')}<");
content = content.replace(/>dette active</g, ">{t('vaultDetail.activeDebt')}<");
content = content.replace(/>Valeur USD</g, ">{t('vaultDetail.usdValue')}<");
content = content.replace(/>Ratio col.</g, ">{t('vaultDetail.collRatio')}<");
content = content.replace(/>Liquidation</g, ">{t('vaultDetail.liquidation')}<");

content = content.replace(/>Santé du vault</g, ">{t('vaultDetail.vaultHealth')}<");
content = content.replace(/>Danger: &lt;\{vault.liquidationThreshold\}%</g, ">{t('vaultDetail.dangerThreshold', { threshold: vault.liquidationThreshold.toString() })}<");
content = content.replace(/>Sûr: 200%\+</g, ">{t('vaultDetail.safeThreshold')}<");

// Aperçu tab
content = content.replace(/>\s*Trader mes REC\s*</g, ">{t('vaultDetail.tradeREC')}<");
content = content.replace(/>\s*Échangez vos REC contre RST ou d'autres tokens\s*</g, ">{t('vaultDetail.tradeRECDesc')}<");
content = content.replace(/label: 'ID Vault'/g, "label: t('vaultDetail.vaultId')");
content = content.replace(/label: 'Propriété'/g, "label: t('vaultDetail.property')");
content = content.replace(/label: 'Créé le'/g, "label: t('vaultDetail.createdAt')");
content = content.replace(/label: 'Mis à jour'/g, "label: t('vaultDetail.updatedAt')");
content = content.replace(/label: 'Prix oracle'/g, "label: t('vaultDetail.oraclePrice')");
content = content.replace(/ \/ token`/g, " ${t('vaultDetail.perToken')}`");

content = content.replace(/Ratio proche du seuil de liquidation \(\{vault.liquidationThreshold\}%\). Ajoutez du collatéral ou remboursez du REC./g, "{t('vaultDetail.liquidationWarning', { threshold: vault.liquidationThreshold.toString() })}");

// Deposit tab
content = content.replace(/>Ajouter du collatéral</g, ">{t('vaultDetail.depositTitle')}<");
content = content.replace(/Ajoutez plus de \{vault.collateralToken\} pour améliorer votre ratio et réduire le risque de liquidation./g, "{t('vaultDetail.depositDesc', { token: vault.collateralToken })}");
content = content.replace(/>\s*Quantité à ajouter \(\{vault.collateralToken\}\)\s*</g, ">{t('vaultDetail.depositQtyLabel', { token: vault.collateralToken })}<");

// Inputs placeholder
// ... won't touch pure logic placeholders for now if not strictly UI strings...
// Or we can leave placeholder as is "ex: 500"

content = content.replace(/Nouveau collatéral : \{\(vault.collateralAmount \+ parseFloat\(inputValue\)\).toLocaleString\(\)\} tokens/g, "{t('vaultDetail.depositPreviewCollateral', { amount: (vault.collateralAmount + parseFloat(inputValue)).toLocaleString() })}");

content = content.replace(/Nouveau ratio estimé : \{\(\(\(vault.collateralAmount \+ parseFloat\(inputValue\)\) \* vault.collateralPriceUsd \/ vault.recMinted\) \* 100\).toFixed\(0\)\}%/g, "{t('vaultDetail.depositPreviewRatio', { ratio: (((vault.collateralAmount + parseFloat(inputValue)) * vault.collateralPriceUsd / vault.recMinted) * 100).toFixed(0) })}");

content = content.replace(/>Déposer</g, ">{t('vaultDetail.depositBtn')}<");

// Repay tab
content = content.replace(/>Rembourser du REC</g, ">{t('vaultDetail.repayTitle')}<");
content = content.replace(/Remboursez votre dette REC. Solde actuel : \{vault.recMinted.toLocaleString\(\)\} REC./g, "{t('vaultDetail.repayDesc', { amount: vault.recMinted.toLocaleString() })}");
content = content.replace(/>\s*Montant REC à rembourser\s*</g, ">{t('vaultDetail.repayQtyLabel')}<");

content = content.replace(/'Tout' : `\$\{pct\}%`/g, "t('vaultDetail.repayAll') : `${pct}%`");

content = content.replace(/REC restants : \{\(vault.recMinted - parseFloat\(inputValue\)\).toFixed\(2\)\} REC/g, "{t('vaultDetail.repayPreviewRemaining', { amount: (vault.recMinted - parseFloat(inputValue)).toFixed(2) })}");
content = content.replace(/>\s*✓ Vault entièrement remboursé — collatéral retirable\s*</g, ">{t('vaultDetail.repayPreviewFull')}<");
content = content.replace(/>Rembourser</g, ">{t('vaultDetail.repayBtn')}<");

// Withdraw tab
content = content.replace(/>Retirer le collatéral</g, ">{t('vaultDetail.withdrawTitle')}<");

content = content.replace(/Votre dette est entièrement remboursée.\{'\\n'\}\s*Vous pouvez récupérer vos \{\s*<ThemedText style=\{\{ fontWeight: '800', color: theme.text \}\}>\s*\{vault.collateralAmount.toLocaleString\(\)\} \{vault.collateralToken\}\s*<\/ThemedText>\s*\}\s*dans votre Wallet et fermer ce vault./g, 
"{t('vaultDetail.withdrawReadyDesc', { amount: vault.collateralAmount.toLocaleString(), token: vault.collateralToken })}");

content = content.replace(/>retournés dans votre Wallet</g, ">{t('vaultDetail.withdrawReturnedLabel')}<");
content = content.replace(/>Retirer & Fermer le Vault</g, ">{t('vaultDetail.withdrawBtn')}<");

content = content.replace(/Pour retirer votre collatéral, vous devez d'abord rembourser la totalité de votre dette REC./g, "{t('vaultDetail.withdrawBlockedDesc')}");
content = content.replace(/Dette restante : \{vault.recMinted.toLocaleString\(\)\} REC à rembourser./g, "{t('vaultDetail.withdrawDebtLock', { amount: vault.recMinted.toLocaleString() })}");
content = content.replace(/>Aller rembourser</g, ">{t('vaultDetail.withdrawGoRepay')}<");

// Fix some manual spaces
content = content.replace(/\{vault.collateralAmount.toLocaleString\(\)\} \{vault.collateralToken\}\s*\} /g, "");
content = content.replace(/>\s*dans votre Wallet et fermer ce vault.\s*</g, "><");


fs.writeFileSync(filePath, content);
console.log('Replacements completed.');
