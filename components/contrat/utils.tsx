


const generateQRCodeSVG = (data) => {
    // Simuler un QR code avec un SVG basique
    // Dans une véritable implémentation, vous utiliseriez une bibliothèque dédiée
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
        <rect x="10" y="10" width="80" height="80" fill="#000000" />
        <rect x="20" y="20" width="60" height="60" fill="#ffffff" />
        <rect x="30" y="30" width="40" height="40" fill="#000000" />
        <rect x="40" y="40" width="20" height="20" fill="#ffffff" />
        <text x="10" y="95" font-size="3" fill="#000000">SCAN: ${data}</text>
      </svg>
    `;
  };
  
  // Génère le filigrane du contrat
  const generateWatermarkSVG = (contractId) => {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" opacity="0.04">
        <text transform="rotate(-45 250 250)" x="0" y="250" fill="#000000" font-size="30" font-family="Arial, sans-serif">CONTRAT OFFICIEL • ${contractId} • CONTRAT OFFICIEL</text>
      </svg>
    `;
  };
  
  // Fonction principale pour générer le HTML du contrat
  const generateContractHTML = ({ contractId, reservation, property, landlord, tenant, formatDate }) => {
    if (!reservation || !property || !landlord || !tenant) {
      return '';
    }
    
    const startDate = formatDate(reservation.startDate);
    const endDate = formatDate(reservation.endDate);
    
    // Calculer la durée en mois
    const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
    
    // Génération du QR code avec les données du contrat
    const qrCodeData = `CONTRACT:${contractId}|PROP:${property.title}|TENANT:${tenant.fullName}|START:${startDate.toISOString()}|END:${endDate.toISOString()}`;
    const qrCodeSVG = generateQRCodeSVG(qrCodeData);
    const watermarkSVG = generateWatermarkSVG(contractId);
    
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
            margin-bottom: 15px;
            background-color: #F9FAFB;
            border-radius: 6px;
          }
          
          .party-title {
            font-weight: 600;
            color: #4F46E5;
            margin-bottom: 10px;
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
            padding: 12px 15px;
            text-align: left;
            color: #374151;
            font-weight: 600;
          }
          
          td {
            padding: 12px 15px;
            color: #111827;
          }
          
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #E5E7EB;
          }
          
          .signature-box {
            width: 45%;
            padding: 20px;
            border: 1px dashed #D1D5DB;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 150px;
          }
          
          .signature-title {
            font-weight: 500;
            margin-bottom: 10px;
            color: #374151;
          }
          
          .signature-line {
            width: 100%;
            margin: 15px 0;
            border-bottom: 1px solid #9CA3AF;
          }
          
          .signature-date {
            font-size: 14px;
            color: #6B7280;
            margin-top: 10px;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 14px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="watermark">${watermarkSVG}</div>
        <div class="page">
          <div class="header">
            <div class="logo-container">
              <div class="logo">RL</div>
              <div class="contract-info">
                <h1 class="contract-title">Contrat de Location</h1>
                <div class="contract-subtitle">Bail de location résidentielle</div>
                <div class="contract-id">Référence: ${contractId}</div>
              </div>
            </div>
            <div class="qr-container">
              ${qrCodeSVG}
            </div>
          </div>
          
          <div class="section">
            <h2>Parties au contrat</h2>
            
            <div class="party-info">
              <div class="party-title">Bailleur</div>
              <div class="property-details">
                <div class="property-detail">
                  <span class="property-detail-label">Nom complet:</span>
                  <span class="property-detail-value">${landlord.fullName}</span>
                </div>
                <div class="property-detail">
                  <span class="property-detail-label">Adresse:</span>
                  <span class="property-detail-value">${landlord.address}</span>
                </div>
                <div class="property-detail">
                  <span class="property-detail-label">Téléphone:</span>
                  <span class="property-detail-value">${landlord.phone}</span>
                </div>
                <div class="property-detail">
                  <span class="property-detail-label">Email:</span>
                  <span class="property-detail-value">${landlord.email}</span>
                </div>
              </div>
            </div>
            
            <div class="party-info">
              <div class="party-title">Locataire</div>
              <div class="property-details">
                <div class="property-detail">
                  <span class="property-detail-label">Nom complet:</span>
                  <span class="property-detail-value">${tenant.fullName}</span>
                </div>
                <div class="property-detail">
                  <span class="property-detail-label">Adresse actuelle:</span>
                  <span class="property-detail-value">${tenant.address}</span>
                </div>
                <div class="property-detail">
                  <span class="property-detail-label">Téléphone:</span>
                  <span class="property-detail-value">${tenant.phone}</span>
                </div>
                <div class="property-detail">
                  <span class="property-detail-label">Email:</span>
                  <span class="property-detail-value">${tenant.email}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Bien immobilier</h2>
            
            <div class="highlight-box">
              <h3>${property.title}</h3>
              <p>${property.description}</p>
            </div>
            
            <div class="property-details">
              <div class="property-detail">
                <span class="property-detail-label">Adresse:</span>
                <span class="property-detail-value">${property.address}</span>
              </div>
              <div class="property-detail">
                <span class="property-detail-label">Superficie:</span>
                <span class="property-detail-value">${property.area} m²</span>
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
  
  // Fonction pour exporter le contrat au format PDF (à implémenter)
  const exportContractToPDF = (contractHTML) => {
    // Ici, vous pourriez utiliser une bibliothèque comme html-pdf, puppeteer, etc.
    console.log('Exportation du contrat au format PDF...');
    // Cette fonction serait à implémenter selon les besoins spécifiques
  };
  
  module.exports = {
    generateContractHTML,
    exportContractToPDF,
    generateQRCodeSVG,
    generateWatermarkSVG
  };