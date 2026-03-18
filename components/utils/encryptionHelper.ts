/**
 * Helper pour déchiffrer les messages côté frontend
 * Note: Le déchiffrement réel se fait côté backend, cette fonction
 * vérifie simplement si le message est chiffré et retourne le contenu approprié
 */

/**
 * Vérifie si un contenu est chiffré (format: iv:authTag:encrypted)
 */
export function isEncrypted(content: string | null | undefined): boolean {
  if (!content || typeof content !== 'string') return false;

  const parts = content.split(':');
  // Format chiffré: iv:authTag:encrypted (3 parties en hexadécimal)
  return parts.length === 3 &&
         /^[0-9a-f]+$/i.test(parts[0]) &&
         /^[0-9a-f]+$/i.test(parts[1]);
}

/**
 * Retourne un aperçu du message pour la ChatList
 * Si le message est chiffré et n'a pas pu être déchiffré, affiche un placeholder
 */
export function getMessagePreview(content: string | null | undefined, maxLength: number = 50): string {
  if (!content) return 'Aucun message';

  // Si le message est chiffré (le backend devrait normalement déchiffrer)
  if (isEncrypted(content)) {
    return '🔒 Message chiffré';
  }

  // Tronquer le message si trop long
  if (content.length > maxLength) {
    return content.substring(0, maxLength) + '...';
  }

  return content;
}

/**
 * Détecte le type de message pour afficher une icône/texte approprié dans la preview
 */
export function getMessageTypePreview(messageType: string | null | undefined, content: string | null | undefined): string {
  if (!messageType || messageType === 'text') {
    return getMessagePreview(content);
  }

  const typeMap: Record<string, string> = {
    'image': '📷 Photo',
    'video': '🎥 Vidéo',
    'audio': '🎵 Audio',
    'document': '📄 Document',
    'location': '📍 Position',
    'contact': '👤 Contact',
    'voice': '🎤 Message vocal',
  };

  return typeMap[messageType.toLowerCase()] || getMessagePreview(content);
}
