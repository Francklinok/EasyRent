import { Property, Reservation, User } from '@/types/type';
import { ContractType } from '@/types/contract';

export interface ProfessionalContractParams {
  contractId: string;
  contractType: ContractType;
  property: Property;
  reservation: Reservation;
  buyer?: User;
  seller?: User;
  landlord?: User;
  tenant?: User;
  qrCodeSVG?: string;
  watermarkSVG?: string;
  purchasePrice?: number;
  earnestMoney?: number;
  paymentMethod?: string;
  acceptanceDate?: Date;
  closingDate?: Date;
  additionalTerms?: string[];
  propertyImage?: string;
  // Raw activity property for extra detail fields
  rawProperty?: {
    propertyType?: string;
    description?: string;
    amenities?: string[];
    generalHInfo?: {
      rooms?: number;
      bedrooms?: number;
      bathrooms?: number;
      toilets?: number;
      surface?: number;
      area?: string;
      furnished?: boolean;
      pets?: boolean;
      smoking?: boolean;
      maxOccupants?: number;
    };
    generalLandinfo?: {
      surface?: number;
      constructible?: boolean;
      cultivable?: boolean;
      fence?: boolean;
    };
    ownerCriteria?: {
      minimumDuration?: number;
      currency?: string;
      acceptedPaymentMethods?: string[];
    };
  };
}

const generateProfessionalContractHTML = (params: ProfessionalContractParams): string => {
  const {
    contractId,
    contractType,
    property,
    reservation,
    buyer,
    seller,
    landlord,
    tenant,
    qrCodeSVG = '',
    purchasePrice,
    earnestMoney,
    paymentMethod = 'Virement bancaire / Mobile Money',
    acceptanceDate = new Date(),
    additionalTerms = [],
    propertyImage,
    rawProperty,
  } = params;

  const isPurchase = contractType === ContractType.PURCHASE;

  const formatCurrency = (amount: number, curr?: string): string => {
    const useCurrency = curr || currency || 'XAF';
    try {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: useCurrency, minimumFractionDigits: 0 }).format(amount);
    } catch {
      return `${amount.toLocaleString('fr-FR')} ${useCurrency}`;
    }
  };

  const formatDate = (date: any): string => {
    if (!date) return '_______________';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const today = formatDate(new Date());
  const genDate = new Date().toLocaleString('fr-FR');

  const party1 = isPurchase ? seller : landlord;
  const party2 = isPurchase ? buyer : tenant;
  const party1Label = isPurchase ? 'VENDEUR' : 'BAILLEUR (PROPRIÉTAIRE)';
  const party2Label = isPurchase ? 'ACHETEUR' : 'LOCATAIRE';
  const party1Role = isPurchase ? 'Vendeur' : 'Bailleur';
  const party2Role = isPurchase ? 'Acheteur' : 'Locataire';

  const monthlyRent = reservation?.monthlyRent || (property as any)?.rentalPrice || (property as any)?.ownerCriteria?.monthlyRent || 0;
  const deposit = (property as any)?.depositAmount || (property as any)?.ownerCriteria?.depositAmount || monthlyRent * 2;
  const price = isPurchase ? (purchasePrice || deposit * 10) : monthlyRent;

  // Calculate duration in months
  const startDate = reservation?.startDate ? new Date(reservation.startDate) : new Date();
  const endDate = reservation?.endDate ? new Date(reservation.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const minimumDuration = rawProperty?.ownerCriteria?.minimumDuration || 1;
  const durationMonths = Math.max(minimumDuration, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const totalAmount = monthlyRent * durationMonths;

  const propertyAddr = (property as any)?.address || 'Adresse non spécifiée';
  const propertyTitle = (property as any)?.title || 'Propriété';
  const propertyDescription = rawProperty?.description || '';
  const ownerName = (property as any)?.ownerName || party1?.fullName || '_______________';
  const ownerEmail = (property as any)?.ownerEmail || party1?.email || '';
  const ownerPhone = (property as any)?.ownerPhone || '';
  const tenantName = party2?.fullName || '_______________';
  const tenantEmail = party2?.email || '';

  // Property details from generalHInfo
  const ghi = rawProperty?.generalHInfo;
  const gli = rawProperty?.generalLandinfo;
  const isLand = rawProperty?.propertyType === 'terrain';
  const surface = ghi?.surface || gli?.surface || (property as any)?.surface || 0;
  const rooms = ghi?.rooms || (property as any)?.rooms || 0;
  const bedrooms = ghi?.bedrooms || 0;
  const bathrooms = ghi?.bathrooms || 0;
  const area = ghi?.area || '';
  const furnished = ghi?.furnished ?? false;
  const maxOccupants = ghi?.maxOccupants || 1;
  const amenitiesList = rawProperty?.amenities || [];
  const currency = rawProperty?.ownerCriteria?.currency || 'XAF';
  const acceptedPayMethods = rawProperty?.ownerCriteria?.acceptedPaymentMethods || [];
  const payMethodLabels: Record<string, string> = {
    bank_card: 'Carte bancaire', mobile_money: 'Mobile Money', paypal: 'PayPal',
    cash: 'Espèces', bank_transfer: 'Virement bancaire', crypto: 'Cryptomonnaie', other: 'Autre',
  };
  const computedPaymentMethod = acceptedPayMethods.length > 0
    ? acceptedPayMethods.map((m: string) => payMethodLabels[m] || m).join(', ')
    : paymentMethod;

  const propertyTypeLabel: Record<string, string> = {
    villa: 'Villa', apartment: 'Appartement', home: 'Maison', house: 'Maison',
    penthouse: 'Penthouse', studio: 'Studio', loft: 'Loft', bureau: 'Bureau',
    chalet: 'Chalet', hotel: 'Hôtel / Résidence', terrain: 'Terrain', commercial: 'Local Commercial',
  };
  const propTypeDisplay = propertyTypeLabel[rawProperty?.propertyType || ''] || (isPurchase ? 'Vente' : 'Location');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Georgia, 'Times New Roman', serif; font-size:10.5pt; color:#1a1a1a; background:#fff; }

/* ─── PAGE ──────────────────────────────── */
.page {
  width:210mm; min-height:297mm; margin:0 auto; background:#fff;
  position:relative; padding-bottom:60px;
}
.page + .page { page-break-before: always; }

/* ─── HEADER ─────────────────────────────── */
.header {
  background: linear-gradient(135deg, #0D3B1C 0%, #1B5E20 50%, #2E7D32 100%);
  padding: 28px 36px 20px;
  color: white;
  position: relative;
  overflow: hidden;
}
.header::before {
  content: '';
  position: absolute; top: -40px; right: -40px;
  width: 180px; height: 180px;
  border: 40px solid rgba(255,255,255,0.07);
  border-radius: 50%;
}
.header::after {
  content: '';
  position: absolute; bottom: -30px; left: 60px;
  width: 120px; height: 120px;
  border: 25px solid rgba(255,255,255,0.05);
  border-radius: 50%;
}
.header-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.brand { }
.brand-name { font-size:22pt; font-weight:bold; letter-spacing:2px; font-family:'Arial Black', sans-serif; }
.brand-name span { color:#A5D6A7; }
.brand-tagline { font-size:8pt; opacity:0.75; letter-spacing:1.5px; text-transform:uppercase; margin-top:3px; }
.contract-badge {
  background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3);
  border-radius:8px; padding:10px 16px; text-align:right;
}
.badge-label { font-size:7pt; opacity:0.8; text-transform:uppercase; letter-spacing:1px; }
.badge-id { font-family:'Courier New', monospace; font-size:11pt; font-weight:bold; letter-spacing:1px; color:#A5D6A7; }
.badge-date { font-size:8pt; opacity:0.75; margin-top:2px; }
.contract-title { text-align:center; border-top:1px solid rgba(255,255,255,0.2); padding-top:16px; }
.contract-title h1 { font-size:17pt; font-weight:bold; letter-spacing:2px; text-transform:uppercase; margin-bottom:4px; }
.contract-title h2 { font-size:9pt; font-weight:normal; opacity:0.85; letter-spacing:1px; }

/* ─── STATUS BANNER ──────────────────────── */
.status-banner {
  background:#E8F5E9; border-left:5px solid #2E7D32;
  padding:10px 20px; margin:20px 36px 0;
  display:flex; align-items:center; gap:12px;
}
.status-dot { width:10px; height:10px; background:#2E7D32; border-radius:50%; flex-shrink:0; }
.status-text { font-size:9pt; color:#1B5E20; font-weight:bold; }
.status-sub { font-size:8pt; color:#388E3C; font-weight:normal; }

/* ─── CONTENT ────────────────────────────── */
.content { padding:20px 36px; }
.section { margin-bottom:22px; }
.section-title {
  font-size:9pt; font-weight:bold; letter-spacing:1.5px; text-transform:uppercase;
  color:#1B5E20; border-bottom:2px solid #1B5E20; padding-bottom:5px; margin-bottom:12px;
  display:flex; align-items:center; gap:8px;
}
.section-num {
  background:#1B5E20; color:white; width:20px; height:20px;
  border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
  font-size:8pt; flex-shrink:0;
}

/* ─── PARTIES ────────────────────────────── */
.parties-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.party-card {
  border:1px solid #C8E6C9; border-radius:10px; overflow:hidden;
}
.party-header {
  background:#1B5E20; color:white; padding:8px 14px;
  font-size:9pt; font-weight:bold; letter-spacing:1px; text-transform:uppercase;
}
.party-body { padding:14px; background:#FAFAFA; }
.party-name { font-size:12pt; font-weight:bold; color:#1a1a1a; margin-bottom:8px; }
.party-detail { font-size:8.5pt; color:#555; margin-bottom:3px; display:flex; gap:6px; }
.party-detail-label { color:#888; min-width:70px; }
.party-detail-value { font-weight:600; color:#222; }

/* ─── PROPERTY ───────────────────────────── */
.property-card {
  border:1px solid #C8E6C9; border-radius:10px; overflow:hidden; margin-bottom:8px;
}
.property-img-container { width:100%; height:160px; background:linear-gradient(135deg, #E8F5E9, #C8E6C9); overflow:hidden; position:relative; }
.property-img-container img { width:100%; height:100%; object-fit:cover; }
.property-img-placeholder {
  width:100%; height:100%; display:flex; flex-direction:column;
  align-items:center; justify-content:center; color:#1B5E20;
}
.property-img-placeholder .icon { font-size:40px; margin-bottom:8px; }
.property-img-placeholder .text { font-size:9pt; font-weight:bold; color:#2E7D32; }
.property-info { padding:14px; }
.property-name { font-size:13pt; font-weight:bold; color:#1a1a1a; margin-bottom:6px; }
.property-address { font-size:9pt; color:#555; margin-bottom:10px; display:flex; align-items:flex-start; gap:5px; }
.location-icon { color:#1B5E20; flex-shrink:0; font-size:11pt; }
.property-meta { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.meta-item { background:#E8F5E9; border-radius:6px; padding:8px; text-align:center; }
.meta-label { font-size:7pt; color:#388E3C; text-transform:uppercase; letter-spacing:0.5px; }
.meta-value { font-size:10pt; font-weight:bold; color:#1B5E20; margin-top:2px; }

/* ─── FINANCIAL ──────────────────────────── */
.financial-card {
  background:linear-gradient(135deg, #0D3B1C, #1B5E20);
  border-radius:10px; padding:20px; color:white; margin-bottom:8px;
}
.financial-title { font-size:9pt; letter-spacing:1px; opacity:0.8; margin-bottom:14px; text-transform:uppercase; }
.financial-main { text-align:center; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.2); }
.financial-main-label { font-size:9pt; opacity:0.75; margin-bottom:4px; }
.financial-main-amount { font-size:26pt; font-weight:bold; color:#A5D6A7; letter-spacing:-0.5px; }
.financial-rows { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.financial-row { background:rgba(255,255,255,0.1); border-radius:6px; padding:8px 10px; }
.financial-row-label { font-size:7.5pt; opacity:0.7; margin-bottom:2px; }
.financial-row-value { font-size:10pt; font-weight:bold; }

/* ─── DATES ──────────────────────────────── */
.dates-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.date-card { border:1px solid #C8E6C9; border-radius:8px; padding:10px 12px; text-align:center; }
.date-card-label { font-size:7.5pt; color:#1B5E20; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
.date-card-value { font-size:9.5pt; font-weight:bold; color:#1a1a1a; }
.date-card-sub { font-size:7.5pt; color:#666; margin-top:2px; }
.duration-card { background:#1B5E20; color:white; border-color:#1B5E20; }
.duration-card .date-card-label { color:rgba(255,255,255,0.75); }
.duration-card .date-card-value { font-size:16pt; color:#A5D6A7; }
.duration-card .date-card-sub { color:rgba(255,255,255,0.6); }

/* ─── CLAUSES ────────────────────────────── */
.clauses { }
.clause { margin-bottom:10px; padding:10px 14px; background:#FAFAFA; border-left:3px solid #C8E6C9; border-radius:0 6px 6px 0; }
.clause-title { font-size:9pt; font-weight:bold; color:#1B5E20; margin-bottom:4px; }
.clause-text { font-size:8.5pt; color:#444; line-height:1.55; }

/* ─── OBLIGATIONS ────────────────────────── */
.obligations-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.obligations-side { }
.obligations-side-title { font-size:8.5pt; font-weight:bold; color:#1B5E20; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px; }
.obligation-item { display:flex; align-items:flex-start; gap:7px; margin-bottom:7px; }
.obligation-check { color:#2E7D32; font-size:9pt; flex-shrink:0; margin-top:1px; }
.obligation-text { font-size:8pt; color:#444; line-height:1.45; }

/* ─── SIGNATURE ──────────────────────────── */
.validity-banner {
  background:linear-gradient(90deg, #E8F5E9, #C8E6C9, #E8F5E9);
  border:1px solid #A5D6A7; border-radius:8px;
  padding:12px 20px; margin-bottom:20px; text-align:center;
}
.validity-text { font-size:9pt; color:#1B5E20; font-weight:bold; }
.validity-sub { font-size:8pt; color:#388E3C; margin-top:3px; }
.signature-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
.sig-box { border:1px solid #C8E6C9; border-radius:10px; overflow:hidden; }
.sig-header { background:#1B5E20; color:white; padding:8px 14px; font-size:9pt; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; }
.sig-body { padding:14px; }
.sig-name { font-size:11pt; font-weight:bold; color:#1a1a1a; margin-bottom:4px; }
.sig-email { font-size:8pt; color:#666; margin-bottom:12px; }
.sig-area {
  height:56px; border:2px dashed #C8E6C9; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  background:#F1F8E9;
}
.sig-area-text { font-size:8.5pt; color:#81C784; font-style:italic; }
.sig-date { font-size:8pt; color:#888; margin-top:8px; }
.sig-date strong { color:#1B5E20; }

/* ─── VALIDATION SEAL ────────────────────── */
.seal-row { display:flex; align-items:center; gap:20px; padding:16px 20px; background:#F1F8E9; border-radius:10px; border:1px solid #A5D6A7; }
.seal {
  width:80px; height:80px; flex-shrink:0;
  border:3px solid #1B5E20; border-radius:50%;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; color:#1B5E20;
}
.seal-top { font-size:6.5pt; font-weight:bold; letter-spacing:0.5px; }
.seal-icon { font-size:18pt; margin:2px 0; }
.seal-bottom { font-size:6.5pt; font-weight:bold; letter-spacing:0.5px; }
.seal-text { flex:1; }
.seal-text-title { font-size:10pt; font-weight:bold; color:#1B5E20; margin-bottom:4px; }
.seal-text-body { font-size:8pt; color:#444; line-height:1.5; }
.qr-container { text-align:center; flex-shrink:0; }
.qr-box { width:70px; height:70px; border:1px solid #C8E6C9; border-radius:6px; padding:4px; background:white; }
.qr-box svg { width:100%; height:100%; }
.qr-label { font-size:7pt; color:#888; margin-top:4px; }

/* ─── FOOTER ─────────────────────────────── */
.footer {
  position:absolute; bottom:0; left:0; right:0;
  background:#F8F9FA; border-top:1px solid #E0E0E0;
  padding:10px 36px; display:flex; justify-content:space-between; align-items:center;
}
.footer-left { font-size:7.5pt; color:#888; }
.footer-center { font-size:8pt; color:#1B5E20; font-weight:bold; }
.footer-right { font-family:'Courier New', monospace; font-size:7.5pt; color:#1B5E20; }

/* ─── PRINT ──────────────────────────────── */
@media print {
  body { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
  .page { page-break-after: always; }
}
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════ -->
<!--  PAGE 1 — IDENTIFICATION & PARTIES                        -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <div class="brand">
        <div class="brand-name">Easy<span>Rent</span></div>
        <div class="brand-tagline">Plateforme Immobilière Certifiée · Afrique</div>
      </div>
      <div class="contract-badge">
        <div class="badge-label">Numéro de contrat</div>
        <div class="badge-id">${contractId}</div>
        <div class="badge-date">Émis le ${today}</div>
      </div>
    </div>
    <div class="contract-title">
      <h1>${isPurchase ? 'CONTRAT DE VENTE IMMOBILIÈRE' : 'CONTRAT DE BAIL D\'HABITATION'}</h1>
      <h2>${isPurchase ? 'Acte Authentique de Cession de Bien Immobilier' : 'Convention de Location à Usage d\'Habitation Principale — Loi applicable'}</h2>
    </div>
  </div>

  <!-- STATUS -->
  <div class="status-banner">
    <div class="status-dot"></div>
    <div>
      <span class="status-text">✓ CONTRAT VALIDÉ ET ACTIF</span>
      <span class="status-sub"> — Paiement confirmé · Signature en attente des parties</span>
    </div>
  </div>

  <div class="content">

    <!-- ART. 1 — PARTIES -->
    <div class="section">
      <div class="section-title"><span class="section-num">1</span> Identification des Parties</div>
      <div class="parties-grid">
        <div class="party-card">
          <div class="party-header">▸ ${party1Label}</div>
          <div class="party-body">
            <div class="party-name">${ownerName}</div>
            ${ownerEmail ? `<div class="party-detail"><span class="party-detail-label">E-mail :</span><span class="party-detail-value">${ownerEmail}</span></div>` : ''}
            ${ownerPhone ? `<div class="party-detail"><span class="party-detail-label">Téléphone :</span><span class="party-detail-value">${ownerPhone}</span></div>` : ''}
            <div class="party-detail"><span class="party-detail-label">Qualité :</span><span class="party-detail-value">${party1Role} — Propriétaire du bien</span></div>
          </div>
        </div>
        <div class="party-card">
          <div class="party-header">▸ ${party2Label}</div>
          <div class="party-body">
            <div class="party-name">${tenantName}</div>
            ${tenantEmail ? `<div class="party-detail"><span class="party-detail-label">E-mail :</span><span class="party-detail-value">${tenantEmail}</span></div>` : ''}
            <div class="party-detail"><span class="party-detail-label">Qualité :</span><span class="party-detail-value">${party2Role} — Partie prenante au contrat</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ART. 2 — BIEN -->
    <div class="section">
      <div class="section-title"><span class="section-num">2</span> Description du Bien Immobilier</div>
      <div class="property-card">
        <div class="property-img-container">
          ${propertyImage
            ? `<img src="${propertyImage}" alt="${propertyTitle}" />`
            : `<div class="property-img-placeholder">
                <div class="icon">🏠</div>
                <div class="text">${propertyTitle}</div>
               </div>`
          }
        </div>
        <div class="property-info">
          <div class="property-name">${propertyTitle}</div>
          <div class="property-address">
            <span class="location-icon">📍</span>
            <span>${propertyAddr}${area ? ` — ${area}` : ''}</span>
          </div>
          ${propertyDescription ? `<div style="font-size:8.5pt;color:#555;margin-bottom:10px;line-height:1.5;">${propertyDescription}</div>` : ''}
          <div class="property-meta">
            <div class="meta-item">
              <div class="meta-label">Type de bien</div>
              <div class="meta-value">${propTypeDisplay}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Action</div>
              <div class="meta-value">${isPurchase ? 'Vente' : 'Location'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Surface</div>
              <div class="meta-value">${surface ? `${surface} m²` : '—'}</div>
            </div>
            ${!isLand ? `
            <div class="meta-item">
              <div class="meta-label">Pièces</div>
              <div class="meta-value">${rooms || '—'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Chambres</div>
              <div class="meta-value">${bedrooms || '—'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Salles de bain</div>
              <div class="meta-value">${bathrooms || '—'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Meublé</div>
              <div class="meta-value">${furnished ? 'Oui' : 'Non'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Max occupants</div>
              <div class="meta-value">${maxOccupants}</div>
            </div>
            ` : `
            <div class="meta-item">
              <div class="meta-label">Constructible</div>
              <div class="meta-value">${gli?.constructible ? 'Oui' : 'Non'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Cultivable</div>
              <div class="meta-value">${gli?.cultivable ? 'Oui' : 'Non'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Clôturé</div>
              <div class="meta-value">${gli?.fence ? 'Oui' : 'Non'}</div>
            </div>
            `}
          </div>
          ${amenitiesList.length > 0 ? `
          <div style="margin-top:10px;">
            <div style="font-size:7.5pt;color:#1B5E20;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Équipements & Commodités</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;">
              ${amenitiesList.slice(0, 10).map((a: string) => `<span style="background:#E8F5E9;color:#1B5E20;font-size:7.5pt;padding:3px 8px;border-radius:12px;font-weight:500;">${a}</span>`).join('')}
              ${amenitiesList.length > 10 ? `<span style="background:#E8F5E9;color:#1B5E20;font-size:7.5pt;padding:3px 8px;border-radius:12px;">+${amenitiesList.length - 10} autres</span>` : ''}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- ART. 3 — CONDITIONS FINANCIÈRES -->
    <div class="section">
      <div class="section-title"><span class="section-num">3</span> Conditions Financières</div>
      <div class="financial-card">
        <div class="financial-title">Récapitulatif financier du contrat</div>
        <div class="financial-main">
          <div class="financial-main-label">${isPurchase ? 'Prix de Vente Total' : 'Loyer Mensuel'}</div>
          <div class="financial-main-amount">${formatCurrency(price)}</div>
        </div>
        <div class="financial-rows">
          <div class="financial-row">
            <div class="financial-row-label">Dépôt de garantie</div>
            <div class="financial-row-value">${formatCurrency(deposit)}</div>
          </div>
          ${!isPurchase ? `<div class="financial-row">
            <div class="financial-row-label">Durée totale (${durationMonths} mois)</div>
            <div class="financial-row-value">${formatCurrency(totalAmount)}</div>
          </div>` : `<div class="financial-row">
            <div class="financial-row-label">Mode de paiement</div>
            <div class="financial-row-value" style="font-size:8.5pt">${computedPaymentMethod}</div>
          </div>`}
        </div>
      </div>
    </div>

    <!-- ART. 4 — DURÉE -->
    <div class="section">
      <div class="section-title"><span class="section-num">4</span> Durée et Période de Location</div>
      <div class="dates-grid">
        <div class="date-card">
          <div class="date-card-label">📅 Date de début</div>
          <div class="date-card-value">${formatDate(startDate)}</div>
          <div class="date-card-sub">Entrée dans les lieux</div>
        </div>
        <div class="date-card duration-card">
          <div class="date-card-label">⏱ Durée du bail</div>
          <div class="date-card-value">${durationMonths}</div>
          <div class="date-card-sub">mois (${Math.floor(durationMonths / 12)}a ${durationMonths % 12}m)</div>
        </div>
        <div class="date-card">
          <div class="date-card-label">🔚 Date de fin</div>
          <div class="date-card-value">${formatDate(endDate)}</div>
          <div class="date-card-sub">Libération des lieux</div>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER PAGE 1 -->
  <div class="footer">
    <div class="footer-left">EasyRent · Contrat généré le ${genDate}</div>
    <div class="footer-center">CONFIDENTIEL — DOCUMENT LÉGAL</div>
    <div class="footer-right">${contractId} · Page 1/2</div>
  </div>
</div>


<!-- ═══════════════════════════════════════════════════════════ -->
<!--  PAGE 2 — CLAUSES, OBLIGATIONS & SIGNATURES              -->
<!-- ═══════════════════════════════════════════════════════════ -->
<div class="page">

  <!-- HEADER PAGE 2 -->
  <div class="header" style="padding:14px 36px;">
    <div class="header-top" style="margin-bottom:0;">
      <div class="brand">
        <div class="brand-name" style="font-size:14pt;">Easy<span>Rent</span></div>
      </div>
      <div class="contract-badge" style="padding:6px 14px;">
        <div class="badge-label">Suite du contrat</div>
        <div class="badge-id" style="font-size:9pt;">${contractId}</div>
      </div>
    </div>
  </div>

  <div class="content">

    <!-- ART. 5 — CLAUSES -->
    <div class="section">
      <div class="section-title"><span class="section-num">5</span> Clauses Contractuelles</div>
      <div class="clauses">
        ${isPurchase ? `
        <div class="clause"><div class="clause-title">5.1 Transfert de Propriété</div><div class="clause-text">Le transfert définitif de propriété interviendra à la date de signature de l'acte authentique, après règlement intégral du prix de vente convenu entre les parties.</div></div>
        <div class="clause"><div class="clause-title">5.2 Garanties du Vendeur</div><div class="clause-text">Le vendeur garantit que le bien est libre de toute servitude non déclarée, hypothèque occulte, et qu'il dispose de la pleine capacité juridique pour en opérer la cession.</div></div>
        <div class="clause"><div class="clause-title">5.3 Conditions Suspensives</div><div class="clause-text">Le présent contrat est conclu sous condition suspensive de l'obtention d'un financement bancaire par l'acheteur dans un délai maximal de 30 jours à compter de la signature.</div></div>
        <div class="clause"><div class="clause-title">5.4 État du Bien</div><div class="clause-text">L'acheteur reconnaît avoir visité le bien et en accepter l'état actuel. Un état des lieux contradictoire sera établi lors de la remise des clés.</div></div>
        ` : `
        <div class="clause"><div class="clause-title">5.1 Paiement du Loyer</div><div class="clause-text">Le loyer mensuel de <strong>${formatCurrency(monthlyRent)}</strong> est payable d'avance au plus tard le 5 de chaque mois civil, par virement bancaire ou Mobile Money au compte du bailleur.</div></div>
        <div class="clause"><div class="clause-title">5.2 Dépôt de Garantie</div><div class="clause-text">Un dépôt de garantie de <strong>${formatCurrency(deposit)}</strong> est versé à la signature. Il sera restitué dans un délai de 30 jours après libération des lieux, déduction faite des éventuelles réparations locatives.</div></div>
        <div class="clause"><div class="clause-title">5.3 Entretien et Réparations</div><div class="clause-text">Le locataire s'engage à maintenir le bien en bon état et à effectuer les réparations locatives à sa charge. Le bailleur prend en charge les grosses réparations telles que définies par la loi.</div></div>
        <div class="clause"><div class="clause-title">5.4 Usage Exclusif</div><div class="clause-text">Le bien est loué à usage d'habitation principale et exclusive. Toute activité commerciale, sous-location ou cession du bail est formellement interdite sans accord écrit préalable du bailleur.</div></div>
        <div class="clause"><div class="clause-title">5.5 Durée Minimale</div><div class="clause-text">La durée minimale du présent bail est fixée à <strong>${minimumDuration} mois</strong> à compter de la date de prise d'effet. À l'expiration du terme, le bail est reconduit tacitement pour une durée identique, sauf préavis écrit de l'une ou l'autre des parties notifié au moins 3 mois avant l'échéance.</div></div>
        `}
        ${additionalTerms.map((t, i) => `<div class="clause"><div class="clause-title">5.${isPurchase ? 5 + i : 6 + i} Clause Additionnelle</div><div class="clause-text">${t}</div></div>`).join('')}
      </div>
    </div>

    <!-- ART. 6 — OBLIGATIONS -->
    <div class="section">
      <div class="section-title"><span class="section-num">6</span> Obligations Réciproques</div>
      <div class="obligations-grid">
        <div class="obligations-side">
          <div class="obligations-side-title">▸ ${party1Role}</div>
          ${isPurchase ? `
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Délivrer le bien libre de toute occupation à la date convenue</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Fournir tous documents légaux de propriété</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Garantir l'éviction et les vices cachés</span></div>
          ` : `
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Délivrer le bien en bon état d'usage et de réparation</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Assurer la jouissance paisible des lieux</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Effectuer les grosses réparations nécessaires</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Fournir une quittance mensuelle à chaque paiement</span></div>
          `}
        </div>
        <div class="obligations-side">
          <div class="obligations-side-title">▸ ${party2Role}</div>
          ${isPurchase ? `
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Régler le prix de vente dans les délais convenus</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Prendre possession du bien à la date fixée</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Supporter les frais de notaire et taxes de mutation</span></div>
          ` : `
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Payer le loyer et les charges aux échéances convenues</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">User du bien paisiblement et en bon père de famille</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Souscrire une assurance habitation et en justifier</span></div>
          <div class="obligation-item"><span class="obligation-check">✓</span><span class="obligation-text">Restituer le bien en bon état en fin de bail</span></div>
          `}
        </div>
      </div>
    </div>

    <!-- ART. 7 — SIGNATURES -->
    <div class="section">
      <div class="section-title"><span class="section-num">7</span> Signatures des Parties</div>

      <div class="validity-banner">
        <div class="validity-text">📋 Ce contrat est valide pour une durée minimale de ${durationMonths} mois</div>
        <div class="validity-sub">Du ${formatDate(startDate)} au ${formatDate(endDate)} — Renouvelable par accord mutuel</div>
      </div>

      <div class="signature-grid">
        <div class="sig-box">
          <div class="sig-header">✍ ${party1Role} — ${party1Label}</div>
          <div class="sig-body">
            <div class="sig-name">${ownerName}</div>
            <div class="sig-email">${ownerEmail}</div>
            <div class="sig-area"><span class="sig-area-text">Signature du ${party1Role.toLowerCase()}</span></div>
            <div class="sig-date">Fait à ________________, le <strong>${today}</strong></div>
          </div>
        </div>
        <div class="sig-box">
          <div class="sig-header">✍ ${party2Role} — ${party2Label}</div>
          <div class="sig-body">
            <div class="sig-name">${tenantName}</div>
            <div class="sig-email">${tenantEmail}</div>
            <div class="sig-area"><span class="sig-area-text">Signature du ${party2Role.toLowerCase()}</span></div>
            <div class="sig-date">Fait à ________________, le <strong>_______________</strong></div>
          </div>
        </div>
      </div>

      <!-- SEAL & QR -->
      <div class="seal-row">
        <div class="seal">
          <div class="seal-top">EASYRENT</div>
          <div class="seal-icon">⚖</div>
          <div class="seal-bottom">CERTIFIÉ</div>
        </div>
        <div class="seal-text">
          <div class="seal-text-title">Contrat Authentifié par EasyRent</div>
          <div class="seal-text-body">
            Le présent contrat a été généré et validé par la plateforme EasyRent. Il constitue un document juridiquement contraignant entre les parties signataires, conformément aux dispositions du droit immobilier applicable. Toute modification doit faire l'objet d'un avenant signé par les deux parties.
          </div>
        </div>
        <div class="qr-container">
          <div class="qr-box">
            ${qrCodeSVG || `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect fill="#f0f0f0" width="100" height="100"/>
              <rect fill="#1B5E20" x="10" y="10" width="30" height="30"/>
              <rect fill="white" x="15" y="15" width="20" height="20"/>
              <rect fill="#1B5E20" x="20" y="20" width="10" height="10"/>
              <rect fill="#1B5E20" x="60" y="10" width="30" height="30"/>
              <rect fill="white" x="65" y="15" width="20" height="20"/>
              <rect fill="#1B5E20" x="70" y="20" width="10" height="10"/>
              <rect fill="#1B5E20" x="10" y="60" width="30" height="30"/>
              <rect fill="white" x="15" y="65" width="20" height="20"/>
              <rect fill="#1B5E20" x="20" y="70" width="10" height="10"/>
              <rect fill="#1B5E20" x="55" y="55" width="8" height="8"/>
              <rect fill="#1B5E20" x="67" y="55" width="8" height="8"/>
              <rect fill="#1B5E20" x="79" y="55" width="8" height="8"/>
              <rect fill="#1B5E20" x="55" y="67" width="8" height="8"/>
              <rect fill="#1B5E20" x="79" y="67" width="8" height="8"/>
              <rect fill="#1B5E20" x="55" y="79" width="8" height="8"/>
              <rect fill="#1B5E20" x="67" y="79" width="8" height="8"/>
              <rect fill="#1B5E20" x="79" y="79" width="8" height="8"/>
            </svg>`}
          </div>
          <div class="qr-label">Vérifier en ligne</div>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER PAGE 2 -->
  <div class="footer">
    <div class="footer-left">EasyRent · Plateforme Immobilière Certifiée · Afrique</div>
    <div class="footer-center">Document confidentiel à valeur contractuelle</div>
    <div class="footer-right">${contractId} · Page 2/2</div>
  </div>

</div>

</body>
</html>`;
};

export default generateProfessionalContractHTML;
