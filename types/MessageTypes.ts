
export interface MessageType {
    id: string;
    type: "text" | "image" | "video" | "audio" | "document";
    content: string;
    timestamp: number;
    isSent: boolean;
    status: "sent" | "read"; 
    sender: {
        name: string;
        avatar: string;
    };
    reactions?: { [emoji: string]: number }; // Ex: { "❤️": 3, "😂": 1 }
    isEdited?: boolean; // Pour indiquer si le message a été modifié
    isDeleted?: boolean; // Pour marquer un message comme supprimé
}
