import React from 'react';
import { NodeData, Classification } from '../types';

interface DetailPanelProps {
  node: NodeData | null;
}

const CLASSIFICATION_COLORS_BG: Record<Classification, string> = {
    seed: 'bg-blue-500',
    lnp: 'bg-green-500',
    peripheral: 'bg-orange-500',
    unclassified: 'bg-gray-500',
};

const DetailPanel: React.FC<DetailPanelProps> = ({ node }) => {
  if (!node) {
    return (
      <div className="absolute top-4 right-4 w-96 max-w-sm p-6 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 text-gray-400">
        <h3 className="text-lg font-semibold text-gray-200">No Paper Selected</h3>
        <p className="mt-2 text-sm">Click on a node in the graph to view its details.</p>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 w-96 max-w-sm h-[calc(100vh-2rem)] flex flex-col p-6 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 transition-all duration-300 ease-in-out">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-start">
            <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full capitalize ${CLASSIFICATION_COLORS_BG[node.classification]}`}>{node.classification}</span>
            {node.year && <span className="text-sm font-medium text-gray-400">{node.year}</span>}
        </div>
        <h2 className="text-xl font-bold mt-3 text-white">{node.title}</h2>
        {node.authors && node.authors.length > 0 && <p className="text-sm text-gray-400 mt-1">{node.authors.join(', ')}</p>}
        {node.doi && <p className="text-sm text-indigo-400 mt-1">DOI: {node.doi}</p>}
        <div className="w-full h-px bg-gray-700 my-4"></div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        <h4 className="text-md font-semibold text-gray-300">Details</h4>
        <ul className="mt-2 space-y-1 text-sm text-gray-400">
            <li><strong>Type:</strong> <span className="capitalize">{node.type}</span></li>
            {node.depth_level !== undefined && <li><strong>Crawl Depth:</strong> {node.depth_level}</li>}
            <li><strong>ID:</strong> <span className="break-all font-mono text-xs">{node.id}</span></li>
        </ul>
      </div>
    </div>
  );
};

export default DetailPanel;
