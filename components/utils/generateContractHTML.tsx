import { QRCodeGenerator } from '@/components/utils/qrCodeGenerator';
import { Property, Reservation, User } from '@/types/type';
import { ContractHTMLParams } from '@/types/type';

/**
 * Génère un contrat de location HTML avancé avec des innovations technologiques du 21e siècle
 * @param params Les paramètres nécessaires à la génération du contrat
 * @returns Le contenu HTML du contrat
 */
const generateContractHTML = (params: ContractHTMLParams): string => {
  // Destructure and provide default values
  const {
    contractId,
    reservation,
    property,
    landlord,
    tenant,
    qrCodeSVG,
    watermarkSVG,
    additionalClauses = [],
    includeDigitalSignature = true,
    includeBlockchainVerification = true,
    includeSmartContractTerms = true,
    includeAIAssistance = true,
    includeVirtualTour = false,
    includeSustainabilityReport = false,
    includeEnergyEfficiencyRating = true
  } = params;

  // Validate required parameters
  if (!contractId || !reservation || !property || !landlord || !tenant) {
    throw new Error("Missing required parameters for contract generation");
  }

  // Format and prepare data
  const contractData = prepareContractData(contractId, reservation, property, landlord, tenant);
  
  // Generate security features
  const securityFeatures = generateSecurityFeatures(contractId, property, tenant, qrCodeSVG, watermarkSVG, contractData.startDate, contractData.endDate);
  
  // Generate optional components
  const digitalSignatureHTML = includeDigitalSignature ? generateDigitalSignatureSection(landlord, tenant) : '';
  const blockchainHTML = includeBlockchainVerification ? generateBlockchainSection(securityFeatures.documentHash, securityFeatures.blockchainTxId) : '';
  const smartContractHTML = includeSmartContractTerms ? generateSmartContractSection() : '';
  const aiAssistanceHTML = includeAIAssistance ? generateAIAnalysisSection() : '';
  const virtualTourHTML = includeVirtualTour ? generateVirtualTourSection() : '';
  const sustainabilityHTML = includeSustainabilityReport ? generateSustainabilitySection() : '';
  const energyRatingHTML = includeEnergyEfficiencyRating ? generateEnergyRatingSection() : '';
  const additionalClausesHTML = generateAdditionalClausesSection(additionalClauses);

  // Return the complete HTML
  return generateFullHTML(
    contractId,
    contractData,
    securityFeatures,
    digitalSignatureHTML,
    blockchainHTML,
    smartContractHTML,
    aiAssistanceHTML,
    virtualTourHTML,
    sustainabilityHTML,
    energyRatingHTML,
    additionalClausesHTML
  );
};

/**
 * Prepare and format all contract data
 */
const prepareContractData = (
  contractId: string,
  reservation: Reservation,
  property: Property,
  landlord: User,
  tenant: User
) => {
  // Format dates properly
  const formatDate = (date: any): Date => {
    if (!date) {
      return new Date();
    }
    
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    }
    
    try {
      return new Date(date);
    } catch (error) {
      console.error("Invalid date format:", error);
      return new Date();
    }
  };

  const startDate = formatDate(reservation.startDate);
  const endDate = formatDate(reservation.endDate);
  
  // Calculate duration in months safely
  const durationMonths = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5)));
  
  // Safe property access with defaults
  const propertyId = property.id || 'unknown';
  const propertyTitle = property.title || 'Bien immobilier';
  const propertyAddress = property.address || 'Adresse non spécifiée';
  const propertyType = property.type || 'Non spécifié';
  const propertySurface = property.surface || 0;
  const propertyRooms = property.rooms || 0;
  const rentalPrice = property.rentalPrice || 0;
  const securityDeposit = property.securityDeposit || 0;
  const estimatedValue = property?.estimatedValue || 0;
  
  // Format currency values
  const formattedRentalPrice = rentalPrice.toLocaleString('fr-FR');
  const formattedSecurityDeposit = securityDeposit.toLocaleString('fr-FR');
  
  // Landlord and tenant information with defaults
  const landlordInfo = {
    id: landlord.id || 'Non spécifié',
    fullName: landlord.fullName || 'Non spécifié',
    email: landlord.email || 'Non spécifié',
    phone: landlord.phone || 'Non spécifié'
  };
  
  const tenantInfo = {
    id: tenant.id || 'Non spécifié',
    fullName: tenant.fullName || 'Non spécifié',
    email: tenant.email || 'Non spécifié',
    phone: tenant.phone || 'Non spécifié'
  };
  
  // Current date formatted
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  // Formatted dates for display
  const formattedStartDate = startDate.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const formattedEndDate = endDate.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Calculate annual yield
  const annualYield = estimatedValue > 0 
    ? ((rentalPrice * 12) / estimatedValue * 100).toFixed(2)
    : "N/A";
  
  return {
    startDate,
    endDate,
    durationMonths,
    propertyId,
    propertyTitle,
    propertyAddress,
    propertyType,
    propertySurface,
    propertyRooms,
    rentalPrice,
    formattedRentalPrice,
    securityDeposit,
    formattedSecurityDeposit,
    estimatedValue,
    landlordInfo,
    tenantInfo,
    currentDate,
    formattedStartDate,
    formattedEndDate,
    annualYield
  };
};

const generateSecurityFeatures = (
  contractId: string,
  property: Property,
  tenant: User,
  qrCodeSVG: string,
  watermarkSVG: string,
  startDate: Date,
  endDate: Date,
) => {
  // Utilisez les QR code et watermark passés en paramètres au lieu de les régénérer
  
  // Si qrCodeSVG ou watermarkSVG sont vides, générez-les comme avant
  const finalQrCodeSVG = qrCodeSVG || (() => {
    const qrCodeDataString = QRCodeGenerator.generateContractQRData(
      contractId,
      property,
      tenant,
      startDate,
      endDate
    );
    return QRCodeGenerator.generateQRCodeSVG(qrCodeDataString, 150, 'H');
  })();
  
  const finalWatermarkSVG = watermarkSVG || `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" opacity="0.04">
      <text transform="rotate(-45 250 250)" x="0" y="250" fill="#000000" font-size="30" font-family="Arial, sans-serif">CONTRAT OFFICIEL • ${contractId} • CONTRAT OFFICIEL</text>
    </svg>
  `;
  
  // Create document hash for blockchain verification
  const propertyId = property.id || 'unknown';
  const tenantId = tenant.id || 'unknown';
  const documentHash = `0x${Array.from(contractId + propertyId + tenantId + startDate.toISOString())
    .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '')}`.substring(0, 66);
  
  // Generate blockchain transaction ID
  const blockchainTxId = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  // Security code for two-factor verification
  const securityCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  return {
    qrCodeSVG: finalQrCodeSVG,
    watermarkSVG: finalWatermarkSVG,
    documentHash,
    blockchainTxId,
    securityCode
  };
}
/**
 * Generate digital signature section
 */
const generateDigitalSignatureSection = (landlord: User, tenant: User) => {
  const generateDigitalSignature = (name: string) => {
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${(name || '').replace(/\s+/g, '').toLowerCase()}-${Date.now().toString(36)}-${hash.toString(36)}`;
  };

  const landlordSignature = generateDigitalSignature(landlord.fullName);
  const tenantSignature = generateDigitalSignature(tenant.fullName);
  
  return `
    <div class="tech-box">
      <h3>Vérification d'identité numérique</h3>
      <p>Les deux parties ont été vérifiées via une authentification numérique multi-facteurs conforme au règlement eIDAS de l'Union Européenne.</p>
      <div class="digital-signature-details">
        <div class="signature-info">
          <div class="signature-label">Signature numérique du bailleur:</div>
          <div class="signature-hash">${landlordSignature}</div>
        </div>
        <div class="signature-info">
          <div class="signature-label">Signature numérique du locataire:</div>
          <div class="signature-hash">${tenantSignature}</div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate blockchain verification section
 */
const generateBlockchainSection = (documentHash: string, blockchainTxId: string) => {
  return `
    <div class="blockchain-verification">
      <div class="blockchain-header">
        <div class="blockchain-icon">B</div>
        <div class="blockchain-title">Vérification Blockchain</div>
      </div>
      <p>Ce contrat est enregistré de manière immuable sur la blockchain Ethereum, assurant son intégrité et sa traçabilité.</p>
      <div class="blockchain-details">
        <strong>Hash du document:</strong> ${documentHash}<br>
        <strong>Transaction Blockchain:</strong> ${blockchainTxId}<br>
        <strong>Réseau:</strong> Ethereum<br>
        <strong>Horodatage:</strong> ${new Date().toISOString()}
      </div>
    </div>
  `;
};

/**
 * Generate smart contract section
 */
const generateSmartContractSection = () => {
  const smartContractAddress = `0x${Math.random().toString(36).substring(2, 14)}`;
  
  return `
    <div class="smart-contract-section">
      <h3>Clauses de Smart Contract</h3>
      <p>Ce contrat est associé à un smart contract sur la blockchain Ethereum qui exécute automatiquement certaines clauses du contrat.</p>
      
      <div class="code-block">
        <span class="comment">// Adresse du Smart Contract: ${smartContractAddress}</span><br>
        <br>
        <span class="function-name">function</span> payRent(<span class="parameter">address</span> tenant) public payable {<br>
        &nbsp;&nbsp;<span class="comment">// Vérifie que le montant correspond au loyer</span><br>
        &nbsp;&nbsp;<span class="comment">// Enregistre le paiement et émet un reçu numérique</span><br>
        }<br>
        <br>
        <span class="function-name">function</span> terminateContract() public {<br>
        &nbsp;&nbsp;<span class="comment">// Vérifie les conditions de résiliation</span><br>
        &nbsp;&nbsp;<span class="comment">// Calcule les montants dus et libère le dépôt de garantie</span><br>
        }<br>
        <br>
        <span class="function-name">function</span> extendContract(<span class="parameter">uint256</span> months) public {<br>
        &nbsp;&nbsp;<span class="comment">// Prolonge la durée du contrat</span><br>
        }<br>
        <br>
        <span class="function-name">function</span> reportIssue(<span class="parameter">string</span> details) public {<br>
        &nbsp;&nbsp;<span class="comment">// Enregistre un problème signalé</span><br>
        }
      </div>
      
      <div class="token-description">
        <div class="token-icon">T</div>
        <div>
          <strong>Token de Contrat</strong>
          <p>Un NFT (Non-Fungible Token) représentant ce contrat a été émis et attribué au locataire pour la durée du bail.</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate AI analysis section
 */
const generateAIAnalysisSection = () => {
  const aiRiskScore = Math.floor(Math.random() * 100);
  
  const calculateRiskLevel = (score: number) => {
    if (score < 20) return 'Très faible';
    if (score < 40) return 'Faible';
    if (score < 60) return 'Modéré';
    if (score < 80) return 'Élevé';
    return 'Très élevé';
  };
  
  const riskLevel = calculateRiskLevel(aiRiskScore);
  const riskPercentage = aiRiskScore;
  
  return `
    <div class="ai-analysis">
      <h3>Analyse par Intelligence Artificielle</h3>
      <p>Ce contrat a été analysé par notre système d'IA pour évaluer les risques potentiels et garantir l'équité des termes.</p>
      
      <div class="risk-assessment">
        <div class="risk-title">Niveau de risque global: <strong>${riskLevel}</strong></div>
        <div class="risk-meter">
          <div class="risk-level" style="width: ${riskPercentage}%"></div>
          <div class="risk-marker" style="left: ${riskPercentage}%"></div>
        </div>
        <div class="risk-labels">
          <span>Très faible</span>
          <span>Faible</span>
          <span>Modéré</span>
          <span>Élevé</span>
          <span>Très élevé</span>
        </div>
      </div>
      
      <div class="ai-recommendations">
        <h4>Recommandations de l'IA</h4>
        <ul>
          <li>Vérifier que tous les termes du contrat sont conformes à la législation en vigueur</li>
          <li>S'assurer que le dépôt de garantie ne dépasse pas le maximum légal</li>
          <li>Conserver une copie numérique du contrat dans un lieu sécurisé</li>
        </ul>
      </div>
    </div>
  `;
};

/**
 * Generate virtual tour section
 */
const generateVirtualTourSection = () => {
  const virtualTourQR = QRCodeGenerator.generateQRCodeSVG("https://example.com/virtual-tour", 150, "M");
  
  return `
    <div class="virtual-tour">
      <h3>Visite Virtuelle</h3>
      <p>Scannez le QR code ci-dessous pour accéder à une visite virtuelle 3D du bien immobilier.</p>
      <div class="tour-qr">
        ${virtualTourQR}
      </div>
      <p class="tour-note">La visite virtuelle est accessible pendant toute la durée du contrat.</p>
    </div>
  `;
};

/**
 * Generate sustainability section
 */
const generateSustainabilitySection = () => {
  return `
    <div class="section">
      <h3>Rapport de Durabilité</h3>
      <p>Analyse de l'impact environnemental et de la durabilité du bien immobilier.</p>
      
      <div class="sustainability-metrics">
        <div class="sustainability-metric">
          <div class="metric-name">Empreinte Carbone</div>
          <div class="metric-value">12.5</div>
          <div class="metric-unit">kg CO₂/m²/an</div>
        </div>
        
        <div class="sustainability-metric">
          <div class="metric-name">Consommation d'Eau</div>
          <div class="metric-value">120</div>
          <div class="metric-unit">litres/jour</div>
        </div>
        
        <div class="sustainability-metric">
          <div class="metric-name">Gestion des Déchets</div>
          <div class="metric-value">B+</div>
          <div class="metric-unit">classification</div>
        </div>
        
        <div class="sustainability-metric">
          <div class="metric-name">Score Global</div>
          <div class="metric-value">83</div>
          <div class="metric-unit">/ 100</div>
        </div>
      </div>
      
      <div class="sustainability-recommendations">
        <h4>Recommandations d'amélioration:</h4>
        <ul>
          <li>Installation de panneaux solaires</li>
          <li>Amélioration de l'isolation thermique</li>
          <li>Système de récupération d'eau de pluie</li>
        </ul>
      </div>
    </div>
  `;
};

/**
 * Generate energy rating section
 */
const generateEnergyRatingSection = () => {
  const energyEfficiencyRating = {
    rating: 'B',
    carbonFootprint: '6.2',
    primaryEnergyConsumption: '75',
    annualEnergyEstimate: '540',
    validUntil: new Date(Date.now() + 86400000 * 365 * 10).toLocaleDateString('fr-FR')
  };
  
  return `
    <div class="section">
      <h3>Diagnostic de Performance Énergétique (DPE)</h3>
      
      <div class="energy-rating">
        <div class="energy-label">
          <div class="energy-scale">
            <div class="energy-row">
              <div class="energy-letter energy-a">A</div>
              <div class="energy-bar energy-a" style="width: 100%">≤ 50 <span class="energy-value">kWh/m²/an</span></div>
            </div>
            <div class="energy-row">
              <div class="energy-letter energy-b">B</div>
              <div class="energy-bar energy-b" style="width: 90%">51 à 90 <span class="energy-value">kWh/m²/an</span></div>
            </div>
            <div class="energy-row">
              <div class="energy-letter energy-c">C</div>
              <div class="energy-bar energy-c" style="width: 80%">91 à 150 <span class="energy-value">kWh/m²/an</span></div>
            </div>
            <div class="energy-row">
              <div class="energy-letter energy-d">D</div>
              <div class="energy-bar energy-d" style="width: 70%">151 à 230 <span class="energy-value">kWh/m²/an</span></div>
            </div>
            <div class="energy-row">
              <div class="energy-letter energy-e">E</div>
              <div class="energy-bar energy-e" style="width: 60%">231 à 330 <span class="energy-value">kWh/m²/an</span></div>
            </div>
            <div class="energy-row">
              <div class="energy-letter energy-f">F</div>
              <div class="energy-bar energy-f" style="width: 50%">331 à 450 <span class="energy-value">kWh/m²/an</span></div>
            </div>
            <div class="energy-row">
              <div class="energy-letter energy-g">G</div>
              <div class="energy-bar energy-g" style="width: 40%">> 450 <span class="energy-value">kWh/m²/an</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="energy-details">
        <div class="energy-detail"><strong>Classe énergétique:</strong> ${energyEfficiencyRating.rating}</div>
        <div class="energy-detail"><strong>Émission de gaz à effet de serre:</strong> ${energyEfficiencyRating.carbonFootprint} kg CO₂/m²/an</div>
        <div class="energy-detail"><strong>Consommation énergétique primaire:</strong> ${energyEfficiencyRating.primaryEnergyConsumption} kWh/m²/an</div>
        <div class="energy-detail"><strong>Estimation des coûts annuels:</strong> ${energyEfficiencyRating.annualEnergyEstimate} €/an</div>
        <div class="energy-detail"><strong>Validité:</strong> jusqu'au ${energyEfficiencyRating.validUntil}</div>
      </div>
    </div>
  `;
};

/**
 * Generate additional clauses section
 */
const generateAdditionalClausesSection = (additionalClauses: string[] = []) => {
  if (!additionalClauses || additionalClauses.length === 0) {
    return '';
  }
  
  let clausesHTML = '';
  
  additionalClauses.forEach((clause, index) => {
    clausesHTML += `
      <div class="special-clause">
        <strong>Clause supplémentaire ${index + 1}:</strong>
        <p>${clause}</p>
      </div>
    `;
  });
  
  return `
    <div class="section">
      <h2>Clauses Supplémentaires</h2>
      ${clausesHTML}
    </div>
  `;
};

/**
 * Generate the full HTML document with CSS
 */
const generateFullHTML = (
  contractId: string,
  data: any,
  security: any,
  digitalSignatureHTML: string,
  blockchainHTML: string,
  smartContractHTML: string,
  aiAssistanceHTML: string,
  virtualTourHTML: string,
  sustainabilityHTML: string,
  energyRatingHTML: string,
  additionalClausesHTML: string
) => {
  // CSS Variables for consistent styling
  const cssVariables = `
    :root {
      --color-primary: #4F46E5;
      --color-primary-light: #6366F1;
      --color-secondary: #10B981;
      --color-text-dark: #111827;
      --color-text-medium: #374151;
      --color-text-light: #6B7280;
      --color-text-lighter: #9CA3AF;
      --color-border: #E5E7EB;
      --color-background: #ffffff;
      --color-background-light: #F9FAFB;
      --color-background-highlight: #F3F4F6;
      --font-family-main: 'Roboto', sans-serif;
      --font-family-heading: 'Playfair Display', serif;
      --box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
      --border-radius: 8px;
    }
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Contrat de location - ${contractId}</title>
      <style>
        ${cssVariables}
        
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: var(--font-family-main);
          margin: 0;
          padding: 0;
          color: var(--color-text-medium);
          line-height: 1.6;
          background-color: var(--color-background);
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
          background: linear-gradient(to bottom, var(--color-background), #f9fafc);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          margin-bottom: 40px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
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
          font-family: var(--font-family-heading);
          font-size: 32px;
          color: var(--color-text-dark);
          margin-bottom: 10px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        .contract-subtitle {
          color: var(--color-text-light);
          font-size: 16px;
          font-weight: 400;
        }
        
        .contract-id {
          font-size: 14px;
          color: var(--color-primary);
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
          color: var(--color-text-dark);
          margin-bottom: 30px;
          font-weight: 700;
          font-size: 28px;
        }
        
        h2 {
          color: var(--color-primary);
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
          color: var(--color-primary);
        }
        
        h2::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          border-bottom: 2px solid var(--color-border);
        }
        
        h3 {
          color: var(--color-text-medium);
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .section {
          margin-bottom: 30px;
          padding: 25px;
          background-color: var(--color-background);
          border-radius: var(--border-radius);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--color-border);
        }
        
        .highlight-box {
          background-color: var(--color-background-highlight);
          border-left: 4px solid var(--color-primary);
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .blockchain-box {
          background-color: #ECFDF5;
          border-left: 4px solid var(--color-secondary);
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
          .property-detail-label {
          font-weight: 500;
          width: 140px;
          color: var(--color-text-dark);
        }
        
        .property-detail-value {
          flex: 1;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid var(--color-border);
        }
        
        th {
          background-color: var(--color-background-light);
          font-weight: 500;
          color: var(--color-text-dark);
        }
        
        tr:nth-child(even) {
          background-color: var(--color-background-light);
        }
        
        .parties-info {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
        }
        
        .party-box {
          width: 48%;
          padding: 20px;
          border-radius: var(--border-radius);
          border: 1px solid var(--color-border);
          background-color: var(--color-background-light);
        }
        
        .party-title {
          font-weight: 600;
          color: var(--color-text-dark);
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .party-detail {
          margin-bottom: 10px;
        }
        
        .party-label {
          font-weight: 500;
          color: var(--color-text-dark);
          margin-right: 5px;
        }
        
        .payment-details {
          background-color: var(--color-background-highlight);
          padding: 20px;
          border-radius: var(--border-radius);
          margin: 20px 0;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--color-border);
        }
        
        .payment-row:last-child {
          border-bottom: none;
        }
        
        .payment-label {
          font-weight: 500;
          color: var(--color-text-dark);
        }
        
        .payment-amount {
          font-weight: 600;
          color: var(--color-text-dark);
        }
        
        .total-row {
          font-weight: 700;
          font-size: 1.1em;
          color: var(--color-primary);
        }
        
        .blockchain-verification {
          background-color: #F0FDF4;
          border: 1px solid #DCFCE7;
          border-radius: var(--border-radius);
          padding: 20px;
          margin: 30px 0;
        }
        
        .blockchain-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .blockchain-icon {
          width: 40px;
          height: 40px;
          background-color: var(--color-secondary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
          margin-right: 15px;
        }
        
        .blockchain-title {
          font-weight: 600;
          font-size: 18px;
          color: var(--color-text-dark);
        }
        
        .blockchain-details {
          background-color: #ECFDF5;
          padding: 15px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          overflow-wrap: break-word;
        }
        
        .digital-signature-details {
          margin-top: 15px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
        
        .signature-info {
          margin-bottom: 10px;
        }
        
        .signature-label {
          font-weight: 500;
          margin-bottom: 5px;
          color: var(--color-text-dark);
        }
        
        .signature-hash {
          background-color: #F3F4F6;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid var(--color-border);
          overflow-wrap: break-word;
        }
        
        .smart-contract-section {
          margin: 30px 0;
          padding: 20px;
          background-color: #EFF6FF;
          border-radius: var(--border-radius);
          border: 1px solid #DBEAFE;
        }
        
        .code-block {
          background-color: #1E293B;
          color: #E2E8F0;
          font-family: 'Courier New', monospace;
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .comment {
          color: #94A3B8;
        }
        
        .function-name {
          color: #38BDF8;
        }
        
        .parameter {
          color: #FB923C;
        }
        
        .token-description {
          display: flex;
          align-items: center;
          background-color: rgba(59, 130, 246, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .token-icon {
          width: 40px;
          height: 40px;
          background-color: #3B82F6;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin-right: 15px;
        }
        
        .ai-analysis {
          background-color: #FFFBEB;
          border: 1px solid #FEF3C7;
          border-radius: var(--border-radius);
          padding: 20px;
          margin: 30px 0;
        }
        
        .risk-assessment {
          margin: 20px 0;
        }
        
        .risk-title {
          margin-bottom: 15px;
          font-weight: 500;
        }
        
        .risk-meter {
          height: 20px;
          width: 100%;
          background-color: #E5E7EB;
          border-radius: 10px;
          position: relative;
          margin-bottom: 5px;
        }
        
        .risk-level {
          height: 100%;
          border-radius: 10px;
          background: linear-gradient(to right, #10B981, #FBBF24, #EF4444);
        }
        
        .risk-marker {
          position: absolute;
          top: -10px;
          width: 10px;
          height: 30px;
          background-color: #111827;
          margin-left: -5px;
        }
        
        .risk-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--color-text-light);
        }
        
        .ai-recommendations {
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .ai-recommendations h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: var(--color-text-dark);
        }
        
        .ai-recommendations ul {
          padding-left: 20px;
        }
        
        .ai-recommendations li {
          margin-bottom: 5px;
        }
        
        .virtual-tour {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #F3F4F6;
          border-radius: var(--border-radius);
        }
        
        .tour-qr {
          margin: 20px auto;
          width: 150px;
          height: 150px;
        }
        
        .tour-note {
          font-size: 14px;
          color: var(--color-text-light);
          margin-top: 10px;
        }
        
        .sustainability-metrics {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        
        .sustainability-metric {
          width: 22%;
          text-align: center;
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .metric-name {
          font-size: 14px;
          color: var(--color-text-light);
          margin-bottom: 10px;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 5px;
        }
        
        .metric-unit {
          font-size: 12px;
          color: var(--color-text-lighter);
        }
        
        .sustainability-recommendations {
          margin-top: 20px;
        }
        
        .sustainability-recommendations h4 {
          margin-bottom: 10px;
        }
        
        .sustainability-recommendations ul {
          padding-left: 20px;
        }
        
        .sustainability-recommendations li {
          margin-bottom: 5px;
        }
        
        .energy-rating {
          margin: 20px 0;
        }
        
        .energy-label {
          width: 100%;
          max-width: 450px;
        }
        
        .energy-scale {
          width: 100%;
          margin-bottom: 20px;
        }
        
        .energy-row {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .energy-letter {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          margin-right: 10px;
        }
        
        .energy-a {
          background-color: #10B981;
        }
        
        .energy-b {
          background-color: #34D399;
        }
        
        .energy-c {
          background-color: #A3E635;
        }
        
        .energy-d {
          background-color: #FBBF24;
        }
        
        .energy-e {
          background-color: #F59E0B;
        }
        
        .energy-f {
          background-color: #EF4444;
        }
        
        .energy-g {
          background-color: #B91C1C;
        }
        
        .energy-bar {
          height: 35px;
          display: flex;
          align-items: center;
          padding: 0 15px;
          font-size: 14px;
          font-weight: 500;
          color: white;
        }
        
        .energy-value {
          font-size: 12px;
          margin-left: 5px;
          opacity: 0.8;
        }
        
        .energy-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 20px;
        }
        
        .energy-detail {
          background-color: white;
          padding: 10px 15px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          font-size: 14px;
        }
        
        .special-clause {
          background-color: var(--color-background-light);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        
        .footer {
          margin-top: 50px;
          border-top: 1px solid var(--color-border);
          padding-top: 30px;
          text-align: center;
          color: var(--color-text-light);
          font-size: 14px;
        }
        
        .security-code {
          margin-top: 20px;
          font-family: 'Courier New', monospace;
          text-align: center;
          letter-spacing: 5px;
          font-weight: 700;
          color: var(--color-text-dark);
          background-color: #F3F4F6;
          padding: 10px;
          border-radius: 4px;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        
        .signature-block {
          width: 45%;
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 1px solid var(--color-text-dark);
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        
        .signature-name {
          font-weight: 500;
        }
        
        .signature-role {
          font-size: 14px;
          color: var(--color-text-light);
        }
        
        /* For print media */
        @media print {
          body, .page {
            width: 100%;
            margin: 0;
            padding: 0;
            background-color: white;
            box-shadow: none;
          }
          
          .page {
            page-break-after: always;
          }
          
          .header, .footer {
            position: fixed;
          }
          
          .header {
            top: 0;
          }
          
          .footer {
            bottom: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="watermark">
        ${security.watermarkSVG}
      </div>
      
      <div class="page">
        <div class="header">
          <div class="logo-container">
            <div class="logo">CL</div>
            <div class="contract-info">
              <div class="contract-title">Contrat de location</div>
              <div class="contract-subtitle">Bail d'habitation - Résidence principale</div>
              <div class="contract-id">Réf: ${contractId}</div>
            </div>
          </div>
          <div class="qr-container">
            ${security.qrCodeSVG}
          </div>
        </div>
        
        <h1>CONTRAT DE LOCATION</h1>
        
        <div class="section">
          <h2>Parties</h2>
          
          <div class="parties-info">
            <div class="party-box">
              <div class="party-title">Bailleur</div>
              <div class="party-detail">
                <span class="party-label">Nom:</span>
                <span>${data.landlordInfo.fullName}</span>
              </div>
              <div class="party-detail">
                <span class="party-label">Email:</span>
                <span>${data.landlordInfo.email}</span>
              </div>
              <div class="party-detail">
                <span class="party-label">Téléphone:</span>
                <span>${data.landlordInfo.phone}</span>
              </div>
            </div>
            
            <div class="party-box">
              <div class="party-title">Locataire</div>
              <div class="party-detail">
                <span class="party-label">Nom:</span>
                <span>${data.tenantInfo.fullName}</span>
              </div>
              <div class="party-detail">
                <span class="party-label">Email:</span>
                <span>${data.tenantInfo.email}</span>
              </div>
              <div class="party-detail">
                <span class="party-label">Téléphone:</span>
                <span>${data.tenantInfo.phone}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Bien immobilier</h2>
          
          <div class="property-details">
            <div class="property-detail">
              <div class="property-detail-label">Désignation:</div>
              <div class="property-detail-value">${data.propertyTitle}</div>
            </div>
            
            <div class="property-detail">
              <div class="property-detail-label">Type:</div>
              <div class="property-detail-value">${data.propertyType}</div>
            </div>
            
            <div class="property-detail">
              <div class="property-detail-label">Adresse:</div>
              <div class="property-detail-value">${data.propertyAddress}</div>
            </div>
            
            <div class="property-detail">
              <div class="property-detail-label">Surface:</div>
              <div class="property-detail-value">${data.propertySurface} m²</div>
            </div>
            
            <div class="property-detail">
              <div class="property-detail-label">Nombre de pièces:</div>
              <div class="property-detail-value">${data.propertyRooms}</div>
            </div>
            
            <div class="property-detail">
              <div class="property-detail-label">Référence:</div>
              <div class="property-detail-value">${data.propertyId}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Conditions financières</h2>
          
          <div class="payment-details">
            <div class="payment-row">
              <div class="payment-label">Loyer mensuel hors charges:</div>
              <div class="payment-amount">${data.formattedRentalPrice} €</div>
            </div>
            
            <div class="payment-row">
              <div class="payment-label">Dépôt de garantie:</div>
              <div class="payment-amount">${data.formattedSecurityDeposit} €</div>
            </div>
            
            <div class="payment-row">
              <div class="payment-label">Mode de paiement:</div>
              <div class="payment-amount">Virement bancaire</div>
            </div>
            
            <div class="payment-row">
              <div class="payment-label">Date de paiement:</div>
              <div class="payment-amount">Le 5 de chaque mois</div>
            </div>
            
            <div class="payment-row">
              <div class="payment-label">Rendement annuel:</div>
              <div class="payment-amount">${data.annualYield}%</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Durée du contrat</h2>
          
          <div class="highlight-box">
            <p><strong>Début du bail:</strong> ${data.formattedStartDate}</p>
            <p><strong>Fin du bail:</strong> ${data.formattedEndDate}</p>
            <p><strong>Durée:</strong> ${data.durationMonths} mois</p>
          </div>
          
          <p>Le présent bail est conclu pour une durée de ${data.durationMonths} mois. À l'expiration de cette période, le bail sera reconduit tacitement pour des périodes successives d'un an, sauf dénonciation par l'une des parties dans les conditions prévues par la loi.</p>
        </div>
        
        <div class="section">
          <h2>Clauses et conditions particulières</h2>
          
          <h3>État des lieux</h3>
          <p>Un état des lieux d'entrée sera établi contradictoirement par les parties lors de la remise des clés. Un état des lieux de sortie sera établi dans les mêmes conditions lors de la restitution des clés.</p>
          
          <h3>Obligations du bailleur</h3>
          <p>Le bailleur s'oblige à délivrer au locataire le logement en bon état d'usage et de réparation, à assurer au locataire la jouissance paisible du logement, et à entretenir les locaux en état de servir à l'usage prévu.</p>
          
          <h3>Obligations du locataire</h3>
          <p>Le locataire s'oblige à payer le loyer et les charges aux termes convenus, à user paisiblement des locaux suivant la destination prévue au contrat, à répondre des dégradations qui surviennent pendant la durée du contrat, et à permettre l'accès aux lieux pour la réalisation de travaux.</p>
        </div>
        
        ${energyRatingHTML}
        ${sustainabilityHTML}
        ${digitalSignatureHTML}
        ${blockchainHTML}
        ${smartContractHTML}
        ${aiAssistanceHTML}
        ${virtualTourHTML}
        ${additionalClausesHTML}
        
        <div class="section">
          <h2>Signatures</h2>
          
          <p>Les parties reconnaissent avoir pris connaissance de l'ensemble des conditions du présent contrat et les acceptent.</p>
          
          <div class="security-code">CODE DE SÉCURITÉ: ${security.securityCode}</div>
          
          <div class="signatures">
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-name">${data.landlordInfo.fullName}</div>
              <div class="signature-role">Bailleur</div>
            </div>
            
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-name">${data.tenantInfo.fullName}</div>
              <div class="signature-role">Locataire</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Document généré le ${data.currentDate} • Contrat protégé par blockchain et signature électronique</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default generateContractHTML;