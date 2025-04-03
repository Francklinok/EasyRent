import { QRCodeGenerator } from '@/components/utils/qrCodeGenerator';
import { Property,Reservation, User } from '@/types/type';

/**
 * Génère un contrat de location HTML avancé avec des innovations technologiques du 21e siècle
 * @param params Les paramètres nécessaires à la génération du contrat
 * @returns Le contenu HTML du contrat
 */
const generateContractHTML = (params: {
  contractId: string;
  reservation: Reservation;
  property: Property;
  landlord: User;
  tenant: User;
  additionalClauses?: string[];
  includeDigitalSignature?: boolean;
  includeBlockchainVerification?: boolean;
  includeSmartContractTerms?: boolean;
  includeAIAssistance?: boolean;
  includeVirtualTour?: boolean;
  includeSustainabilityReport?: boolean;
  includeEnergyEfficiencyRating?: boolean;
}): string => {
  const {
    contractId,
    reservation,
    property,
    landlord,
    tenant,
    additionalClauses = [],
    includeDigitalSignature = true,
    includeBlockchainVerification = true,
    includeSmartContractTerms = true,
    includeAIAssistance = true,
    includeVirtualTour = false,
    includeSustainabilityReport = false,
    includeEnergyEfficiencyRating = true
  } = params;

  // Fonction pour formater les dates de manière cohérente
  const formatDate = (date: any): Date => {
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    }
    return new Date(date);
  };

  const startDate = formatDate(reservation.startDate);
  const endDate = formatDate(reservation.endDate);
  
  // Calculer la durée en mois
  const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
  
  // Génération du QR code avancé avec données cryptées
  const qrCodeData = {
    contractId,
    propertyId: property.id || '',
    propertyTitle: property.title,
    propertyAddress: property.address,
    tenantId: tenant.id || '',
    tenantName: tenant.fullName,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    timestamp: Date.now(),
    version: '2.0'
  };

  // Utilisation du service QR code avancé
  const qrCodeDataString = QRCodeGenerator.generateContractQRData(
    contractId,
    property,
    tenant,
    startDate,
    endDate
  );
  
  const qrCodeSVG = QRCodeGenerator.generateQRCodeSVG(qrCodeDataString, 150, 'H');
  
  // Générer un filigrane pour la sécurité du document
  const generateWatermarkSVG = () => {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" opacity="0.04">
        <text transform="rotate(-45 250 250)" x="0" y="250" fill="#000000" font-size="30" font-family="Arial, sans-serif">CONTRAT OFFICIEL • ${contractId} • CONTRAT OFFICIEL</text>
      </svg>
    `;
  };

  const watermarkSVG = generateWatermarkSVG();
  
  // Créer un hash du document pour vérification blockchain
  const documentHash = `0x${Array.from(contractId + property.id + tenant.id + startDate.toISOString())
    .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '')}`.substring(0, 66);
  
  // Générer un identifiant de transaction blockchain fictif
  const blockchainTxId = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  // Date courante formatée
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Créer un certificat énergétique
  const energyEfficiencyRating = {
    rating: 'B',
    carbonFootprint: '6.2',
    primaryEnergyConsumption: '75',
    annualEnergyEstimate: '540',
    validUntil: new Date(Date.now() + 86400000 * 365 * 10).toLocaleDateString('fr-FR')
  };

  // Calculer un score de risque d'IA
  const aiRiskScore = Math.floor(Math.random() * 100);
  const calculateRiskLevel = (score: number) => {
    if (score < 20) return 'Très faible';
    if (score < 40) return 'Faible';
    if (score < 60) return 'Modéré';
    if (score < 80) return 'Élevé';
    return 'Très élevé';
  };

  // Générer un code de sécurité pour la vérification en deux étapes
  const securityCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  // Créer une signature numérique fictive
  const generateDigitalSignature = (name: string) => {
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${name.replace(/\s+/g, '').toLowerCase()}-${Date.now().toString(36)}-${hash.toString(36)}`;
  };

  const landlordSignature = generateDigitalSignature(landlord.fullName);
  const tenantSignature = generateDigitalSignature(tenant.fullName);

  // Convertir le montant en texte
  const numberToWords = (num: number) => {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    if (num === 0) return 'zéro';
    
    const convert = (n: number): string => {
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        const digit = n % 10;
        if (n < 70 || n >= 80) {
          return tens[Math.floor(n / 10)] + (digit ? '-' + units[digit] : '');
        } else {
          return tens[6] + '-' + teens[digit];
        }
      }
      if (n < 1000) {
        const hundreds = Math.floor(n / 100);
        const remainder = n % 100;
        return (hundreds === 1 ? 'cent' : units[hundreds] + ' cent') + 
               (remainder ? ' ' + convert(remainder) : '');
      }
      if (n < 1000000) {
        const thousands = Math.floor(n / 1000);
        const remainder = n % 1000;
        return (thousands === 1 ? 'mille' : convert(thousands) + ' mille') + 
               (remainder ? ' ' + convert(remainder) : '');
      }
      return 'nombre trop grand';
    };
    
    return convert(Math.floor(num)) + ' euros';
  };

  // Rendement approximatif annuel
  const annualYield = ((reservation.monthlyRent * 12) / property.estimatedValue * 100).toFixed(2);

  // Détails du smart contract
  const smartContractDetails = {
    network: 'Ethereum',
    address: `0x${Math.random().toString(36).substring(2, 14)}`,
    functions: [
      { name: 'payRent()', description: 'Fonction permettant le paiement automatique du loyer' },
      { name: 'terminateContract()', description: 'Fonction permettant la résiliation du contrat' },
      { name: 'extendContract(uint256 months)', description: 'Fonction permettant de prolonger le contrat' },
      { name: 'reportIssue(string details)', description: 'Fonction permettant de signaler un problème' }
    ]
  };

  // HTML du contrat avec toutes les améliorations
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Contrat de location - ${contractId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
          color: #24292e;
          line-height: 1.6;
          background-color: #ffffff;
          position: relative;
          counter-reset: section;
        }
        
        .watermark {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
        }
        
        .page {
          width: 100%;
          max-width: 100%;
          padding: 40px 60px;
          position: relative;
          background: linear-gradient(to bottom, #ffffff, #f9fafc);
          border: 1px solid #e1e4e8;
          border-radius: 8px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          margin-bottom: 40px;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4F46E5, #6366F1);
          margin-right: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        }
        
        .contract-info {
          flex: 1;
        }
        
        .contract-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          color: #111827;
          margin-bottom: 10px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        .contract-subtitle {
          color: #6B7280;
          font-size: 16px;
          font-weight: 400;
        }
        
        .contract-id {
          font-size: 14px;
          color: #4F46E5;
          margin-top: 5px;
          font-weight: 500;
        }
        
        .qr-container {
          width: 150px;
          height: 150px;
          margin-left: 20px;
        }
        
        h1 {
          text-align: center;
          color: #1F2937;
          margin-bottom: 30px;
          font-weight: 700;
          font-size: 28px;
        }
        
        h2 {
          color: #4F46E5;
          font-size: 20px;
          font-weight: 600;
          margin-top: 40px;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 10px;
        }
        
        h2::before {
          counter-increment: section;
          content: counter(section) ".";
          margin-right: 8px;
          color: #4F46E5;
        }
        
        h2::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          border-bottom: 2px solid #E5E7EB;
        }
        
        h3 {
          color: #374151;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .section {
          margin-bottom: 30px;
          padding: 25px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #E5E7EB;
        }
        
        .highlight-box {
          background-color: #F3F4F6;
          border-left: 4px solid #4F46E5;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .blockchain-box {
          background-color: #ECFDF5;
          border-left: 4px solid #10B981;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .tech-box {
          background-color: #EFF6FF;
          border-left: 4px solid #3B82F6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .ai-box {
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .warning-box {
          background-color: #FEF2F2;
          border-left: 4px solid #EF4444;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .property-details {
          display: flex;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        
        .property-detail {
          width: 50%;
          padding: 10px 0;
          display: flex;
        }
        
        .property-detail-label {
          font-weight: 500;
          width: 180px;
          color: #4B5563;
        }
        
        .property-detail-value {
          color: #111827;
          font-weight: 400;
        }
        
        .party-info {
          padding: 20px;
          margin: 10px 0;
          background-color: #F9FAFB;
          border-radius: 6px;
        }
        
        .party-name {
          font-weight: 600;
          color: #111827;
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        .party-contact {
          margin-top: 5px;
          color: #4B5563;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        table, th, td {
          border: 1px solid #E5E7EB;
        }
        
        th {
          background-color: #F3F4F6;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
        }
        
        td {
          padding: 12px;
          color: #1F2937;
        }
        
        .signature-area {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          width: 45%;
          position: relative;
        }
        
        .signature-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 60px;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          margin-bottom: 5px;
        }
        
        .signature-name {
          font-weight: 500;
        }
        
        .signature-date {
          color: #6B7280;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .digital-signature {
          background-color: #F3F4F6;
          padding: 10px;
          margin-top: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
          word-break: break-all;
        }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
        
        .clause {
          margin-bottom: 15px;
        }
        
        .special-clause {
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        
        .official-seal {
          position: absolute;
          width: 120px;
          height: 120px;
          bottom: 40px;
          right: 60px;
          opacity: 0.7;
        }
        
        .legal-notice {
          font-size: 11px;
          color: #9CA3AF;
          margin-top: 30px;
          font-style: italic;
        }
        
        .holographic-effect {
          position: absolute;
          bottom: 100px;
          right: 50px;
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, transparent, rgba(99, 102, 241, 0.1), transparent);
          border-radius: 50%;
          pointer-events: none;
        }
        
        .page-number {
          position: absolute;
          bottom: 20px;
          right: 20px;
          color: #9CA3AF;
          font-size: 12px;
        }
        
        .security-ribbon {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 32px;
          height: 90px;
          background-color: #4F46E5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          writing-mode: vertical-rl;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          border-radius: 4px;
        }
        
        .blockchain-verification {
          padding: 15px;
          margin: 20px 0;
          background-color: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
        }
        
        .blockchain-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .blockchain-icon {
          width: 30px;
          height: 30px;
          margin-right: 10px;
          background-color: #4F46E5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        
        .blockchain-title {
          font-weight: 600;
          color: #111827;
        }
        
        .blockchain-details {
          font-family: monospace;
          background-color: #F3F4F6;
          padding: 10px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 10px;
          word-break: break-all;
        }
        
        .energy-rating {
          display: flex;
          margin: 20px 0;
        }
        
        .energy-label {
          display: flex;
          flex-direction: column;
          width: 300px;
        }
        
        .energy-scale {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        
        .energy-row {
          display: flex;
          height: 30px;
          margin: 2px 0;
          align-items: center;
        }
        
        .energy-letter {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          margin-right: 10px;
        }
        
        .energy-bar {
          height: 100%;
          display: flex;
          align-items: center;
          padding-left: 10px;
          color: white;
          font-weight: bold;
        }
        
        .energy-value {
          margin-left: 10px;
          font-weight: normal;
        }
        
        .energy-a { background-color: #1B874B; }
        .energy-b { background-color: #30A66D; }
        .energy-c { background-color: #75B842; }
        .energy-d { background-color: #EED146; }
        .energy-e { background-color: #F5B342; }
        .energy-f { background-color: #F28233; }
        .energy-g { background-color: #EF4444; }
        
        .energy-details {
          margin-top: 20px;
          font-size: 14px;
        }
        
        .energy-detail {
          margin-bottom: 10px;
        }
        
        .smart-contract-section {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .code-block {
          background-color: #1E293B;
          color: #E2E8F0;
          font-family: monospace;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 14px;
          margin: 15px 0;
        }
        
        .function-name {
          color: #38BDF8;
        }
        
        .parameter {
          color: #FCD34D;
        }
        
        .comment {
          color: #94A3B8;
        }
        
        .token-description {
          display: flex;
          align-items: center;
          margin: 15px 0;
          padding: 10px;
          background-color: #F1F5F9;
          border-radius: 4px;
        }
        
        .token-icon {
          width: 40px;
          height: 40px;
          background-color: #4F46E5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          margin-right: 15px;
        }
        
        .two-factor-auth {
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        
        .auth-code {
          font-family: monospace;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #1F2937;
          margin: 10px 0;
        }
        
        .expiration {
          font-size: 12px;
          color: #6B7280;
        }
        
        .ai-analysis {
          background-color: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .risk-meter {
          width: 100%;
          height: 30px;
          background-color: #E5E7EB;
          border-radius: 15px;
          margin: 15px 0;
          position: relative;
        }
        
        .risk-level {
          height: 100%;
          border-radius: 15px;
          background: linear-gradient(90deg, #10B981, #FBBF24, #EF4444);
        }
        
        .risk-marker {
          position: absolute;
          top: -10px;
          width: 10px;
          height: 50px;
          background-color: #000000;
          transform: translateX(-50%);
        }
        
        .risk-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          font-size: 12px;
        }
        
        .virtual-tour {
          text-align: center;
          margin: 20px 0;
          padding: 20px;
          background-color: #F3F4F6;
          border-radius: 8px;
        }
        
        .tour-qr {
          width: 150px;
          height: 150px;
          margin: 0 auto;
        }
        
        .sustainability-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin: 20px 0;
        }
        
        .sustainability-metric {
          flex: 1;
          min-width: 200px;
          padding: 15px;
          background-color: #F9FAFB;
          border-radius: 8px;
          text-align: center;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #4F46E5;
          margin: 10px 0;
        }
        
        .metric-name {
          font-size: 14px;
          color: #6B7280;
        }
        
        @media print {
          .page {
            box-shadow: none;
            border: none;
          }
          
          body {
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="watermark">
        ${watermarkSVG}
      </div>
      <div class="page">
        <div class="security-ribbon">DOCUMENT OFFICIEL</div>
        <div class="header">
          <div class="logo-container">
            <div class="logo">RL</div>
            <div class="contract-info">
              <div class="contract-title">Contrat de Location</div>
              <div class="contract-subtitle">Document officiel légalement contraignant</div>
              <div class="contract-id">ID: ${contractId}</div>
            </div>
          </div>
          <div class="qr-container">
            ${qrCodeSVG}
          </div>
        </div>
        
        <div class="section">
          <h2>Parties au Contrat</h2>
          
          <div class="party-info">
            <div class="party-name">LE BAILLEUR</div>
            <div class="party-contact"><strong>${landlord.fullName}</strong></div>
            <div class="party-contact">Email: ${landlord.email}</div>
            <div class="party-contact">Téléphone: ${landlord.phone}</div>
            <div class="party-contact">ID Numérique: ${landlord.id || 'Non spécifié'}</div>
            <div class="party-contact">Ci-après dénommé "LE BAILLEUR"</div>
          </div>
          
          <div class="party-info">
            <div class="party-name">LE LOCATAIRE</div>
            <div class="party-contact"><strong>${tenant.fullName}</strong></div>
            <div class="party-contact">Email: ${tenant.email}</div>
            <div class="party-contact">Téléphone: ${tenant.phone}</div>
            <div class="party-contact">ID Numérique: ${tenant.id || 'Non spécifié'}</div>
            <div class="party-contact">Ci-après dénommé "LE LOCATAIRE"</div>
          </div>
          
          ${includeDigitalSignature ? `
          <div class="tech-box">
            <h3>Vérification d'identité numérique</h3>
            <p>Les deux parties ont été vérifiées via une authentification numérique multi-facteurs conforme au règlement eIDAS de l'Union Européenne.</p>
          </div>
          ` : ''}
        </div>
        
        <div class="section">
          <h2>Bien Immobilier</h2>
          
          <div class="highlight-box">
            <strong>${property.title}</strong><br>
            ${property.address}
          </div>
          
          <div class="property-details">
            <div class="property-detail">
              <span class="property-detail-label">Type de bien:</span>
              <span class="property-detail-value">${property.type}</span>
            </div>
            <div class="property-detail">
              <span class="property-detail-label">Surface:</span>
              <span class="property-detail-value">${property.surface} m²</span>
            </div>
            <div class="property-detail">
                <span class="property-detail-label">Type de bien:</span>
                <span class="property-detail-value">${property.type}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Nombre de pièces:</span>
                <span class="property-detail-value">${property.rooms}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Durée et conditions</h2>
            
            <div class="property-details">
              <div class="property-detail">
                <span class="property-detail-label">Date de début:</span>
                <span class="property-detail-value">${startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Date de fin:</span>
                <span class="property-detail-value">${endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Durée:</span>
                <span class="property-detail-value">${durationMonths} mois</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Loyer mensuel:</span>
                <span class="property-detail-value">${property.rentalPrice.toLocaleString('fr-FR')} €</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Dépôt de garantie:</span>
                <span class="property-detail-value">${property.securityDeposit.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
            
            <h3>Paiements</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Montant</th>
                  <th>Échéance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Premier loyer</td>
                  <td>${property.rentalPrice.toLocaleString('fr-FR')} €</td>
                  <td>À la signature</td>
                </tr>
                <tr>
                  <td>Dépôt de garantie</td>
                  <td>${property.securityDeposit.toLocaleString('fr-FR')} €</td>
                  <td>À la signature</td>
                </tr>
                <tr>
                  <td>Loyers suivants</td>
                  <td>${property.rentalPrice.toLocaleString('fr-FR')} €</td>
                  <td>1er du mois</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Conditions générales</h2>
            
            <h3>État des lieux</h3>
            <p>Un état des lieux d'entrée sera effectué le jour de la remise des clés. Un état des lieux de sortie sera réalisé à la fin de la période de location.</p>
            
            <h3>Obligations du locataire</h3>
            <p>Le locataire s'engage à:</p>
            <ul>
              <li>Payer le loyer et les charges à la date convenue</li>
              <li>User paisiblement du logement</li>
              <li>Répondre des dégradations qui surviennent pendant la durée du contrat</li>
              <li>Prendre à sa charge l'entretien courant du logement et des équipements</li>
              <li>Souscrire une assurance habitation</li>
            </ul>
            
            <h3>Obligations du bailleur</h3>
            <p>Le bailleur s'engage à:</p>
            <ul>
              <li>Délivrer un logement décent en bon état d'usage et de réparation</li>
              <li>Assurer au locataire la jouissance paisible du logement</li>
              <li>Entretenir les locaux en état de servir à l'usage prévu</li>
              <li>Maintenir les équipements mentionnés au contrat en bon état de fonctionnement</li>
            </ul>
          </div>
          
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-title">Signature du bailleur</div>
              <div class="signature-line"></div>
              <div class="signature-date">Fait à _________________ le ${currentDate}</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">Signature du locataire</div>
              <div class="signature-line"></div>
              <div class="signature-date">Fait à _________________ le ${currentDate}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Ce contrat est établi en deux exemplaires originaux.</p>
            <p>Document généré le ${currentDate} - Référence: ${contractId}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
export default generateContractHTML;
            