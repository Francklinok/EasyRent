// import { QRCodeParams } from '../types';

// /**
//  * Génère un code QR avancé avec des fonctionnalités de sécurité
//  * Cette implémentation est simulée avec un SVG - dans une application réelle, 
//  * utilisez une bibliothèque dédiée comme 'qrcode' ou 'react-native-qrcode-svg'
//  */
// export const generateAdvancedQRCode = (params: QRCodeParams): string => {
//   const { contractId, propertyTitle, tenantName, startDate, endDate } = params;
  
//   // Créer une chaîne de données encodée pour le QR code
//   // Dans une implémentation réelle, vous pourriez utiliser un format JSON ou une structure plus sophistiquée
//   const qrData = `CONTRACT:${contractId}|PROP:${propertyTitle}|TENANT:${tenantName}|START:${startDate}|END:${endDate}`;
  
//   // Génération d'un faux code QR en SVG avec des éléments visuels améliorés
//   // Dans une implémentation réelle, vous utiliseriez une vraie bibliothèque QR
//   return `
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
//       <!-- Arrière-plan -->
//       <rect x="0" y="0" width="200" height="200" fill="#ffffff" />
      
//       <!-- Bordure externe avec dégradé -->
//       <rect x="5" y="5" width="190" height="190" fill="none" stroke="url(#borderGradient)" stroke-width="3" rx="10" ry="10" />

import { QRCodeParams } from '@/types/type';
import CryptoJS from 'crypto-js';

/**
 * Génère un code QR avancé avec des fonctionnalités de sécurité.
 * Cette implémentation est simulée avec un SVG - dans une application réelle, 
 * utilisez une bibliothèque dédiée comme 'qrcode' ou 'react-native-qrcode-svg'.
 */
export const generateAdvancedQRCode = (params: QRCodeParams): string => {
  const { contractId, propertyTitle, tenantName, startDate, endDate } = params;
  
  // Création d'une chaîne de données encodée pour le QR code
  const qrData = `CONTRACT:${contractId}|PROP:${propertyTitle}|TENANT:${tenantName}|START:${startDate}|END:${endDate}`;

  // Chiffrer les données avec AES pour plus de sécurité (clé secrète ici "mySecretKey")
  const encryptedData = CryptoJS.AES.encrypt(qrData, 'mySecretKey').toString();

  // Convertir la donnée en hachage pour une représentation plus compacte
  const hash = CryptoJS.SHA256(encryptedData).toString(CryptoJS.enc.Base64);

  // Simuler un code QR en SVG avec un design personnalisé
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4CAF50; stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2196F3; stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Arrière-plan -->
      <rect x="0" y="0" width="200" height="200" fill="#ffffff" rx="10" ry="10" />

      <!-- Bordure externe avec dégradé -->
      <rect x="5" y="5" width="190" height="190" fill="none" stroke="url(#borderGradient)" stroke-width="5" rx="10" ry="10" />

      <!-- Faux QR Code (ici on représente simplement les données hachées sous forme de texte) -->
      <text x="10" y="100" font-family="Arial" font-size="10" fill="#000000">
        ${hash.substring(0, 16)}
      </text>
    </svg>
  `;
};
