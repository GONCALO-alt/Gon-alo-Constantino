import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

/** Converte \( \) e \[ \] (formato LaTeX alternativo) para $ e $$. */
function normalizeMath(text: string): string {
  return text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, inner: string) => `\n$$${inner}$$\n`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, inner: string) => `$${inner}$`);
}

export const Markdown = memo(function Markdown({ text, compact, streaming }: { text: string; compact?: boolean; streaming?: boolean }) {
  return (
    <div className={`md ${compact ? 'compact' : ''} ${streaming ? 'cursor-blink' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {normalizeMath(text)}
      </ReactMarkdown>
    </div>
  );
});

/** Texto simples a partir de Markdown (para pré-visualizações). */
export function plainText(md: string, max = 200): string {
  const t = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' … ')
    .replace(/[#>*_`|~-]+/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
