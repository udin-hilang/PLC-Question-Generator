import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

const Mermaid = ({ chart }) => {
  const ref = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart) return;
      
      try {
        // Use a stable but unique ID
        const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
        
        // Important: render to SVG string first
        const { svg } = await mermaid.render(id, chart);
        
        if (isMounted && ref.current) {
          setError(null);
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to render flowchart');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="mermaid-wrapper">
      {error ? (
        <div className="mermaid-error">
          <strong>Flowchart Error:</strong> {error}
          <pre style={{ fontSize: '0.7rem', marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px' }}>{chart}</pre>
        </div>
      ) : (
        <div ref={ref} className="mermaid-container" />
      )}
    </div>
  );
};

export default Mermaid;
