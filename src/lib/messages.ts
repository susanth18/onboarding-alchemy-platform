import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "employee_documents";
const FOLDER_NAME = "messages";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export const getConversationId = (hrId: string, employeeId: string) => `${hrId}_${employeeId}`;

export const getMessages = async (hrId: string, employeeId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(`${FOLDER_NAME}/${getConversationId(hrId, employeeId)}.json`);

    if (error) {
      // If file doesn't exist, return empty array
      return [];
    }

    const text = await data.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (hrId: string, employeeId: string, message: Message): Promise<boolean> => {
  try {
    const messages = await getMessages(hrId, employeeId);
    messages.push(message);

    const blob = new Blob([JSON.stringify(messages)], { type: "application/json" });
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${FOLDER_NAME}/${getConversationId(hrId, employeeId)}.json`, blob, {
        upsert: true,
        contentType: "application/json",
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};
