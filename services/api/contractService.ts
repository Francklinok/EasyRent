import { GraphQLService, getGraphQLService } from './graphqlService';
import { ClientLegalInfo, OwnerLegalInfo } from './bookingService';

export interface ContractData {
  reservationId: string;
  contractType: 'rent' | 'sale';
  property: PropertyContractInfo;
  client: ClientLegalInfo;
  owner: OwnerLegalInfo;
  financialTerms: FinancialTerms;
  legalClauses: LegalClauses;
}

export interface PropertyContractInfo {
  id: string;
  title: string;
  address: string;
  propertyType: string;
  surface: number;
  cadastralReference?: string;
  description: string;
}

export interface FinancialTerms {
  // For rent
  monthlyRent?: number;
  depositAmount?: number;
  charges?: number;
  rentReviewClause?: string;

  // For sale
  salePrice?: number;
  downPayment?: number;
  notaryFees?: number;
  totalAmount?: number;
  paymentSchedule?: PaymentSchedule[];
}

export interface PaymentSchedule {
  date: string;
  amount: number;
  description: string;
}

export interface LegalClauses {
  // Common clauses
  duration?: string;
  startDate: string;
  endDate?: string;
  terminationConditions: string;
  maintenanceResponsibilities: string;
  insuranceRequirements: string;

  // Rent-specific
  rentPaymentDay?: number;
  latePaymentPenalties?: string;
  renewalConditions?: string;

  // Sale-specific
  transferOfOwnershipDate?: string;
  conditionsPrecedent?: string[];
  warranties?: string[];
  defectsLiability?: string;

  // Additional clauses
  disputeResolution: string;
  governingLaw: string;
  confidentiality?: string;
  specialConditions?: string[];
}

export interface GeneratedContract {
  id: string;
  contractUrl: string;
  contractPdfUrl: string;
  generatedAt: string;
  status: 'draft' | 'final' | 'signed';
  signatureRequired: boolean;
  clientSigned: boolean;
  ownerSigned: boolean;
}

class ContractService {
  private graphql: GraphQLService;

  constructor() {
    this.graphql = getGraphQLService();
  }

  // Generate a professional rental contract
  async generateRentalContract(data: ContractData): Promise<GeneratedContract> {
    const contractContent = this.buildRentalContract(data);

    const mutation = `
      mutation GenerateRentalContract($input: ContractGenerationInput!) {
        generateRentalContract(input: $input) {
          id
          contractUrl
          contractPdfUrl
          generatedAt
          status
          signatureRequired
          clientSigned
          ownerSigned
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        input: {
          reservationId: data.reservationId,
          contractType: 'rent',
          contractContent,
          metadata: {
            property: data.property,
            client: data.client,
            owner: data.owner,
            financialTerms: data.financialTerms
          }
        }
      });

      return result.generateRentalContract;
    } catch (error) {
      console.error('Error generating rental contract:', error);
      throw error;
    }
  }

  // Generate a professional sale contract (Acte de vente)
  async generateSaleContract(data: ContractData): Promise<GeneratedContract> {
    const contractContent = this.buildSaleContract(data);

    const mutation = `
      mutation GenerateSaleContract($input: ContractGenerationInput!) {
        generateSaleContract(input: $input) {
          id
          contractUrl
          contractPdfUrl
          generatedAt
          status
          signatureRequired
          clientSigned
          ownerSigned
        }
      }
    `;

    try {
      const result = await this.graphql.mutate(mutation, {
        input: {
          reservationId: data.reservationId,
          contractType: 'sale',
          contractContent,
          metadata: {
            property: data.property,
            client: data.client,
            owner: data.owner,
            financialTerms: data.financialTerms,
            legalClauses: data.legalClauses
          }
        }
      });

      return result.generateSaleContract;
    } catch (error) {
      console.error('Error generating sale contract:', error);
      throw error;
    }
  }

  // Build rental contract content
  private buildRentalContract(data: ContractData): string {
    const { property, client, owner, financialTerms, legalClauses } = data;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Contrat de Location - ${property.title}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 15px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
        }
        .clause {
            margin-bottom: 15px;
            text-align: justify;
        }
        .clause-number {
            font-weight: bold;
        }
        .signature-block {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .signature {
            width: 45%;
        }
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 5px;
        }
        .financial-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .financial-table td, .financial-table th {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }
        .financial-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .important {
            font-weight: bold;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Contrat de Location</h1>
        <p><strong>Bail d'Habitation - Loi n° 89-462 du 6 juillet 1989</strong></p>
    </div>

    <div class="section">
        <h2 class="section-title">Article 1 - Les Parties</h2>

        <div class="clause">
            <p><span class="clause-number">1.1 Le Bailleur :</span></p>
            <p>
                <strong>Nom complet :</strong> ${owner.fullName}<br>
                <strong>Profession :</strong> ${owner.profession}<br>
                <strong>Pays de résidence :</strong> ${owner.country}<br>
                <strong>Adresse :</strong> ${owner.address}<br>
                <strong>Pièce d'identité :</strong> ${owner.idDocument}
            </p>
            <p>Ci-après dénommé <strong>« le Bailleur »</strong></p>
        </div>

        <div class="clause">
            <p><span class="clause-number">1.2 Le Locataire :</span></p>
            <p>
                <strong>Nom complet :</strong> ${client.fullName}<br>
                <strong>Date de naissance :</strong> ${client.birthDate || 'N/A'}<br>
                <strong>Lieu de naissance :</strong> ${client.birthPlace || 'N/A'}<br>
                <strong>Profession :</strong> ${client.profession}<br>
                <strong>Pays d'origine :</strong> ${client.originCountry}<br>
                <strong>Pays de résidence :</strong> ${client.residenceCountry}<br>
                <strong>Adresse actuelle :</strong> ${client.address}<br>
                <strong>Téléphone :</strong> ${client.phone}<br>
                <strong>Pièce d'identité :</strong> ${client.idDocument}
            </p>
            <p>Ci-après dénommé <strong>« le Locataire »</strong></p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 2 - Objet du Contrat</h2>
        <div class="clause">
            <p>Le présent contrat a pour objet la location du bien immobilier suivant :</p>
            <table class="financial-table">
                <tr>
                    <th>Désignation</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td><strong>Type de bien</strong></td>
                    <td>${property.propertyType}</td>
                </tr>
                <tr>
                    <td><strong>Adresse complète</strong></td>
                    <td>${property.address}</td>
                </tr>
                <tr>
                    <td><strong>Surface habitable</strong></td>
                    <td>${property.surface} m²</td>
                </tr>
                ${property.cadastralReference ? `
                <tr>
                    <td><strong>Référence cadastrale</strong></td>
                    <td>${property.cadastralReference}</td>
                </tr>` : ''}
                <tr>
                    <td><strong>Description</strong></td>
                    <td>${property.description}</td>
                </tr>
            </table>
            <p>Ci-après dénommé <strong>« le Bien »</strong></p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 3 - Durée du Bail</h2>
        <div class="clause">
            <p><span class="clause-number">3.1 Durée :</span> Le présent bail est conclu pour une durée de <strong>${legalClauses.duration || '12 mois'}</strong>, prenant effet le <strong>${new Date(legalClauses.startDate).toLocaleDateString('fr-FR')}</strong>.</p>
            <p><span class="clause-number">3.2 Échéance :</span> Le bail prendra fin le <strong>${legalClauses.endDate ? new Date(legalClauses.endDate).toLocaleDateString('fr-FR') : 'À déterminer'}</strong>, sauf renouvellement ou résiliation anticipée dans les conditions prévues par la loi.</p>
            <p><span class="clause-number">3.3 Renouvellement :</span> ${legalClauses.renewalConditions || 'Le bail sera renouvelable par tacite reconduction, sauf dénonciation par l\'une des parties dans le respect des délais légaux.'}</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 4 - Conditions Financières</h2>
        <div class="clause">
            <table class="financial-table">
                <tr>
                    <th>Désignation</th>
                    <th>Montant</th>
                </tr>
                <tr>
                    <td><strong>Loyer mensuel hors charges</strong></td>
                    <td>${financialTerms.monthlyRent?.toLocaleString('fr-FR')} €</td>
                </tr>
                ${financialTerms.charges ? `
                <tr>
                    <td><strong>Charges mensuelles</strong></td>
                    <td>${financialTerms.charges.toLocaleString('fr-FR')} €</td>
                </tr>` : ''}
                <tr>
                    <td><strong>Dépôt de garantie</strong></td>
                    <td>${financialTerms.depositAmount?.toLocaleString('fr-FR')} €</td>
                </tr>
                <tr>
                    <td><strong>Date de paiement</strong></td>
                    <td>Le ${legalClauses.rentPaymentDay || 1} de chaque mois</td>
                </tr>
            </table>
        </div>

        <div class="clause">
            <p><span class="clause-number">4.1 Modalités de paiement :</span> Le loyer est payable mensuellement et d'avance, le ${legalClauses.rentPaymentDay || 1} de chaque mois, par virement bancaire sur le compte du Bailleur.</p>
            <p><span class="clause-number">4.2 Révision du loyer :</span> ${financialTerms.rentReviewClause || 'Le loyer pourra être révisé annuellement selon l\'indice de référence des loyers (IRL) publié par l\'INSEE.'}</p>
            <p><span class="clause-number">4.3 Pénalités de retard :</span> ${legalClauses.latePaymentPenalties || 'En cas de retard de paiement, des pénalités de 10% du montant du loyer seront appliquées après mise en demeure restée sans effet pendant 8 jours.'}</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 5 - Dépôt de Garantie</h2>
        <div class="clause">
            <p>Un dépôt de garantie d'un montant de <strong>${financialTerms.depositAmount?.toLocaleString('fr-FR')} €</strong> a été versé par le Locataire au Bailleur à la signature du présent contrat.</p>
            <p>Ce dépôt sera restitué au Locataire dans un délai maximum de deux mois après la remise des clés et l'établissement de l'état des lieux de sortie, déduction faite, le cas échéant, des sommes dues au Bailleur.</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 6 - Obligations du Bailleur</h2>
        <div class="clause">
            <p>Le Bailleur s'engage à :</p>
            <ul>
                <li>Délivrer au Locataire un logement décent ne laissant pas apparaître de risques manifestes pouvant porter atteinte à la sécurité physique ou à la santé</li>
                <li>Assurer au Locataire la jouissance paisible du logement</li>
                <li>Entretenir les locaux en état de servir à l'usage prévu par le contrat</li>
                <li>Effectuer les réparations autres que locatives</li>
                <li>${legalClauses.maintenanceResponsibilities}</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 7 - Obligations du Locataire</h2>
        <div class="clause">
            <p>Le Locataire s'engage à :</p>
            <ul>
                <li>Payer le loyer et les charges aux termes convenus</li>
                <li>User paisiblement des locaux et équipements</li>
                <li>Répondre des dégradations et pertes survenant pendant la durée du contrat</li>
                <li>Prendre à sa charge l'entretien courant du logement et les réparations locatives</li>
                <li>Souscrire une assurance garantissant les risques locatifs</li>
                <li>Ne pas transformer les lieux sans accord écrit du Bailleur</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 8 - Assurance</h2>
        <div class="clause">
            <p>${legalClauses.insuranceRequirements}</p>
            <p>Le Locataire devra justifier de cette assurance à la signature du bail puis chaque année à la demande du Bailleur.</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 9 - Résiliation du Bail</h2>
        <div class="clause">
            <p><span class="clause-number">9.1 Par le Locataire :</span> Le Locataire peut résilier le bail à tout moment, sous réserve de respecter un préavis de trois mois (ou un mois dans certains cas prévus par la loi).</p>
            <p><span class="clause-number">9.2 Par le Bailleur :</span> Le Bailleur peut donner congé au Locataire en respectant un préavis de six mois, pour les motifs légalement prévus (reprise pour habiter, vente du bien, motif légitime et sérieux).</p>
            <p><span class="clause-number">9.3 Conditions :</span> ${legalClauses.terminationConditions}</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 10 - Règlement des Litiges</h2>
        <div class="clause">
            <p><span class="clause-number">10.1 Loi applicable :</span> ${legalClauses.governingLaw}</p>
            <p><span class="clause-number">10.2 Résolution des différends :</span> ${legalClauses.disputeResolution}</p>
            <p>À défaut d'accord amiable, les tribunaux compétents seront ceux du lieu de situation de l'immeuble.</p>
        </div>
    </div>

    ${legalClauses.specialConditions && legalClauses.specialConditions.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Article 11 - Conditions Particulières</h2>
        ${legalClauses.specialConditions.map((condition, index) => `
        <div class="clause">
            <p><span class="clause-number">11.${index + 1}</span> ${condition}</p>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2 class="section-title">Signatures</h2>
        <p>Fait en deux exemplaires originaux, dont un pour chaque partie.</p>
        <p>Fait à _________________, le ${new Date().toLocaleDateString('fr-FR')}</p>

        <div class="signature-block">
            <div class="signature">
                <p><strong>Le Bailleur</strong></p>
                <p>${owner.fullName}</p>
                <div class="signature-line">
                    (Signature précédée de la mention "Lu et approuvé")
                </div>
            </div>
            <div class="signature">
                <p><strong>Le Locataire</strong></p>
                <p>${client.fullName}</p>
                <div class="signature-line">
                    (Signature précédée de la mention "Lu et approuvé")
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  // Build sale contract content (Acte de vente)
  private buildSaleContract(data: ContractData): string {
    const { property, client, owner, financialTerms, legalClauses } = data;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Acte de Vente - ${property.title}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px double #000;
            padding-bottom: 20px;
        }
        .header h1 {
            font-size: 26px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .notary-seal {
            text-align: center;
            font-style: italic;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        .article {
            margin-bottom: 20px;
            text-align: justify;
        }
        .article-number {
            font-weight: bold;
            font-size: 16px;
        }
        .signature-block {
            margin-top: 60px;
            page-break-inside: avoid;
        }
        .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
        }
        .signature {
            text-align: center;
        }
        .signature-line {
            border-top: 2px solid #000;
            margin-top: 80px;
            padding-top: 10px;
        }
        .financial-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .financial-table td, .financial-table th {
            border: 1px solid #000;
            padding: 10px;
            text-align: left;
        }
        .financial-table th {
            background-color: #e0e0e0;
            font-weight: bold;
        }
        .total-row {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .important {
            font-weight: bold;
            text-decoration: underline;
        }
        .legal-notice {
            background-color: #f9f9f9;
            border-left: 4px solid #000;
            padding: 15px;
            margin: 20px 0;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Acte de Vente</h1>
        <p><strong>Vente Immobilière - Bien à Usage d'Habitation</strong></p>
    </div>

    <div class="notary-seal">
        <p><em>Acte authentique établi conformément aux dispositions du Code Civil</em></p>
        <p><em>et du Code de la Construction et de l'Habitation</em></p>
    </div>

    <div class="section">
        <h2 class="section-title">Préambule - Comparution des Parties</h2>

        <div class="article">
            <p>L'an ${new Date().getFullYear()}, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })},</p>
            <p>Par-devant Maître [NOM DU NOTAIRE], Notaire à [VILLE],</p>
            <p>ONT COMPARU :</p>
        </div>

        <div class="article">
            <p><span class="article-number">Le Vendeur :</span></p>
            <p>
                <strong>Nom et Prénoms :</strong> ${owner.fullName}<br>
                <strong>Profession :</strong> ${owner.profession}<br>
                <strong>Demeurant :</strong> ${owner.address}<br>
                <strong>Pays de résidence :</strong> ${owner.country}<br>
                <strong>Pièce d'identité :</strong> ${owner.idDocument}
            </p>
            <p>Ci-après désigné <strong>« LE VENDEUR »</strong></p>
        </div>

        <div class="article">
            <p><span class="article-number">L'Acquéreur :</span></p>
            <p>
                <strong>Nom et Prénoms :</strong> ${client.fullName}<br>
                <strong>Date et lieu de naissance :</strong> ${client.birthDate ? `${client.birthDate}, ${client.birthPlace || ''}` : 'N/A'}<br>
                <strong>État civil :</strong> ${client.civilStatus || 'Non communiqué'}<br>
                <strong>Profession :</strong> ${client.profession}<br>
                <strong>Demeurant :</strong> ${client.address}<br>
                <strong>Pays d'origine :</strong> ${client.originCountry}<br>
                <strong>Pays de résidence :</strong> ${client.residenceCountry}<br>
                <strong>Téléphone :</strong> ${client.phone}<br>
                <strong>Pièce d'identité :</strong> ${client.idDocument}
            </p>
            <p>Ci-après désigné <strong>« L'ACQUÉREUR »</strong></p>
        </div>

        <div class="legal-notice">
            <p><strong>Déclaration de capacité :</strong> Les parties déclarent avoir la pleine capacité juridique pour contracter et ne faire l'objet d'aucune mesure de protection.</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 1 - Objet de la Vente</h2>
        <div class="article">
            <p>Le VENDEUR vend, cède et transporte à l'ACQUÉREUR, qui accepte, le bien immobilier suivant :</p>

            <table class="financial-table">
                <tr>
                    <th colspan="2" style="text-align: center;">DÉSIGNATION DU BIEN</th>
                </tr>
                <tr>
                    <td><strong>Nature du bien</strong></td>
                    <td>${property.propertyType}</td>
                </tr>
                <tr>
                    <td><strong>Situation</strong></td>
                    <td>${property.address}</td>
                </tr>
                <tr>
                    <td><strong>Surface habitable</strong></td>
                    <td>${property.surface} m² (loi Carrez)</td>
                </tr>
                ${property.cadastralReference ? `
                <tr>
                    <td><strong>Désignation cadastrale</strong></td>
                    <td>${property.cadastralReference}</td>
                </tr>` : ''}
                <tr>
                    <td><strong>Description détaillée</strong></td>
                    <td>${property.description}</td>
                </tr>
            </table>

            <p>Ci-après désigné <strong>« LE BIEN »</strong></p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 2 - Origine de Propriété</h2>
        <div class="article">
            <p>Le VENDEUR est propriétaire du BIEN pour l'avoir acquis suivant [ACTE D'ACQUISITION], reçu par Maître [NOM], Notaire à [VILLE], en date du [DATE], publié au Service de la Publicité Foncière de [VILLE] le [DATE], volume [NUMÉRO], numéro [NUMÉRO].</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 3 - Prix et Conditions Financières</h2>
        <div class="article">
            <p>Cette vente est consentie et acceptée moyennant le prix principal de :</p>

            <table class="financial-table">
                <tr>
                    <th>Désignation</th>
                    <th style="text-align: right;">Montant</th>
                </tr>
                <tr>
                    <td><strong>Prix de vente du bien</strong></td>
                    <td style="text-align: right;">${financialTerms.salePrice?.toLocaleString('fr-FR')} €</td>
                </tr>
                ${financialTerms.notaryFees ? `
                <tr>
                    <td><strong>Frais de notaire (≈8%)</strong></td>
                    <td style="text-align: right;">${financialTerms.notaryFees.toLocaleString('fr-FR')} €</td>
                </tr>` : ''}
                ${financialTerms.downPayment ? `
                <tr>
                    <td><strong>Acompte versé</strong></td>
                    <td style="text-align: right;">- ${financialTerms.downPayment.toLocaleString('fr-FR')} €</td>
                </tr>` : ''}
                <tr class="total-row">
                    <td><strong>PRIX TOTAL</strong></td>
                    <td style="text-align: right;"><strong>${financialTerms.totalAmount?.toLocaleString('fr-FR') || financialTerms.salePrice?.toLocaleString('fr-FR')} €</strong></td>
                </tr>
            </table>

            <p><span class="important">En lettres :</span> ${this.numberToWords(financialTerms.totalAmount || financialTerms.salePrice || 0)} euros</p>
        </div>

        ${financialTerms.paymentSchedule && financialTerms.paymentSchedule.length > 0 ? `
        <div class="article">
            <p><span class="article-number">3.1 Modalités de paiement :</span></p>
            <table class="financial-table">
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th style="text-align: right;">Montant</th>
                </tr>
                ${financialTerms.paymentSchedule.map(payment => `
                <tr>
                    <td>${new Date(payment.date).toLocaleDateString('fr-FR')}</td>
                    <td>${payment.description}</td>
                    <td style="text-align: right;">${payment.amount.toLocaleString('fr-FR')} €</td>
                </tr>
                `).join('')}
            </table>
        </div>
        ` : ''}
    </div>

    <div class="section">
        <h2 class="section-title">Article 4 - Conditions Suspensives</h2>
        <div class="article">
            <p>La présente vente est conclue sous les conditions suspensives suivantes :</p>
            <ul>
                ${legalClauses.conditionsPrecedent?.map((condition, index) => `
                    <li><strong>4.${index + 1}</strong> ${condition}</li>
                `).join('') || '<li>Aucune condition suspensive</li>'}
            </ul>
            <p>${legalClauses.conditionsPrecedent && legalClauses.conditionsPrecedent.length > 0 ? 'Si l\'une de ces conditions n\'est pas réalisée dans le délai imparti, la vente sera considérée comme nulle et non avenue.' : ''}</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 5 - Garanties et Déclarations</h2>
        <div class="article">
            <p><span class="article-number">5.1 Garantie d'éviction :</span> Le VENDEUR garantit l'ACQUÉREUR contre tout trouble et éviction, tant de son fait personnel que du fait de tiers ayant cause de lui.</p>

            <p><span class="article-number">5.2 Garantie des vices cachés :</span> ${legalClauses.defectsLiability || 'Le VENDEUR garantit le BIEN vendu contre les vices cachés conformément aux articles 1641 et suivants du Code Civil.'}</p>

            ${legalClauses.warranties && legalClauses.warranties.length > 0 ? `
            <p><span class="article-number">5.3 Garanties complémentaires :</span></p>
            <ul>
                ${legalClauses.warranties.map((warranty, index) => `
                    <li>${warranty}</li>
                `).join('')}
            </ul>
            ` : ''}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 6 - Diagnostics Techniques</h2>
        <div class="article">
            <p>Conformément aux dispositions légales, les diagnostics techniques suivants ont été réalisés et annexés au présent acte :</p>
            <ul>
                <li>Diagnostic de performance énergétique (DPE)</li>
                <li>Constat de risque d'exposition au plomb (CREP)</li>
                <li>État d'amiante</li>
                <li>État relatif à la présence de termites</li>
                <li>État de l'installation intérieure de gaz</li>
                <li>État de l'installation intérieure d'électricité</li>
                <li>État des risques et pollutions (ERP)</li>
            </ul>
            <p>L'ACQUÉREUR déclare avoir pris connaissance de ces diagnostics.</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 7 - Transfert de Propriété et Jouissance</h2>
        <div class="article">
            <p><span class="article-number">7.1 Transfert de propriété :</span> Le transfert de propriété s'opèrera le <strong>${legalClauses.transferOfOwnershipDate ? new Date(legalClauses.transferOfOwnershipDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</strong>, date à laquelle l'ACQUÉREUR deviendra propriétaire du BIEN.</p>

            <p><span class="article-number">7.2 Entrée en jouissance :</span> L'ACQUÉREUR entrera en jouissance du BIEN à compter du jour du transfert de propriété.</p>

            <p><span class="article-number">7.3 Charges et risques :</span> À compter de la date de transfert de propriété, tous impôts, taxes, charges et contributions ainsi que les risques de toute nature concernant le BIEN seront supportés par l'ACQUÉREUR.</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 8 - Déclarations Fiscales</h2>
        <div class="article">
            <p><span class="article-number">8.1 TVA :</span> La présente vente est réalisée hors champ d'application de la TVA.</p>

            <p><span class="article-number">8.2 Droits d'enregistrement :</span> L'ACQUÉREUR acquittera les droits d'enregistrement, la taxe de publicité foncière et les frais de toute nature.</p>

            <p><span class="article-number">8.3 Plus-value :</span> Le VENDEUR déclare que la présente vente [EST/N'EST PAS] soumise à l'impôt sur la plus-value immobilière.</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 9 - Déclarations Complémentaires</h2>
        <div class="article">
            <p><span class="article-number">9.1 Urbanisme :</span> Le BIEN se situe en zone [TYPE DE ZONE] du Plan Local d'Urbanisme (PLU) de la commune.</p>

            <p><span class="article-number">9.2 Servitudes :</span> Le BIEN est grevé des servitudes apparentes et non apparentes, continues et discontinues qui peuvent exister, si aucune n'existe ou n'a été révélée.</p>

            <p><span class="article-number">9.3 Copropriété :</span> [SI APPLICABLE] Le BIEN fait partie d'un ensemble immobilier soumis au statut de la copropriété.</p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Article 10 - Règlement des Litiges</h2>
        <div class="article">
            <p><span class="article-number">10.1 Droit applicable :</span> ${legalClauses.governingLaw}</p>

            <p><span class="article-number">10.2 Juridiction compétente :</span> ${legalClauses.disputeResolution}</p>

            <p>Tout litige relatif à l'interprétation ou à l'exécution du présent acte sera porté devant les tribunaux compétents du ressort du lieu de situation du BIEN.</p>
        </div>
    </div>

    ${legalClauses.specialConditions && legalClauses.specialConditions.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Article 11 - Stipulations Particulières</h2>
        ${legalClauses.specialConditions.map((condition, index) => `
        <div class="article">
            <p><span class="article-number">11.${index + 1}</span> ${condition}</p>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2 class="section-title">Déclarations Finales</h2>
        <div class="article">
            <p>Les parties déclarent :</p>
            <ul>
                <li>Que la présente vente ne dissimule aucune clause secrète</li>
                <li>Que le prix exprimé est sincère et qu'il n'existe aucune contrepartie non déclarée</li>
                <li>Qu'elles ont pris connaissance de l'ensemble des clauses du présent acte</li>
            </ul>
        </div>
    </div>

    <div class="legal-notice">
        <p><strong>Information importante :</strong> Le présent acte sera publié au Service de la Publicité Foncière compétent dans un délai de [X] jours à compter de sa signature.</p>
    </div>

    <div class="signature-block">
        <p><strong>DONT ACTE</strong></p>
        <p>Fait et passé à [VILLE], en l'étude de Maître [NOM DU NOTAIRE]</p>
        <p>Le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p>En [NOMBRE] exemplaires originaux</p>

        <div class="signature-grid">
            <div class="signature">
                <p><strong>LE VENDEUR</strong></p>
                <p>${owner.fullName}</p>
                <div class="signature-line">
                    <p>Lu et approuvé</p>
                    <p>Bon pour vente de la somme de ${financialTerms.salePrice?.toLocaleString('fr-FR')} €</p>
                </div>
            </div>

            <div class="signature">
                <p><strong>L'ACQUÉREUR</strong></p>
                <p>${client.fullName}</p>
                <div class="signature-line">
                    <p>Lu et approuvé</p>
                    <p>Bon pour acquisition de la somme de ${financialTerms.totalAmount?.toLocaleString('fr-FR') || financialTerms.salePrice?.toLocaleString('fr-FR')} €</p>
                </div>
            </div>
        </div>

        <div class="signature" style="margin-top: 60px; text-align: center;">
            <p><strong>LE NOTAIRE</strong></p>
            <p>Maître [NOM DU NOTAIRE]</p>
            <div class="signature-line">
                <p>(Signature et cachet)</p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  // Helper method to convert numbers to words (simplified French)
  private numberToWords(num: number): string {
    // This is a simplified version - you would want a complete implementation
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

    if (num === 0) return 'zéro';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const unit = num % 10;
      const ten = Math.floor(num / 10);
      return `${tens[ten]}${unit > 0 ? '-' + units[unit] : ''}`;
    }

    // For larger numbers, you'd need a more complete implementation
    return num.toLocaleString('fr-FR');
  }

  // Get contract by ID
  async getContract(contractId: string): Promise<GeneratedContract> {
    const query = `
      query GetContract($id: ID!) {
        contract(id: $id) {
          id
          contractUrl
          contractPdfUrl
          generatedAt
          status
          signatureRequired
          clientSigned
          ownerSigned
        }
      }
    `;

    try {
      const result = await this.graphql.query(query, { id: contractId });
      return result.contract;
    } catch (error) {
      console.error('Error getting contract:', error);
      throw error;
    }
  }

  // Sign contract
  async signContract(contractId: string, userId: string, role: 'client' | 'owner'): Promise<{ success: boolean }> {
    const mutation = `
      mutation SignContract($contractId: ID!, $userId: ID!, $role: String!) {
        signContract(contractId: $contractId, userId: $userId, role: $role) {
          id
          clientSigned
          ownerSigned
          status
        }
      }
    `;

    try {
      await this.graphql.mutate(mutation, {
        contractId,
        userId,
        role
      });

      return { success: true };
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  }
}

// Singleton instance
let contractServiceInstance: ContractService | null = null;

export const getContractService = (): ContractService => {
  if (!contractServiceInstance) {
    contractServiceInstance = new ContractService();
  }
  return contractServiceInstance;
};

export default ContractService;
