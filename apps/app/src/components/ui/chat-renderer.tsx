import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface MessageRendererProps {
  content: string;
  className?: string;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, className }) => {
  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Style code blocks
          code({ inline, className, children, ...props }) {
            return (
              <code
                className={cn(
                  "bg-gray-100 px-1 py-0.5 rounded text-sm",
                  inline ? "text-pink-500" : "block p-2 my-1",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Style links
          a({ className, children, ...props }) {
            return (
              <a
                className={cn("text-blue-600 hover:text-blue-800 underline", className)}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageRenderer;
