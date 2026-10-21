import React, { useMemo } from 'react';
import katex from 'katex';
import { marked } from 'marked';

interface MathViewProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

// Configure marked for clean, safe output with line breaks
marked.setOptions({
  gfm: true,
  breaks: true, // Converts single \n to <br> for natural conversational responses
});

export const MathView: React.FC<MathViewProps> = ({ content, className = '', displayMode = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If displayMode is true and content is purely a formula
    if (displayMode) {
      try {
        const cleanFormula = content.replace(/^(\$\$|\\\[)|(\$\$|\\\])$/g, '').trim();
        return katex.renderToString(cleanFormula, { displayMode: true, throwOnError: false });
      } catch {
        return `<div class="font-mono text-sm">${content}</div>`;
      }
    }

    try {
      // 1. EXTRACT AND PROTECT LATEX BLOCKS AND INLINE FORMULAS
      const mathTokens: string[] = [];
      const createToken = (mathHtml: string) => {
        const index = mathTokens.length;
        mathTokens.push(mathHtml);
        return `@@KATEX_TOKEN_${index}@@`;
      };

      let textToParse = content;

      // Replace \[ ... \]
      textToParse = textToParse.replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
          return createToken(`<div class="katex-display-wrapper my-2.5 overflow-x-auto">${rendered}</div>`);
        } catch {
          return createToken(`<div class="font-mono text-sm p-2 bg-amber-50 rounded">${formula}</div>`);
        }
      });

      // Replace $$ ... $$
      textToParse = textToParse.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
          return createToken(`<div class="katex-display-wrapper my-2.5 overflow-x-auto">${rendered}</div>`);
        } catch {
          return createToken(`<div class="font-mono text-sm p-2 bg-amber-50 rounded">${formula}</div>`);
        }
      });

      // Replace \( ... \)
      textToParse = textToParse.replace(/\\\(([\s\S]*?)\\\)/g, (_, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
          return createToken(`<span class="katex-inline-wrapper">${rendered}</span>`);
        } catch {
          return createToken(`<span class="font-mono text-sm">${formula}</span>`);
        }
      });

      // Replace $ ... $
      textToParse = textToParse.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (_, prefix, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
          return `${prefix}${createToken(`<span class="katex-inline-wrapper">${rendered}</span>`)}`;
        } catch {
          return `${prefix}${createToken(`<span class="font-mono text-sm">${formula}</span>`)}`;
        }
      });

      // 2. PARSE MARKDOWN WITH MARKED
      // This properly parses # headings, **bold**, *italic*, - bullet lists, 1. numbered lists, code blocks, tables
      let parsedHtml = marked.parse(textToParse) as string;

      // 3. RESTORE MATH TOKENS
      mathTokens.forEach((mathHtml, idx) => {
        // marked might wrap the token in <p> if it's standalone, handle both
        parsedHtml = parsedHtml.replace(new RegExp(`@@KATEX_TOKEN_${idx}@@`, 'g'), mathHtml);
      });

      return parsedHtml;
    } catch (e) {
      console.warn('MathView parsing notice:', e);
      return content;
    }
  }, [content, displayMode]);

  return (
    <div 
      className={`prose-math leading-relaxed text-slate-800 ${className}`} 
      dangerouslySetInnerHTML={{ __html: renderedHtml }} 
    />
  );
};
