import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Upload de fichiers génériques (documents/pièces jointes) — pas de logique
 * métier ici, juste le transport vers POST /api/upload/documents (multer +
 * Cloudinary resource_type: 'raw' côté backend, voir
 * services/imageUploadService.ts::uploadRawFile). Utilisé par plusieurs
 * domaines indépendants (réservation, dossier propriétaire, documents de
 * propriété) — extrait ici pour éviter qu'ils dépendent les uns des autres
 * pour une simple fonction de transport.
 */
export async function uploadDocumentFile(
  localUri: string,
  fileName: string,
  mimeType: string
): Promise<{ fileUrl: string; fileName: string }> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.107:3000';
  const token = await AsyncStorage.getItem('@auth_access_token') ||
      await AsyncStorage.getItem('accessToken');

  const formData = new FormData();
  formData.append('document', {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await fetch(`${apiUrl}/api/upload/documents`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Échec du téléchargement du fichier');
  }

  return { fileUrl: result.fileUrl, fileName: result.fileName || fileName };
}
