import { useRouter } from "@tanstack/react-router";
import { newChat } from "./api";

export function useCreateChat() {
    const router = useRouter();
    const createChat = async () => {
        const newChatId = await newChat();
        console.debug("New chat created with ID:", newChatId);

        // need to create a new chat
        if (!newChatId) {
            throw new Error("Failed to create a new chat");
        }

        router.navigate({
            to: "/chat/$id",
            params: { id: newChatId },
        });
    };

    return createChat;
}

export function useNavigateToChat() {
    const router = useRouter();

    const navigateToChat = (chatId: string) => {
        // Navigate to the chat with the given ID
        router.navigate({
            to: "/chat/$id",
            params: { id: chatId },
        });
    };

    return navigateToChat;
}
