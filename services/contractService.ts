import {
  ContractTemplate,
  ContractData,
  ContractType,
  ContractStatus,
  ContractGenerationRequest,
  ContractSigningRequest,
  PartyRole
} from '@/types/contract';
import generateContractHTML from '@/components/utils/generateContractHTML';
import generateAdvancedQRCode from '@/components/contract/utilsgeneratecodeQr';
import generateWatermark from '@/components/utils/generateWatermark';
import * as Print from 'expo-print';

class ContractService {
  private static instance: ContractService;
  private contracts: ContractData[] = [];
  private templates: ContractTemplate[] = [];

  private constructor() {
    this.initializeDefaultTemplates();
  }

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  private initializeDefaultTemplates() {
    this.templates = [
      {
        id: 'rental_template',
        type: ContractType.RENTAL,
        name: 'Contrat de Location Résidentielle',
        description: 'Contrat standard pour location résidentielle',
        template: this.getRentalTemplate(),
        variables: [
          { key: 'monthlyRent', label: 'Loyer mensuel', type: 'currency', required: true },
          { key: 'depositAmount', label: 'Dépôt de garantie', type: 'currency', required: true },
          { key: 'startDate', label: 'Date de début', type: 'date', required: true },
          { key: 'endDate', label: 'Date de fin', type: 'date', required: true },
          { key: 'charges', label: 'Charges mensuelles', type: 'currency', required: false },
          { key: 'surface', label: 'Surface du logement (m²)', type: 'number', required: true },
          { key: 'rooms', label: 'Nombre de pièces', type: 'number', required: true },
          { key: 'furnished', label: 'Logement meublé', type: 'boolean', required: false }
        ],
        legalClauses: [
          { id: '1', title: 'Durée du bail', content: 'Le présent bail est conclu pour une durée de...', isRequired: true, order: 1 },
          { id: '2', title: 'Loyer et charges', content: 'Le montant du loyer...', isRequired: true, order: 2 },
          { id: '3', title: 'Dépôt de garantie', content: 'Un dépôt de garantie...', isRequired: true, order: 3 }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'purchase_template',
        type: ContractType.PURCHASE,
        name: 'Contrat de Vente Immobilière',
        description: 'Contrat pour vente de bien immobilier',
        template: this.getPurchaseTemplate(),
        variables: [
          { key: 'salePrice', label: 'Prix de vente', type: 'currency', required: true },
          { key: 'downPayment', label: 'Acompte', type: 'currency', required: true },
          { key: 'closingDate', label: 'Date de signature définitive', type: 'date', required: true },
          { key: 'conditionsPrealables', label: 'Conditions préalables', type: 'text', required: false }
        ],
        legalClauses: [
          { id: '1', title: 'Prix et modalités de paiement', content: 'Le prix de vente...', isRequired: true, order: 1 },
          { id: '2', title: 'Conditions suspensives', content: 'La présente vente...', isRequired: true, order: 2 }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vacation_rental_template',
        type: ContractType.VACATION_RENTAL,
        name: 'Contrat de Location Saisonnière',
        description: 'Contrat pour location de courte durée',
        template: this.getVacationRentalTemplate(),
        variables: [
          { key: 'dailyRate', label: 'Tarif journalier', type: 'currency', required: true },
          { key: 'totalAmount', label: 'Montant total', type: 'currency', required: true },
          { key: 'checkInDate', label: 'Date d\'arrivée', type: 'date', required: true },
          { key: 'checkOutDate', label: 'Date de départ', type: 'date', required: true },
          { key: 'guests', label: 'Nombre de voyageurs', type: 'number', required: true },
          { key: 'cleaningFee', label: 'Frais de ménage', type: 'currency', required: false }
        ],
        legalClauses: [
          { id: '1', title: 'Durée du séjour', content: 'La location est accordée pour...', isRequired: true, order: 1 },
          { id: '2', title: 'Tarifs et paiement', content: 'Le tarif de la location...', isRequired: true, order: 2 }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async generateContract(request: ContractGenerationRequest): Promise<ContractData> {
    const template = this.templates.find(t => t.id === request.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const contractId = `CONTRACT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const contract: ContractData = {
      id: contractId,
      templateId: request.templateId,
      type: request.type,
      status: ContractStatus.DRAFT,
      parties: request.parties.map(party => ({
        id: `${contractId}-${party.role}`,
        role: party.role,
        user: { id: party.userId, fullName: '', email: '', phone: '' }, // Will be populated from user service
      })),
      variables: request.variables,
      property: request.propertyId ? await this.getProperty(request.propertyId) : undefined,
      reservation: request.reservationId ? await this.getReservation(request.reservationId) : undefined,
      aiAnalysis: {
        riskScore: Math.floor(Math.random() * 20) + 80, // 80-100
        complianceScore: Math.floor(Math.random() * 10) + 90, // 90-100
        marketAnalysis: this.getMarketAnalysis(request.type),
        recommendations: this.getRecommendations(request.type)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (request.autoGenerate) {
      await this.generateContractFile(contract);
    }

    this.contracts.push(contract);
    return contract;
  }

  async generateContractFile(contract: ContractData): Promise<string> {
    const template = this.templates.find(t => t.id === contract.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Generate QR Code and Watermark
    const qrCodeSVG = generateAdvancedQRCode({
      contractId: contract.id,
      propertyTitle: contract.property?.title || 'N/A',
      tenantName: contract.parties.find(p => p.role === PartyRole.TENANT)?.user.fullName || 'N/A',
      startDate: contract.variables.startDate || new Date().toISOString(),
      endDate: contract.variables.endDate || new Date().toISOString()
    });

    const watermarkSVG = generateWatermark(contract.id);

    // Process template with variables
    const processedHTML = this.processTemplate(template.template, contract);

    const { uri } = await Print.printToFileAsync({
      html: processedHTML,
      base64: false,
      width: 612,
      height: 792
    });

    // Update contract with generated file
    contract.generatedFileUri = uri;
    contract.status = ContractStatus.GENERATED;
    contract.qrCodeData = qrCodeSVG;
    contract.watermarkData = watermarkSVG;
    contract.updatedAt = new Date();

    return uri;
  }

  private processTemplate(template: string, contract: ContractData): string {
    let processedTemplate = template;

    // Replace variables
    Object.entries(contract.variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value?.toString() || '');
    });

    // Replace party information
    contract.parties.forEach(party => {
      const rolePrefix = party.role.toUpperCase();
      processedTemplate = processedTemplate.replace(new RegExp(`{{${rolePrefix}_NAME}}`, 'g'), party.user.fullName);
      processedTemplate = processedTemplate.replace(new RegExp(`{{${rolePrefix}_EMAIL}}`, 'g'), party.user.email);
      processedTemplate = processedTemplate.replace(new RegExp(`{{${rolePrefix}_PHONE}}`, 'g'), party.user.phone);
    });

    // Replace property information
    if (contract.property) {
      processedTemplate = processedTemplate.replace(/{{PROPERTY_TITLE}}/g, contract.property.title);
      processedTemplate = processedTemplate.replace(/{{PROPERTY_ADDRESS}}/g, contract.property.address);
      processedTemplate = processedTemplate.replace(/{{PROPERTY_SURFACE}}/g, contract.property.surface?.toString() || '');
      processedTemplate = processedTemplate.replace(/{{PROPERTY_ROOMS}}/g, contract.property.rooms?.toString() || '');
    }

    // Add QR code and watermark
    if (contract.qrCodeData) {
      processedTemplate = processedTemplate.replace('{{QR_CODE}}', contract.qrCodeData);
    }
    if (contract.watermarkData) {
      processedTemplate = processedTemplate.replace('{{WATERMARK}}', contract.watermarkData);
    }

    return processedTemplate;
  }

  async signContract(request: ContractSigningRequest): Promise<ContractData> {
    const contract = this.contracts.find(c => c.id === request.contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const party = contract.parties.find(p => p.id === request.partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    party.signedAt = request.signedAt;
    party.signature = request.signature;
    party.ipAddress = request.ipAddress;

    // Check if all parties have signed
    const allSigned = contract.parties.every(p => p.signedAt);
    if (allSigned) {
      contract.status = ContractStatus.SIGNED;
      contract.signedAt = new Date();
    } else {
      contract.status = ContractStatus.PENDING_SIGNATURE;
    }

    contract.updatedAt = new Date();
    return contract;
  }

  getContractsByType(type: ContractType): ContractData[] {
    return this.contracts.filter(c => c.type === type);
  }

  getContractById(id: string): ContractData | undefined {
    return this.contracts.find(c => c.id === id);
  }

  getTemplates(): ContractTemplate[] {
    return this.templates.filter(t => t.isActive);
  }

  getTemplatesByType(type: ContractType): ContractTemplate[] {
    return this.templates.filter(t => t.type === type && t.isActive);
  }

  private async getProperty(propertyId: string): Promise<any> {
    // Mock implementation - replace with actual API call
    return {
      id: propertyId,
      title: 'Appartement moderne',
      address: '123 Rue de la Paix, Paris',
      surface: 65,
      rooms: 3
    };
  }

  private async getReservation(reservationId: string): Promise<any> {
    // Mock implementation - replace with actual API call
    return {
      id: reservationId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      monthlyRent: 1200
    };
  }

  private getMarketAnalysis(type: ContractType): string {
    const analyses = {
      [ContractType.RENTAL]: 'Marché locatif favorable',
      [ContractType.PURCHASE]: 'Marché acheteur',
      [ContractType.VACATION_RENTAL]: 'Haute saison touristique',
      [ContractType.LEASE]: 'Marché commercial stable',
      [ContractType.SUBLEASE]: 'Sous-location réglementée',
      [ContractType.COMMERCIAL_RENTAL]: 'Zone d\'activité dynamique',
      [ContractType.RESERVATION]: 'Demande élevée'
    };
    return analyses[type] || 'Marché équilibré';
  }

  private getRecommendations(type: ContractType): string[] {
    const recommendations = {
      [ContractType.RENTAL]: [
        'Vérifier les revenus du locataire',
        'Demander des garanties suffisantes',
        'État des lieux détaillé recommandé'
      ],
      [ContractType.PURCHASE]: [
        'Vérification hypothécaire nécessaire',
        'Inspection technique recommandée',
        'Assurance titre conseillée'
      ],
      [ContractType.VACATION_RENTAL]: [
        'Vérifier la réglementation locale',
        'Assurance responsabilité civile',
        'Dépôt de garantie requis'
      ]
    };
    return recommendations[type] || ['Contrat conforme aux standards'];
  }

  private getRentalTemplate(): string {
    return `
      <html>
        <head>
          <title>Contrat de Location</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .parties { display: flex; justify-content: space-between; }
            .signature-section { margin-top: 50px; }
          </style>
        </head>
        <body>
          {{WATERMARK}}
          <div class="header">
            <h1>CONTRAT DE LOCATION RÉSIDENTIELLE</h1>
            <p>Contrat N° {{CONTRACT_ID}}</p>
          </div>

          <div class="section">
            <h2>PARTIES</h2>
            <div class="parties">
              <div>
                <h3>BAILLEUR</h3>
                <p><strong>{{LANDLORD_NAME}}</strong></p>
                <p>Email: {{LANDLORD_EMAIL}}</p>
                <p>Téléphone: {{LANDLORD_PHONE}}</p>
              </div>
              <div>
                <h3>LOCATAIRE</h3>
                <p><strong>{{TENANT_NAME}}</strong></p>
                <p>Email: {{TENANT_EMAIL}}</p>
                <p>Téléphone: {{TENANT_PHONE}}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>BIEN LOUÉ</h2>
            <p><strong>Désignation:</strong> {{PROPERTY_TITLE}}</p>
            <p><strong>Adresse:</strong> {{PROPERTY_ADDRESS}}</p>
            <p><strong>Surface:</strong> {{PROPERTY_SURFACE}} m²</p>
            <p><strong>Nombre de pièces:</strong> {{PROPERTY_ROOMS}}</p>
          </div>

          <div class="section">
            <h2>CONDITIONS FINANCIÈRES</h2>
            <p><strong>Loyer mensuel:</strong> {{monthlyRent}} €</p>
            <p><strong>Dépôt de garantie:</strong> {{depositAmount}} €</p>
            <p><strong>Charges:</strong> {{charges}} €</p>
          </div>

          <div class="section">
            <h2>DURÉE</h2>
            <p><strong>Date de début:</strong> {{startDate}}</p>
            <p><strong>Date de fin:</strong> {{endDate}}</p>
          </div>

          <div class="signature-section">
            <div class="parties">
              <div>
                <p>Signature du Bailleur</p>
                <div style="height: 80px; border: 1px solid #ccc;"></div>
              </div>
              <div>
                <p>Signature du Locataire</p>
                <div style="height: 80px; border: 1px solid #ccc;"></div>
              </div>
            </div>
          </div>

          <div style="position: fixed; bottom: 20px; right: 20px;">
            {{QR_CODE}}
          </div>
        </body>
      </html>
    `;
  }

  private getPurchaseTemplate(): string {
    return `
      <html>
        <head>
          <title>Contrat de Vente</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .parties { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          {{WATERMARK}}
          <div class="header">
            <h1>CONTRAT DE VENTE IMMOBILIÈRE</h1>
            <p>Contrat N° {{CONTRACT_ID}}</p>
          </div>

          <div class="section">
            <h2>PARTIES</h2>
            <div class="parties">
              <div>
                <h3>VENDEUR</h3>
                <p><strong>{{SELLER_NAME}}</strong></p>
                <p>Email: {{SELLER_EMAIL}}</p>
                <p>Téléphone: {{SELLER_PHONE}}</p>
              </div>
              <div>
                <h3>ACHETEUR</h3>
                <p><strong>{{BUYER_NAME}}</strong></p>
                <p>Email: {{BUYER_EMAIL}}</p>
                <p>Téléphone: {{BUYER_PHONE}}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>BIEN VENDU</h2>
            <p><strong>Désignation:</strong> {{PROPERTY_TITLE}}</p>
            <p><strong>Adresse:</strong> {{PROPERTY_ADDRESS}}</p>
            <p><strong>Surface:</strong> {{PROPERTY_SURFACE}} m²</p>
          </div>

          <div class="section">
            <h2>CONDITIONS FINANCIÈRES</h2>
            <p><strong>Prix de vente:</strong> {{salePrice}} €</p>
            <p><strong>Acompte versé:</strong> {{downPayment}} €</p>
            <p><strong>Date de signature définitive:</strong> {{closingDate}}</p>
          </div>

          <div style="position: fixed; bottom: 20px; right: 20px;">
            {{QR_CODE}}
          </div>
        </body>
      </html>
    `;
  }

  private getVacationRentalTemplate(): string {
    return `
      <html>
        <head>
          <title>Contrat de Location Saisonnière</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .parties { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          {{WATERMARK}}
          <div class="header">
            <h1>CONTRAT DE LOCATION SAISONNIÈRE</h1>
            <p>Contrat N° {{CONTRACT_ID}}</p>
          </div>

          <div class="section">
            <h2>PARTIES</h2>
            <div class="parties">
              <div>
                <h3>PROPRIÉTAIRE</h3>
                <p><strong>{{LANDLORD_NAME}}</strong></p>
                <p>Email: {{LANDLORD_EMAIL}}</p>
                <p>Téléphone: {{LANDLORD_PHONE}}</p>
              </div>
              <div>
                <h3>LOCATAIRE</h3>
                <p><strong>{{TENANT_NAME}}</strong></p>
                <p>Email: {{TENANT_EMAIL}}</p>
                <p>Téléphone: {{TENANT_PHONE}}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>LOGEMENT</h2>
            <p><strong>Désignation:</strong> {{PROPERTY_TITLE}}</p>
            <p><strong>Adresse:</strong> {{PROPERTY_ADDRESS}}</p>
            <p><strong>Nombre de voyageurs:</strong> {{guests}}</p>
          </div>

          <div class="section">
            <h2>SÉJOUR</h2>
            <p><strong>Date d'arrivée:</strong> {{checkInDate}}</p>
            <p><strong>Date de départ:</strong> {{checkOutDate}}</p>
            <p><strong>Tarif journalier:</strong> {{dailyRate}} €</p>
            <p><strong>Montant total:</strong> {{totalAmount}} €</p>
            <p><strong>Frais de ménage:</strong> {{cleaningFee}} €</p>
          </div>

          <div style="position: fixed; bottom: 20px; right: 20px;">
            {{QR_CODE}}
          </div>
        </body>
      </html>
    `;
  }
}

export default ContractService;