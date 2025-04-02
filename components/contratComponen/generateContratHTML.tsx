
import generateWatermarkSVG from './generateWatermarksvg';
import generateQRCodeSVG from './generateQRCodeSVG';
import { Property } from '@/types/property';
import { User } from '@/types/userType';
import { Reservation } from '@/types/reservationType';
  
type GenerateContractParams = {
    reservation: Reservation;
    property: Property;
    landlord: User;
    tenant: User;
    contractId: string;
    formatDate: (date: any) => Date;
  };
     
const generateContractHTML = ({reservation, property, landlord, tenant,contractId, formatDate}:GenerateContractParams) => {
    if (!reservation || !property || !landlord || !tenant) {
      return '';
    }
    
    const startDate = formatDate(reservation.startDate);
    const endDate = formatDate(reservation.endDate);
    
    // Calculer la durée en mois
    const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
    
    // Génération de l'identifiant unique du contrat
    const qrCodeData = `CONTRACT:${contractId}|PROP:${property.title}|TENANT:${tenant.fullName}|START:${startDate.toISOString()}|END:${endDate.toISOString()}`;
    const qrCodeSVG = generateQRCodeSVG(qrCodeData);
    const watermarkSVG = generateWatermarkSVG();
    
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
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
            width: 100px;
            height: 100px;
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
            width: 150px;
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
              <div class="party-contact">Ci-après dénommé "LE BAILLEUR"</div>
            </div>
            
            <div class="party-info">
              <div class="party-name">LE LOCATAIRE</div>
              <div class="party-contact"><strong>${tenant.fullName}</strong></div>
              <div class="party-contact">Email: ${tenant.email}</div>
              <div class="party-contact">Téléphone: ${tenant.phone}</div>
              <div class="party-contact">Ci-après dénommé "LE LOCATAIRE"</div>
            </div>
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
                <span class="property-detail-label">Nombre de pièces:</span>
                <span class="property-detail-value">${property.rooms}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Conditions Financières</h2>
            
            <table>
              <tr>
                <th>Désignation</th>
                <th>Montant</th>
                <th>Périodicité</th>
              </tr>
              <tr>
                <td>Loyer</td>
                <td>${reservation.monthlyRent} €</td>
                <td>Mensuel</td>
              </tr>
              <tr>
                <td>Dépôt de garantie</td>
                <td>${property.depositAmount} €</td>
                <td>Unique</td>
              </tr>
            </table>
            
            <div class="special-clause">
              <h3>Modalités de paiement</h3>
              <p>Le loyer est payable d'avance le 1er de chaque mois par virement bancaire sur le compte du BAILLEUR dont les coordonnées seront communiquées au LOCATAIRE.</p>
            </div>
            
            <h3>Révision du loyer</h3>
            <p class="clause">Le loyer sera révisé automatiquement chaque année à la date anniversaire du contrat en fonction de la variation de l'Indice de Référence des Loyers (IRL) publié par l'INSEE.</p>
          </div>
          
          <div class="section">
            <h2>Durée du Contrat</h2>
            
            <div class="property-details">
              <div class="property-detail">
                <span class="property-detail-label">Date de début:</span>
                <span class="property-detail-value">${formatDate(reservation.startDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Date de fin:</span>
                <span class="property-detail-value">${formatDate(reservation.endDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Durée:</span>
                <span class="property-detail-value">${durationMonths} mois</span>
              </div>
            </div>
            
            <h3>Renouvellement</h3>
            <p class="clause">À l'expiration du contrat, celui-ci sera renouvelé tacitement pour une durée identique, sauf dénonciation par l'une des parties dans les conditions prévues par la loi.</p>
          </div>
          
          <div class="holographic-effect"></div>
          
          <div class="signature-area">
            <div class="signature-box">
              <div class="signature-title">LE BAILLEUR</div>
              <div class="signature-line"></div>
              <div class="signature-name">${landlord.fullName}</div>
              <div class="signature-date">Date: ${currentDate}</div>
            </div>
            
            <div class="signature-box">
              <div class="signature-title">LE LOCATAIRE</div>
              <div class="signature-line"></div>
              <div class="signature-name">${tenant.fullName}</div>
              <div class="signature-date">Date: ${currentDate}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Ce contrat est authentifié électroniquement et enregistré dans la blockchain sous l'identifiant ${contractId}</p>
            <p class="legal-notice">Conformément à la législation en vigueur, toute modification du présent contrat doit faire l'objet d'un avenant signé par toutes les parties.</p>
          </div>
          
          <div class="page-number">Page 1/1</div>
        </div>
      </body>
      </html>
    `;
  };

  export default generateContractHTML;