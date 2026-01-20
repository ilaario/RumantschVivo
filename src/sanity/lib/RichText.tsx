'use client';

import { PortableText, type PortableTextComponents } from '@portabletext/react';

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="rt-p">{children}</p>,
    h1: ({ children }) => <h1 className="rt-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="rt-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="rt-h3">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="rt-quote">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="rt-ul">{children}</ul>,
    number: ({ children }) => <ol className="rt-ol">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="rt-li">{children}</li>,
    number: ({ children }) => <li className="rt-li">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = (value as any)?.href ?? '#';
      return (
        <a href={href} target="_blank" rel="noreferrer" className="rt-link">
          {children}
        </a>
      );
    },
  },
};

export function RichText({ value }: { value: any }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
