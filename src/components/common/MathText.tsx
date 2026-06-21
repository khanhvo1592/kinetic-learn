import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
  allowHtml?: boolean;
}

function renderMathSegments(text: string) {
  const segments: Array<{ type: 'text' | 'math'; value: string; displayMode?: boolean }> = [];
  const pattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      segments.push({ type: 'text', value: text.slice(cursor, match.index) });
    }

    const token = match[0];
    const displayMode = token.startsWith('$$') || token.startsWith('\\[');
    const value = token.startsWith('$$')
      ? token.slice(2, -2)
      : token.startsWith('$')
        ? token.slice(1, -1)
        : token.startsWith('\\[')
          ? token.slice(2, -2)
          : token.slice(2, -2);

    segments.push({ type: 'math', value, displayMode });
    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    segments.push({ type: 'text', value: text.slice(cursor) });
  }

  return segments;
}

export default function MathText({ text, className = '', allowHtml = false }: MathTextProps) {
  const segments = useMemo(() => renderMathSegments(text || ''), [text]);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'math') {
          try {
            const html = katex.renderToString(segment.value, {
              displayMode: segment.displayMode,
              throwOnError: false,
              strict: false,
            });
            return (
              <span
                key={index}
                className={segment.displayMode ? 'block my-3 overflow-x-auto' : 'inline-block align-baseline'}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={index}>{segment.value}</span>;
          }
        }

        if (allowHtml) {
          return <span key={index} dangerouslySetInnerHTML={{ __html: segment.value }} />;
        }

        return <React.Fragment key={index}>{segment.value}</React.Fragment>;
      })}
    </span>
  );
}
