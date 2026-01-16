import { Property, Reservation, User } from '@/types/type';
import { ContractType } from '@/types/contract';

export interface ProfessionalContractParams {
  contractId: string;
  contractType: ContractType;
  property: Property;
  reservation: Reservation;
  buyer?: User;      // For purchase contracts
  seller?: User;     // For purchase contracts
  landlord?: User;   // For rental contracts
  tenant?: User;     // For rental contracts
  qrCodeSVG?: string;
  watermarkSVG?: string;
  purchasePrice?: number;
  earnestMoney?: number;
  paymentMethod?: string;
  acceptanceDate?: Date;
  closingDate?: Date;
  additionalTerms?: string[];
  propertyImage?: string;
}

/**
 * Generates  one-page contract 
 * Supports both Purchase/Sale and Rental agreements
 */
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
    watermarkSVG = '',
    purchasePrice,
    earnestMoney,
    paymentMethod = 'Cash or equivalent good funds at closing',
    acceptanceDate = new Date(),
    closingDate,
    additionalTerms = [],
    propertyImage
  } = params;

  // Determine if this is a purchase or rental contract
  const isPurchase = contractType === ContractType.PURCHASE;
  const isRental = contractType === ContractType.RENTAL || contractType === ContractType.VACATION_RENTAL;

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date: any): string => {
    if (!date) return '_______________';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get party information based on contract type
  const getPartyInfo = () => {
    if (isPurchase) {
      return {
        party1Label: 'VENDEUR',
        party1Name: seller?.fullName || '_______________',
        party1Role: 'Seller',
        party2Label: 'ACHETEUR',
        party2Name: buyer?.fullName || '_______________',
        party2Role: 'Buyer'
      };
    }
    return {
      party1Label: 'BAILLEUR',
      party1Name: landlord?.fullName || '_______________',
      party1Role: 'Landlord',
      party2Label: 'LOCATAIRE',
      party2Name: tenant?.fullName || '_______________',
      party2Role: 'Tenant'
    };
  };

  const partyInfo = getPartyInfo();

  // Calculate amounts
  const price = isPurchase
    ? (purchasePrice || property.depositAmount * 100 || 0)
    : (reservation.monthlyRent || 0);

  const deposit = isPurchase
    ? (earnestMoney || price * 0.1)
    : (property.depositAmount || reservation.monthlyRent * 2);

  // Determine agreement title
  const agreementTitle = isPurchase
    ? 'CONTRAT D\'ACHAT ET DE VENTE DE BIENS IMMOBILIERS'
    : 'CONTRAT DE BAIL D\'HABITATION';

  const agreementSubtitle = isPurchase
    ? 'Residential Real Property Purchase and Sale Agreement'
    : 'Residential Lease Agreement';

  // Generate the HTML
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${agreementTitle} - ${contractId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary-green: #1B5E20;
      --primary-green-light: #2E7D32;
      --accent-green: #4CAF50;
      --dark-text: #1a1a1a;
      --medium-text: #333333;
      --light-text: #666666;
      --border-color: #e0e0e0;
      --bg-light: #f8f9fa;
      --bg-highlight: #E8F5E9;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: var(--dark-text);
      background: white;
      padding: 0;
      margin: 0;
    }

    .contract-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      position: relative;
      overflow: hidden;
    }

    /* Header Banner */
    .header-banner {
      background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-light) 100%);
      color: white;
      padding: 20px 30px;
      text-align: center;
    }

    .header-banner h1 {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .header-banner p {
      font-size: 10px;
      opacity: 0.9;
      font-weight: 300;
    }

    /* Main Content */
    .main-content {
      padding: 20px 30px;
    }

    /* Agreement Type */
    .agreement-type {
      background: var(--bg-highlight);
      border-left: 4px solid var(--accent-green);
      padding: 12px 16px;
      margin-bottom: 20px;
    }

    .agreement-type h2 {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary-green);
      margin-bottom: 2px;
    }

    .agreement-type p {
      font-size: 9px;
      color: var(--light-text);
    }

    /* Two Column Layout */
    .two-column {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .column {
      flex: 1;
    }

    /* Section Styling */
    .section {
      margin-bottom: 16px;
    }

    .section-header {
      background: var(--primary-green);
      color: white;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }

    .section-content {
      padding: 0 4px;
    }

    /* Form Fields */
    .form-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 8px;
      font-size: 10px;
    }

    .form-label {
      font-weight: 500;
      color: var(--medium-text);
      min-width: 100px;
    }

    .form-value {
      flex: 1;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 2px;
      font-weight: 600;
      color: var(--dark-text);
    }

    /* Property Card */
    .property-card {
      background: var(--bg-light);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .property-image {
      width: 100%;
      height: 100px;
      object-fit: cover;
      background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--light-text);
      font-size: 24px;
    }

    .property-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .property-details-grid {
      padding: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .property-detail-item {
      font-size: 9px;
    }

    .property-detail-item .label {
      color: var(--light-text);
      display: block;
    }

    .property-detail-item .value {
      font-weight: 600;
      color: var(--dark-text);
    }

    /* Deal Details */
    .deal-section {
      background: linear-gradient(135deg, var(--bg-highlight) 0%, white 100%);
      border: 2px solid var(--accent-green);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .deal-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .deal-icon {
      width: 32px;
      height: 32px;
      background: var(--accent-green);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      margin-right: 10px;
    }

    .deal-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-green);
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed var(--border-color);
    }

    .price-row:last-child {
      border-bottom: none;
    }

    .price-label {
      font-size: 10px;
      color: var(--medium-text);
    }

    .price-value {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-green);
    }

    .price-main {
      font-size: 18px;
      color: var(--primary-green);
    }

    /* Signature Section */
    .signature-section {
      margin-top: 20px;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .signature-box {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      background: var(--bg-light);
    }

    .signature-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }

    .signature-role {
      font-size: 10px;
      font-weight: 600;
      color: var(--primary-green);
      text-transform: uppercase;
    }

    .signature-status {
      font-size: 8px;
      padding: 2px 8px;
      border-radius: 10px;
      background: #FFF3E0;
      color: #E65100;
    }

    .signature-status.accepted {
      background: var(--bg-highlight);
      color: var(--primary-green);
    }

    .signature-name {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .signature-date {
      font-size: 9px;
      color: var(--light-text);
      margin-bottom: 8px;
    }

    .signature-line {
      height: 40px;
      border: 1px dashed var(--border-color);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--light-text);
      font-size: 9px;
      background: white;
    }

    /* QR Code Section */
    .qr-section {
      position: absolute;
      bottom: 20px;
      right: 30px;
      text-align: center;
    }

    .qr-code {
      width: 60px;
      height: 60px;
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 4px;
      margin-bottom: 4px;
    }

    .qr-code svg {
      width: 100%;
      height: 100%;
    }

    .qr-label {
      font-size: 7px;
      color: var(--light-text);
    }

    /* Footer */
    .contract-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--bg-light);
      padding: 10px 30px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-left {
      font-size: 8px;
      color: var(--light-text);
    }

    .footer-right {
      font-size: 8px;
      color: var(--light-text);
    }

    .contract-id {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: var(--primary-green);
    }

    /* Checkbox styling */
    .checkbox-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      font-size: 9px;
    }

    .checkbox {
      width: 12px;
      height: 12px;
      border: 1px solid var(--border-color);
      border-radius: 2px;
      margin-right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .checkbox.checked {
      background: var(--accent-green);
      border-color: var(--accent-green);
      color: white;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60px;
      font-weight: 800;
      color: rgba(0, 0, 0, 0.03);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
    }

    /* Print styles */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .contract-page {
        width: 100%;
        height: 100%;
        page-break-after: always;
      }
    }

    /* Terms section */
    .terms-list {
      font-size: 9px;
      padding-left: 16px;
      color: var(--medium-text);
    }

    .terms-list li {
      margin-bottom: 4px;
    }

    /* Offer status */
    .offer-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 600;
    }

    .offer-status.pending {
      background: #FFF3E0;
      color: #E65100;
    }

    .offer-status.accepted {
      background: var(--bg-highlight);
      color: var(--primary-green);
    }

    .offer-status.rejected {
      background: #FFEBEE;
      color: #C62828;
    }
  </style>
</head>
<body>
  <div class="contract-page">
    <!-- Watermark -->
    <div class="watermark">CONTRAT OFFICIEL</div>

    <!-- Header Banner -->
    <div class="header-banner">
      <h1>${agreementTitle}</h1>
      <p>${agreementSubtitle}</p>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Agreement Type Info -->
      <div class="agreement-type">
        <h2>${isPurchase ? 'SALE AND PURCHASE AGREEMENT' : 'BAIL D\'HABITATION - RESIDENCE PRINCIPALE'}</h2>
        <p>Ce document constitue ${isPurchase ? 'un contrat de vente' : 'un contrat de bail'} entre l'acheteur et le vendeur pour la propriété résidentielle identifiée ci-dessous.</p>
      </div>

      <!-- Two Column Layout -->
      <div class="two-column">
        <!-- Left Column - Parties -->
        <div class="column">
          <div class="section">
            <div class="section-header">${partyInfo.party1Label} & ${partyInfo.party2Label}</div>
            <div class="section-content">
              <div class="form-row">
                <span class="form-label">${partyInfo.party1Role} Name:</span>
                <span class="form-value">${partyInfo.party1Name}</span>
              </div>
              <div class="form-row">
                <span class="form-label">${partyInfo.party2Role} Name:</span>
                <span class="form-value">${partyInfo.party2Name}</span>
              </div>
            </div>
          </div>

          <!-- Property Details -->
          <div class="section">
            <div class="section-header">PROPERTY DETAILS</div>
            <div class="property-card">
              <div class="property-image">
                ${propertyImage
                  ? `<img src="${propertyImage}" alt="Property" />`
                  : '<span>&#127968;</span>'
                }
              </div>
              <div class="property-details-grid">
                <div class="property-detail-item">
                  <span class="label">Address</span>
                  <span class="value">${property.address || 'N/A'}</span>
                </div>
                <div class="property-detail-item">
                  <span class="label">Type</span>
                  <span class="value">${property.type || 'Residential'}</span>
                </div>
                <div class="property-detail-item">
                  <span class="label">Surface</span>
                  <span class="value">${property.surface || 0} m²</span>
                </div>
                <div class="property-detail-item">
                  <span class="label">Rooms</span>
                  <span class="value">${property.rooms || 0} pièces</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Deal Details -->
        <div class="column">
          <div class="deal-section">
            <div class="deal-header">
              <div class="deal-icon">${isPurchase ? '&#128176;' : '&#127968;'}</div>
              <div class="deal-title">${isPurchase ? 'DEAL DETAILS' : 'TERMS OF LEASE'}</div>
            </div>

            <div class="price-row">
              <span class="price-label">${isPurchase ? 'PURCHASE PRICE' : 'MONTHLY RENT'}:</span>
              <span class="price-value price-main">${formatCurrency(price)}</span>
            </div>

            <div class="price-row">
              <span class="price-label">${isPurchase ? 'EARNEST MONEY' : 'SECURITY DEPOSIT'}:</span>
              <span class="price-value">${formatCurrency(deposit)}</span>
            </div>

            ${isPurchase ? `
            <div class="price-row">
              <span class="price-label">Payment Method:</span>
              <span class="price-value" style="font-size: 10px;">${paymentMethod}</span>
            </div>
            ` : `
            <div class="price-row">
              <span class="price-label">Lease Start:</span>
              <span class="price-value" style="font-size: 10px;">${formatDate(reservation.startDate)}</span>
            </div>
            <div class="price-row">
              <span class="price-label">Lease End:</span>
              <span class="price-value" style="font-size: 10px;">${formatDate(reservation.endDate)}</span>
            </div>
            `}
          </div>

          <!-- Terms & Conditions -->
          <div class="section">
            <div class="section-header">TERMS & CONDITIONS</div>
            <div class="section-content">
              <ul class="terms-list">
                ${isPurchase ? `
                <li>Buyer agrees to purchase the property at the stated price</li>
                <li>Earnest money to be held in escrow until closing</li>
                <li>Closing to occur within ${closingDate ? 'specified date' : '30 days'}</li>
                <li>Property sold "as-is" unless otherwise specified</li>
                ` : `
                <li>Tenant agrees to pay rent on the 1st of each month</li>
                <li>Security deposit refundable upon lease termination</li>
                <li>Tenant responsible for utilities unless specified</li>
                <li>No subletting without written landlord consent</li>
                `}
                ${additionalTerms.map(term => `<li>${term}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Signature Section -->
      <div class="signature-section">
        <div class="section-header">SIGNATURE</div>
        <div class="signature-grid">
          <!-- Party 1 Signature -->
          <div class="signature-box">
            <div class="signature-header">
              <span class="signature-role">${partyInfo.party1Role} Signature</span>
              <span class="signature-status">Pending</span>
            </div>
            <div class="signature-name">${partyInfo.party1Name}</div>
            <div class="signature-date">Date & Time: ${formatDate(acceptanceDate)}</div>
            <div class="signature-line">Sign here</div>
          </div>

          <!-- Party 2 Signature -->
          <div class="signature-box">
            <div class="signature-header">
              <span class="signature-role">${partyInfo.party2Role} Signature</span>
              <span class="signature-status">Pending</span>
            </div>
            <div class="signature-name">${partyInfo.party2Name}</div>
            <div class="signature-date">Date & Time: _______________</div>
            <div class="signature-line">Sign here</div>
          </div>
        </div>

        <!-- Offer Status -->
        <div style="margin-top: 12px; display: flex; gap: 20px;">
          <div class="checkbox-row">
            <div class="checkbox">&#10003;</div>
            <span>This offer is: </span>
            <span class="offer-status pending">Pending Acceptance</span>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code -->
    <div class="qr-section">
      <div class="qr-code">
        ${qrCodeSVG || '<svg viewBox="0 0 100 100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50" y="55" text-anchor="middle" font-size="8">QR</text></svg>'}
      </div>
      <div class="qr-label">Scan to verify</div>
    </div>

    <!-- Footer -->
    <div class="contract-footer">
      <div class="footer-left">
        <span>Document generated on ${formatDate(new Date())}</span>
      </div>
      <div class="footer-right">
        <span>Contract ID: </span>
        <span class="contract-id">${contractId}</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export default generateProfessionalContractHTML;
