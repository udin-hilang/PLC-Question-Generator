import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from './Mermaid';

const MarkdownRenderer = ({ content }) => {
  console.log('MarkdownRenderer content:', content);

  const components = {
    code({ node, className, children, ...props }) {
      console.log('Rendering code block. className:', className, 'children:', String(children));
      
      const match = /language-mermaid/.exec(className || '');
      
      if (match) {
        console.log('Mermaid block detected!');
        const chartContent = String(children).trim();
        return <Mermaid chart={chartContent} />;
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    table({ children }) {
      console.log('Rendering table');
      return <div className="table-responsive"><table className="markdown-table">{children}</table></div>;
    },
    th({ children }) {
      return <th>{children}</th>;
    },
    td({ children }) {
      return <td>{children}</td>;
    }
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
