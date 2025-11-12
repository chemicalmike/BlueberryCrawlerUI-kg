import React, { useState, useMemo, useEffect } from 'react';
import GraphViewer from './components/GraphViewer';
import DetailPanel from './components/DetailPanel';
import { GraphData } from './types';
import { generateMockData } from './data/mockData';

const App: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus('loading');
    // Simulate a network request by using a timeout
    const timer = setTimeout(() => {
        try {
            const mockData = generateMockData();
            setGraphData(mockData);
            setStatus('success');
        } catch (e) {
            console.error("Failed to generate mock data:", e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during data generation.');
            setStatus('error');
        }
    }, 1500); // Simulate a 1.5 second loading time

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const selectedNode = useMemo(() => {
    return graphData.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graphData.nodes]);

  const handleNodeClick = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg">Loading Knowledge Graph...</p>
                <p className="text-sm">Generating mock data for visualization...</p>
            </div>
        );
      case 'error':
        return (
            <div className="flex flex-col items-center justify-center w-full h-full text-red-400 text-center p-8">
                <h2 className="text-2xl font-bold">Failed to Load Graph Data</h2>
                <p className="mt-2 max-w-2xl bg-red-900 bg-opacity-30 p-4 rounded-lg">{error}</p>
            </div>
        );
      case 'success':
        return (
            <GraphViewer 
                nodes={graphData.nodes} 
                edges={graphData.edges}
                selectedNodeId={selectedNodeId}
                onNodeClick={handleNodeClick}
            />
        );
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
        <header className="absolute top-4 left-4 z-10 p-2 bg-gray-800 bg-opacity-50 rounded-lg">
            <h1 className="text-2xl font-bold text-white">Semantic Discovery Viewer</h1>
            <p className="text-sm text-gray-400">Blueberry LNP Knowledge Crawler</p>
        </header>
        
        <main className="w-full h-full">
            {renderContent()}
        </main>
        
        {status === 'success' && <DetailPanel node={selectedNode} />}
    </div>
  );
};

export default App;
