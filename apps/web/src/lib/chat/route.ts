import { useRouter } from "@tanstack/react-router";

export function useCreateChat() {
    const router = useRouter();
    const createChat = async () => {
        router.navigate({
            to: "/chat",
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
