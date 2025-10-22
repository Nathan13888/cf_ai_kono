import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
    component: LandingPage,
});

function LandingPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleWaitlistSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement waitlist signup
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen overflow-x-hidden overflow-y-auto scrollbar-hide bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/10 backdrop-blur-lg bg-white/60 dark:bg-slate-900/60">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-label="Kono.Chat logo"
                                >
                                    <title>Kono.Chat logo</title>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                                Kono
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-sm transition-colors text-muted-foreground hover:text-foreground"
                            >
                                Sign In
                            </Link>
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl animate-pulse" />
                <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 blur-3xl animate-pulse" />
                <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 blur-3xl" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 mb-8 border rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                            <span
                                className="text-sm font-medium text-blue-600 cursor-pointer dark:text-blue-400"
                                onClick={() =>
                                    document
                                        .getElementById("waitlist")
                                        ?.scrollIntoView({ behavior: "smooth" })
                                }
                            >
                                Now in Closed Beta
                            </span>
                        </div>

                        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
                            <span className="block">Chat with</span>
                            <span className="block text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text">
                                AI Agents
                            </span>
                            <span className="block">that get things done</span>
                        </h1>

                        <p className="max-w-3xl mx-auto mb-10 text-xl text-muted-foreground">
                            Kono brings you intelligent AI agents that don't
                            just chat—they take action. From research to
                            automation, experience the future of AI-driven
                            productivity.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 mb-16 sm:flex-row">
                            <Button
                                size="lg"
                                className="px-8 py-3 text-lg text-white shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25"
                            >
                                Join Waitlist
                            </Button>
                        </div>

                        {/* Hero visualization */}
                        <div className="relative max-w-5xl mx-auto">
                            <div className="absolute inset-0 transform bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl rotate-1" />
                            <Card className="relative shadow-2xl backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-white/20">
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                                                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                                                <svg
                                                    className="w-6 h-6 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-label="Checkmark icon"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="mb-2 font-semibold">
                                                Research Agent
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Gathers comprehensive
                                                information from multiple
                                                sources
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                                                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                                                <svg
                                                    className="w-6 h-6 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-label="Lightning bolt icon"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="mb-2 font-semibold">
                                                Action Agent
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Executes tasks and automations
                                                across platforms
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                                                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                                                <svg
                                                    className="w-6 h-6 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-label="Light bulb icon"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="mb-2 font-semibold">
                                                Creative Agent
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Generates content, ideas, and
                                                creative solutions
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-20">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                            How is{" "}
                            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                                Kono
                            </span>{" "}
                            different?
                        </h2>
                        <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
                            Experience the next generation of agent
                            collaboration that understands context deeply and
                            take meaningful action.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                id: "context",
                                icon: "🧠",
                                title: "Intelligent Context",
                                description:
                                    "Our agents understand the full context of your conversations and remember what matters most.",
                            },
                            {
                                id: "speed",
                                icon: "⚡",
                                title: "Lightning Fast",
                                description:
                                    "Get instant responses and actions without the wait. Our agents are optimized for speed and efficiency.",
                            },
                            {
                                id: "privacy",
                                icon: "🔒",
                                title: "Privacy First",
                                description:
                                    "Your conversations are encrypted and secure. We never store or share your personal data.",
                            },
                            {
                                id: "goal",
                                icon: "🎯",
                                title: "Goal-Oriented",
                                description:
                                    "Tell our agents what you want to achieve, and they'll create a plan to get you there.",
                            },
                            {
                                id: "connected",
                                icon: "🌐",
                                title: "Connected",
                                description:
                                    "Integrate with your favorite tools and platforms for seamless workflow automation.",
                            },
                            {
                                id: "learning",
                                icon: "📈",
                                title: "Always Learning",
                                description:
                                    "Our agents continuously improve and adapt to provide better assistance over time.",
                            },
                        ].map((feature) => (
                            <Card
                                key={feature.id}
                                className="transition-all duration-300 backdrop-blur-lg bg-white/60 dark:bg-slate-900/60 border-white/20 hover:shadow-lg hover:scale-105"
                            >
                                <CardHeader>
                                    <div className="mb-4 text-4xl">
                                        {feature.icon}
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Waitlist Section */}
            <section className="relative py-20">
                <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
                    <div className="p-12 border shadow-2xl backdrop-blur-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/80 dark:to-slate-800/60 rounded-3xl border-white/20">
                        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                            Ready to experience the future?
                        </h2>
                        <p className="max-w-2xl mx-auto mb-8 text-xl text-muted-foreground">
                            Join hundreds of early adopters who are already
                            transforming their workflow with AI agents. Get
                            exclusive early access to Kono.Chat.
                        </p>

                        <form
                            id="waitlist"
                            onSubmit={handleWaitlistSubmit}
                            className="max-w-md mx-auto"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg dark:border-gray-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    disabled={isSubmitted}
                                >
                                    {isSubmitted
                                        ? "✓ Joined!"
                                        : "Join Waitlist"}
                                </Button>
                            </div>
                        </form>

                        <p className="mt-4 text-sm text-muted-foreground">
                            🎉 Limited spots available. Only used for waitlist.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 backdrop-blur-lg bg-white/60 dark:bg-slate-900/60">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <div className="flex items-center mb-4 space-x-2 md:mb-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-label="Kono.Chat logo"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                                Kono
                            </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <a
                                href="/privacy"
                                className="transition-colors hover:text-foreground"
                            >
                                Privacy
                            </a>
                            <a
                                href="/terms"
                                className="transition-colors hover:text-foreground"
                            >
                                Terms
                            </a>
                            <a
                                href="/contact"
                                className="transition-colors hover:text-foreground"
                            >
                                Contact
                            </a>
                        </div>
                    </div>
                    <div className="pt-8 mt-8 text-sm text-center border-t border-white/10 text-muted-foreground">
                        <p>© 2024 Kono.Chat. The future of AI conversation.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
