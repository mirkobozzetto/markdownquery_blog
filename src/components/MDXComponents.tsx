import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { z } from "zod";

const MDXComponentsSchema = z.object({
  // Par exemple : textColor: z.enum(['light', 'dark']).optional(),
  img: z.object({
    src: z.string(),
    alt: z.string(),
  }),
  a: z.object({
    href: z.string(),
    children: z.string(),
  }),
});

type MDXComponentsProps = z.infer<typeof MDXComponentsSchema>;

const MDXComponents = ({}: MDXComponentsProps) => {
  return {
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="mb-4 font-bold text-4xl">{children}</h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="mb-3 font-semibold text-3xl">{children}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="mb-2 font-medium text-2xl">{children}</h3>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-4">{children}</p>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="mb-4 list-disc list-inside">{children}</ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="mb-4 list-decimal list-inside">{children}</ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-2">{children}</li>
    ),
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <a href={href} className="text-blue-500 hover:underline">
        {children}
      </a>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-gray-300 my-4 pl-4 border-l-4 italic">
        {children}
      </blockquote>
    ),
    code: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => {
      const language = className ? className.replace(/language-/, "") : "";
      return (
        <SyntaxHighlighter language={language} style={dracula}>
          {children as string}
        </SyntaxHighlighter>
      );
    },
    pre: ({ children }: { children: React.ReactNode }) => (
      <pre className="bg-gray-100/10 my-4 p-4 rounded overflow-x-auto">
        {children}
      </pre>
    ),
  };
};

export default MDXComponents;
