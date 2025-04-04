

import { QRCodeParams } from '@/types/type';
import CryptoJS from 'crypto-js';

/**
 * Génère un code QR avancé avec des fonctionnalités de sécurité.
 * Cette implémentation est simulée avec un SVG - dans une application réelle, 
 * utilisez une bibliothèque dédiée comme 'qrcode' ou 'react-native-qrcode-svg'.
 * 
 * @param params - Paramètres du contrat pour générer le QR code
 * @returns Une chaîne SVG représentant un QR code simulé
 */
export const generateAdvancedQRCode = (params: QRCodeParams): string => {
  const { contractId, propertyTitle, tenantName, startDate, endDate } = params;
  
  // Création d'une chaîne de données structurée au format JSON
  const contractData = {
    id: contractId,
    property: propertyTitle,
    tenant: tenantName,
    validity: {
      from: startDate,
      to: endDate
    },
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  // Convertir en JSON
  const jsonData = JSON.stringify(contractData);
  
  // Chiffrer les données avec AES pour plus de sécurité
  // Dans une vraie application, cette clé devrait être stockée de façon sécurisée
  const encryptionKey = process.env.QR_ENCRYPTION_KEY || 'defaultSecretKey';
  const encryptedData = CryptoJS.AES.encrypt(jsonData, encryptionKey).toString();
  
  // Calculer une signature pour la vérification d'intégrité
  const signature = CryptoJS.HmacSHA256(encryptedData, encryptionKey).toString(CryptoJS.enc.Hex);
  
  // Générer une représentation visuelle plus réaliste d'un QR code
  return generateQRCodeSVG(encryptedData, signature, contractId);
};

/**
 * Génère une représentation SVG d'un QR code
 * @param data - Données chiffrées
 * @param signature - Signature pour vérification
 * @param contractId - ID du contrat pour personnalisation
 * @returns SVG du QR code
 */
const generateQRCodeSVG = (data: string, signature: string, contractId: string): string => {
  // Créer un motif de QR code simulé basé sur les données
  const cells = generateQRPattern(data, signature);
  const cellSize = 5;
  const margin = 20;
  const size = cells.length * cellSize + 2 * margin;
  
  let svgContent = '';
  
  // Générer les cellules du QR code
  for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
      if (cells[y][x]) {
        svgContent += `<rect x="${x * cellSize + margin}" y="${y * cellSize + margin}" width="${cellSize}" height="${cellSize}" fill="#000" />`;
      }
    }
  }
  
  // Ajouter les motifs de positionnement (les trois carrés dans les coins)
  const positionPatterns = generatePositionPatterns(margin, cellSize);
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <defs>
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4CAF50; stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2196F3; stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3" />
        </filter>
      </defs>

      <!-- Arrière-plan avec ombre -->
      <rect x="0" y="0" width="${size}" height="${size}" fill="#ffffff" rx="15" ry="15" filter="url(#shadow)" />
      
      <!-- Bordure externe avec dégradé -->
      <rect x="5" y="5" width="${size - 10}" height="${size - 10}" fill="none" stroke="url(#borderGradient)" stroke-width="4" rx="12" ry="12" />
      
      <!-- Logo ou identifiant au centre (optionnel) -->
      <circle cx="${size/2}" cy="${size/2}" r="12" fill="url(#borderGradient)" />
      <text x="${size/2}" y="${size/2 + 4}" font-family="Arial" font-size="8" fill="white" text-anchor="middle">ID</text>
      
      <!-- Cellules du QR Code -->
      ${svgContent}
      
      <!-- Motifs de positionnement -->
      ${positionPatterns}
      
      <!-- Information de validation -->
      <text x="${size/2}" y="${size - 8}" font-family="Arial" font-size="6" fill="#555" text-anchor="middle">
        Contract #${contractId.substring(0, 8)}
      </text>
    </svg>
  `;
};

/**
 * Génère un motif de QR Code simulé basé sur les données
 * Dans un système réel, vous utiliseriez une bibliothèque QR
 */
const generateQRPattern = (data: string, signature: string): boolean[][] => {
  // Créer un pseudo-pattern basé sur le hash des données
  const combinedData = data + signature;
  const hash = CryptoJS.SHA256(combinedData).toString();
  
  // Créer une matrice 25x25 qui semble être un QR code
  const size = 25;
  const pattern: boolean[][] = Array(size).fill(0).map(() => Array(size).fill(false));
  
  // Réserver les coins pour les motifs de positionnement
  const reservedAreas = [
    { x: 0, y: 0, size: 7 },  // Coin supérieur gauche
    { x: size - 7, y: 0, size: 7 },  // Coin supérieur droit
    { x: 0, y: size - 7, size: 7 }   // Coin inférieur gauche
  ];
  
  // Remplir la matrice avec un motif basé sur le hash
  for (let i = 0; i < hash.length; i++) {
    const value = parseInt(hash[i], 16);
    const x = (i * 3) % size;
    const y = Math.floor((i * 3) / size) % size;
    
    // Vérifier si ce n'est pas dans une zone réservée
    if (!isInReservedArea(x, y, reservedAreas)) {
      pattern[y][x] = (value % 2 === 1);
      
      // Ajouter quelques cellules adjacentes pour un aspect plus réaliste
      if (x + 1 < size && !isInReservedArea(x + 1, y, reservedAreas)) {
        pattern[y][x + 1] = (value % 3 === 1);
      }
      if (y + 1 < size && !isInReservedArea(x, y + 1, reservedAreas)) {
        pattern[y + 1][x] = (value % 4 === 1);
      }
    }
  }
  
  return pattern;
};

/**
 * Vérifie si une coordonnée est dans une zone réservée
 */
const isInReservedArea = (x: number, y: number, areas: {x: number, y: number, size: number}[]): boolean => {
  return areas.some(area => 
    x >= area.x && x < area.x + area.size && 
    y >= area.y && y < area.y + area.size
  );
};

/**
 * Génère les motifs de positionnement SVG pour les coins du QR code
 */
const generatePositionPatterns = (margin: number, cellSize: number): string => {
  const size = 7 * cellSize;
  
  // Créer les motifs aux trois coins
  const topLeft = createPositionPattern(margin, margin, cellSize);
  const topRight = createPositionPattern(margin + 18 * cellSize, margin, cellSize);
  const bottomLeft = createPositionPattern(margin, margin + 18 * cellSize, cellSize);
  
  return topLeft + topRight + bottomLeft;
};

/**
 * Crée un motif de positionnement dans un coin
 */
const createPositionPattern = (x: number, y: number, cellSize: number): string => {
  return `
    <!-- Carré externe -->
    <rect x="${x}" y="${y}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#000" />
    
    <!-- Carré blanc intermédiaire -->
    <rect x="${x + cellSize}" y="${y + cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#fff" />
    
    <!-- Carré noir central -->
    <rect x="${x + 2 * cellSize}" y="${y + 2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#000" />
  `;
};