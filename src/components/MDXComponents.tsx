import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

const MDXComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="mb-4 font-bold text-4xl">{children}</h1>
  ),

  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 font-semibold text-3xl">{children}</h2>
  ),

  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mb-2 font-medium text-2xl">{children}</h3>
  ),

  p: ({ children }: { children: React.ReactNode }) => {
    if (typeof children === "string") {
      return <p className="mb-4">{children}</p>;
    }
    return <>{children}</>;
  },

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
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => {
    const language = className ? className.replace(/language-/, "") : "";
    if (typeof children === "string") {
      return (
        <SyntaxHighlighter language={language} style={dracula} PreTag="div">
          {children.trim()}
        </SyntaxHighlighter>
      );
    }
    return <code className={className}>{children}</code>;
  },

  pre: ({ children }: { children: React.ReactNode }) => {
    if (React.isValidElement(children) && children.type === "code") {
      return children;
    }
    return (
      <pre className="bg-gray-100/10 my-4 p-4 rounded overflow-x-auto">
        {children}
      </pre>
    );
  },
};

export default MDXComponents;
