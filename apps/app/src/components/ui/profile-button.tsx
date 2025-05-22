import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

// Get initials for avatar fallback
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(part => part?.[0] || '')
        .join('')
        .toUpperCase();
};

export function ProfileButton() {
    const { data: session } = authClient.useSession();
    const user = session?.user;

    return (
        <Button asChild variant="ghost" size="icon" className="w-8 h-8 rounded-full p-0">
            <Link to="/profile">
                <Avatar className="h-7 w-7">
                    {
                    (user?.image) ? (
                        <AvatarImage src={user.image} alt={user.name} />
                    ) : (
                        <AvatarFallback className="bg-primary/10 text-xs">{getInitials(user?.name || "")}</AvatarFallback>
                    )
                    }
                </Avatar>
            </Link>
        </Button>

    );
}
