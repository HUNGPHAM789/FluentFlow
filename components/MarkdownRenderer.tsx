// --- components/MarkdownRenderer.tsx ---
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
            // Customizing how headings look to match FluentFlow brand
            h2: ({node, ...props}) => <h2 className="section-title" {...props} />,
            h3: ({node, ...props}) => <h3 className="sub-section-title" {...props} />,
            // Customizing list items for better readability
            li: ({node, ...props}) => <li className="list-item" {...props} />,
            // Links
            a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
            // Blockquotes
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-slate-500 my-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;