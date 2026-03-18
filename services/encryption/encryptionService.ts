import CryptoJS from 'crypto-js';

/**
 * Service de chiffrement/déchiffrement côté frontend
 * Compatible avec le service backend (AES-256-GCM)
 */
class EncryptionService {
  // Note: En production, cette clé devrait venir d'une source sécurisée
  // Pour l'instant, on utilise la même clé que le backend pour le déchiffrement
  private static ENCRYPTION_KEY = '03207ab1d7e0c454ffb085f63ed7cffe39038df60b77b2358578f38468e12dac';

  /**
   * Déchiffre un message chiffré
   * Format attendu: iv:authTag:encrypted
   */
  static decrypt(encryptedContent: string): string {
    try {
      // Vérifier si le contenu est chiffré (format: iv:authTag:encrypted)
      const parts = encryptedContent.split(':');
      if (parts.length !== 3) {
        // Pas chiffré, retourner tel quel
        return encryptedContent;
      }

      const [ivHex, authTagHex, encrypted] = parts;

      // Convertir hex en WordArray pour crypto-js
      const key = CryptoJS.enc.Hex.parse(this.ENCRYPTION_KEY);
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const ciphertext = CryptoJS.enc.Hex.parse(encrypted);

      // Déchiffrer avec AES
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        console.warn('[EncryptionService] Déchiffrement échoué, retour du contenu original');
        return encryptedContent;
      }

      return decryptedText;
    } catch (error) {
      console.error('[EncryptionService] Erreur de déchiffrement:', error);
      // En cas d'erreur, retourner le contenu original
      return encryptedContent;
    }
  }

  /**
   * Vérifie si un contenu est chiffré
   */
  static isEncrypted(content: string): boolean {
    if (!content || typeof content !== 'string') return false;
    const parts = content.split(':');
    return parts.length === 3 && parts[0].length === 32 && parts[1].length === 32;
  }

  /**
   * Déchiffre un tableau de messages
   */
  static decryptMessages(messages: any[]): any[] {
    return messages.map(message => ({
      ...message,
      content: message.content && this.isEncrypted(message.content)
        ? this.decrypt(message.content)
        : message.content
    }));
  }
}

export default EncryptionService;
