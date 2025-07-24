import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MemoizedMarkdown({
    markdown,
    className,
    ...props
}: React.HTMLProps<HTMLDivElement> & {
    markdown: string;
}) {
    return (
        <div
            className={cn(
                "prose-sm prose max-w-none dark:prose-invert",
                className,
            )}
            {...props}
        >
            <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="mt-6 mb-4 text-3xl font-bold">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mt-5 text-2xl font-semibold">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-4 mb-2 text-xl font-medium">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="mt-3 mb-1 text-lg font-semibold">
                            {children}
                        </h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="mt-2 mb-1 font-semibold text-md">
                            {children}
                        </h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="mt-1 mb-1 font-semibold text-md">
                            {children}
                        </h6>
                    ),
                    p: ({ children }) => (
                        <p className="font-normal leading-relaxed text-md">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className=" space-y-1 pl-0 list-disc list-inside [&>li]:marker:text-accent-foreground">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="pl-6 space-y-1 list-decimal">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="pl-0.5 leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                        // TODO: improve styling
                        <blockquote className="pl-4 my-3 italic border-l-4 border-gray-300">
                            {children}
                        </blockquote>
                    ),
                    code: ({ children }) => (
                        // TODO: special code block
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className="p-3 overflow-x-auto bg-gray-100 rounded-md dark:bg-gray-800">
                            {children}
                        </pre>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            {children}
                        </a>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                }}
            >
                {markdown}
            </Markdown>
        </div>
    );
}
