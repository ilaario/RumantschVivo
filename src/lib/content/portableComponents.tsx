import React from 'react';
import Link from 'next/link';
import { PortableText, type PortableTextComponents } from '@portabletext/react';

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className="lesson-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="lesson-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="lesson-h3">{children}</h3>,
    normal: ({ children }) => <p className="lesson-p">{children}</p>,
    blockquote: ({ children }) => <blockquote className="lesson-quote">{children}</blockquote>,
  },

  list: {
    bullet: ({ children }) => <ul className="lesson-ul">{children}</ul>,
    number: ({ children }) => <ol className="lesson-ol">{children}</ol>,
  },

  listItem: {
    bullet: ({ children }) => <li className="lesson-li">{children}</li>,
    number: ({ children }) => <li className="lesson-li">{children}</li>,
  },

  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code className="lesson-code">{children}</code>,
    link: ({ value, children }) => {
      const href = value?.href as string | undefined;
      if (!href) return <>{children}</>;

      const isExternal = /^https?:\/\//.test(href);
      if (isExternal) {
        return (
          <a href={href} target="_blank" rel="noreferrer" className="lesson-a">
            {children}
          </a>
        );
      }

      return (
        <Link href={href} className="lesson-a">
          {children}
        </Link>
      );
    },
  },
};

export function PortableBlocks({ value }: { value: any }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return <PortableText value={value} components={components} />;
}
