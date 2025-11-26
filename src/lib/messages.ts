import { api } from "@/lib/api";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export const getMessages = async (hrId: string, employeeId: string): Promise<Message[]> => {
  try {
    return await api.getMessages(hrId, employeeId);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (hrId: string, employeeId: string, message: Message): Promise<boolean> => {
  try {
    // Backend API handles saving, we pass the data
    // We need recipientId. If sender is HR, recipient is Employee, and vice versa.
    // But the `message` object already contains senderId.
    // The function signature `sendMessage(hrId, employeeId, message)` is slightly weird given the message object
    // Let's adapt.
    
    // Check who is the recipient
    const recipientId = message.senderId === hrId ? employeeId : hrId;
    
    return await api.sendMessage({
        senderId: message.senderId,
        recipientId: recipientId,
        senderName: message.senderName,
        content: message.content
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};
