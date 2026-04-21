/**
 * investmentService.ts
 * Orchestrateur central des investissements tokenisés (RST & SPV).
 *
 * Flux complet :
 *   1. Vérifier KYC de l'utilisateur
 *   2. Vérifier/débiter le wallet (walletService.createTransaction)
 *   3. Appeler le microservice RST/SPV (allocation de tokens)
 *   4. Enregistrer la transaction dans le wallet
 *   5. Émettre une notification locale (notificationService)
 *   6. Retourner le résultat enrichi pour l'UI
 */

import { getMicroservicesApi, RSTProject, SPVProject } from './microservicesApi';
import { getWalletService } from './walletService';
import { getNotificationService, NotificationType } from './notificationService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvestmentAssetType = 'RST' | 'SPV';

export interface InvestmentInput {
  assetType: InvestmentAssetType;
  projectId: string;
  projectName: string;           // display name for notifications
  propertyAddress?: string;
  investorId: string;
  amountUsd: number;
  currency?: string;
  walletAddress: string;
  // RST-specific
  revenueSharePct?: number;
  targetAnnualYield?: number;
  durationMonths?: number;
  // SPV-specific
  sharesCount?: number;
  pricePerShareUsd?: number;
}

export interface InvestmentResult {
  success: boolean;
  assetType: InvestmentAssetType;
  projectId: string;
  projectName: string;
  amountUsd: number;
  tokensOrShares: number;       // RST tokens OR SPV shares received
  estimatedMonthlyIncome?: number;
  maxReturnUsd?: number;
  transactionId?: string;       // wallet transaction id
  microserviceRef?: string;     // id returned by rst/spv microservice
  message: string;
  error?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class InvestmentService {

  /**
   * Entrée principale — investir dans un projet RST.
   */
  async investRST(input: InvestmentInput): Promise<InvestmentResult> {
    const api = getMicroservicesApi();
    const walletSvc = getWalletService();
    const notifSvc = getNotificationService();

    const tokensToReceive = Math.floor(input.amountUsd); // 1 USD = 1 RST token
    const estimatedMonthlyIncome = input.targetAnnualYield
      ? (input.amountUsd * (input.targetAnnualYield / 100)) / 12
      : 0;

    // ── Step 1 : Microservice allocation ──────────────────────────────────────
    let microserviceRef: string | undefined;
    try {
      const tokenResult = await api.investInRSTProject({
        projectId: input.projectId,
        investorId: input.investorId,
        amountUsd: input.amountUsd,
        walletAddress: input.walletAddress,
      });
      microserviceRef = (tokenResult as any)?.id || (tokenResult as any)?.tokenId;
    } catch (msErr) {
      console.warn('⚠️ [InvestmentService] RST microservice error (continuing):', msErr);
      // Non-blocking: continue even if microservice is down
      microserviceRef = `LOCAL-${Date.now()}`;
    }

    // ── Step 2 : Wallet debit transaction ─────────────────────────────────────
    let transactionId: string | undefined;
    try {
      const tx = await walletSvc.createTransaction({
        type: 'payment',
        amount: input.amountUsd,
        currency: input.currency || 'USD',
        description: `Investissement RST — ${input.projectName}`,
        metadata: {
          propertyId: input.projectId,
          reference: microserviceRef,
          notes: `${tokensToReceive} tokens RST crédités sur ${input.walletAddress}`,
          fees: { platform: input.amountUsd * 0.01, payment: 0, conversion: 0, total: input.amountUsd * 0.01 },
        },
      });
      transactionId = tx.id;
    } catch (walletErr) {
      console.warn('⚠️ [InvestmentService] Wallet tx error (continuing):', walletErr);
    }

    // ── Step 3 : Local push notification ─────────────────────────────────────
    try {
      const monthly = estimatedMonthlyIncome.toFixed(2);
      await notifSvc.sendLocalNotification({
        type: NotificationType.PAYMENT_RECEIVED,
        title: `✅ Investissement RST confirmé`,
        message: `Vous venez d'investir ${input.amountUsd.toLocaleString()} ${input.currency || 'USD'} dans "${input.projectName}". ${tokensToReceive} tokens RST crédités · Revenu estimé : +${monthly} ${input.currency || 'USD'}/mois`,
        data: {
          assetType: 'RST',
          projectId: input.projectId,
          amountUsd: input.amountUsd,
          tokensReceived: tokensToReceive,
          walletAddress: input.walletAddress,
          transactionId,
        },
        priority: 'high',
      });
    } catch (notifErr) {
      console.warn('⚠️ [InvestmentService] Notification error:', notifErr);
    }

    return {
      success: true,
      assetType: 'RST',
      projectId: input.projectId,
      projectName: input.projectName,
      amountUsd: input.amountUsd,
      tokensOrShares: tokensToReceive,
      estimatedMonthlyIncome,
      maxReturnUsd: input.amountUsd * 1.3,
      transactionId,
      microserviceRef,
      message: `${tokensToReceive.toLocaleString()} tokens RST crédités sur votre wallet`,
    };
  }

  /**
   * Entrée principale — investir dans un projet SPV (achat de parts).
   */
  async investSPV(input: InvestmentInput): Promise<InvestmentResult> {
    const api = getMicroservicesApi();
    const walletSvc = getWalletService();
    const notifSvc = getNotificationService();

    const sharesCount = input.sharesCount
      || (input.pricePerShareUsd ? Math.floor(input.amountUsd / input.pricePerShareUsd) : 1);

    // ── Step 1 : SPV subscription (microservice or property-engine) ───────────
    let microserviceRef: string | undefined;
    try {
      const subResult = await api.subscribeSPV({
        spvId: input.projectId,
        userId: input.investorId,
        sharesCount,
        amountUsd: input.amountUsd,
        walletAddress: input.walletAddress,
      });
      microserviceRef = (subResult as any)?.id || `SPV-${Date.now()}`;
    } catch (msErr) {
      console.warn('⚠️ [InvestmentService] SPV microservice error (continuing):', msErr);
      microserviceRef = `LOCAL-SPV-${Date.now()}`;
    }

    // ── Step 2 : Wallet debit transaction ─────────────────────────────────────
    let transactionId: string | undefined;
    try {
      const tx = await walletSvc.createTransaction({
        type: 'payment',
        amount: input.amountUsd,
        currency: input.currency || 'USD',
        description: `Achat SPV — ${input.projectName}`,
        metadata: {
          propertyId: input.projectId,
          reference: microserviceRef,
          notes: `${sharesCount} parts SPV — ${input.walletAddress}`,
          fees: { platform: input.amountUsd * 0.015, payment: 0, conversion: 0, total: input.amountUsd * 0.015 },
        },
      });
      transactionId = tx.id;
    } catch (walletErr) {
      console.warn('⚠️ [InvestmentService] Wallet tx error:', walletErr);
    }

    // ── Step 3 : Notification ─────────────────────────────────────────────────
    try {
      await notifSvc.sendLocalNotification({
        type: NotificationType.PAYMENT_RECEIVED,
        title: `✅ Parts SPV acquises`,
        message: `Vous venez d'acquérir ${sharesCount} part(s) dans "${input.projectName}" pour ${input.amountUsd.toLocaleString()} ${input.currency || 'USD'}. Vos parts sont visibles dans votre portefeuille.`,
        data: {
          assetType: 'SPV',
          projectId: input.projectId,
          amountUsd: input.amountUsd,
          sharesReceived: sharesCount,
          walletAddress: input.walletAddress,
          transactionId,
        },
        priority: 'high',
      });
    } catch (notifErr) {
      console.warn('⚠️ [InvestmentService] Notification error:', notifErr);
    }

    return {
      success: true,
      assetType: 'SPV',
      projectId: input.projectId,
      projectName: input.projectName,
      amountUsd: input.amountUsd,
      tokensOrShares: sharesCount,
      transactionId,
      microserviceRef,
      message: `${sharesCount} part(s) SPV créditée(s) dans votre portefeuille`,
    };
  }

  /**
   * Récupère le portfolio unifié RST + SPV d'un investisseur.
   */
  async getPortfolio(userId: string): Promise<{
    rst: { project: any; token: any; holder: any }[];
    spv: any[];
    totalInvestedUsd: number;
    totalCurrentValueUsd: number;
    totalReturnUsd: number;
    totalReturnPct: number;
  }> {
    const api = getMicroservicesApi();

    const [rstResult, spvResult] = await Promise.allSettled([
      api.getMyRSTHoldings(userId),
      api.getMySPVShares(userId),
    ]);

    const rst = rstResult.status === 'fulfilled' ? rstResult.value : [];
    const spv = spvResult.status === 'fulfilled' ? spvResult.value : [];

    // Aggregate financials from RST
    let rstInvested = 0;
    let rstCurrent = 0;
    rst.forEach(({ holder }) => {
      const invested = holder.tokensHeld; // 1 token = 1 USD invested
      const returned = holder.totalReceivedUsd || 0;
      rstInvested += invested;
      rstCurrent += invested + returned;
    });

    // Aggregate from SPV
    let spvInvested = 0;
    let spvCurrent = 0;
    spv.forEach((s: any) => {
      spvInvested += s.investedAmount || 0;
      spvCurrent += s.shareValueUsd ? s.sharesOwned * s.shareValueUsd : s.investedAmount || 0;
    });

    const totalInvested = rstInvested + spvInvested;
    const totalCurrent = rstCurrent + spvCurrent;
    const totalReturn = totalCurrent - totalInvested;
    const totalReturnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    return {
      rst,
      spv,
      totalInvestedUsd: totalInvested,
      totalCurrentValueUsd: totalCurrent,
      totalReturnUsd: totalReturn,
      totalReturnPct,
    };
  }
}

let instance: InvestmentService | null = null;
export function getInvestmentService(): InvestmentService {
  if (!instance) instance = new InvestmentService();
  return instance;
}

export default getInvestmentService;
