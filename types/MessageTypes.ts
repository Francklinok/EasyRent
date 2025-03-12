

export interface MessageType {
    id: string; // Identifiant unique du message
    type: "text" | "image" | "video" | "audio" | "document"; // Type de contenu
    content: string; // URL du fichier ou texte brut
    senderId: string; // Identifiant de l'expéditeur
    timestamp: number; // Timestamp du message (Date en millisecondes)
    isSent: boolean; // True si le message est envoyé par l'utilisateur actuel
}
