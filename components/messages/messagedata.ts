
import { MessageType } from "@/types/MessageTypes";

const message: MessageType[] = [
  { id: "1", type: "text", content: "Salut !", timestamp: Date.now(), isSent: false, status: "read", sender: { name: "Alice", avatar: "https://example.com/avatar1.jpg" } },
  { id: "2", type: "text", content: "Comment ça va ?", timestamp: Date.now(), isSent: true, status: "sent", sender: { name: "Bob", avatar: "https://example.com/avatar2.jpg" } },
];
export default message;