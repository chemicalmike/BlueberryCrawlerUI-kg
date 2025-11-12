import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

export type Classification = 'seed' | 'lnp' | 'peripheral' | 'unclassified';
export type NodeType = 'seed' | 'expanded' | 'reference';
export type EdgeType = 'cites' | 'expands_to';

// Fix: Add ResearchDomain enum as it was used in mockData.ts but not defined.
export enum ResearchDomain {
  ComputerScience = 'Computer Science',
  Biology = 'Biology',
  Physics = 'Physics',
  Chemistry = 'Chemistry',
}

export interface NodeData extends SimulationNodeDatum {
  id: string;
  type: NodeType;
  title: string;
  doi?: string;
  year?: number;
  authors?: string[];
  classification: Classification;
  depth_level?: number;
  // Fix: Add properties that were used in mockData.ts but missing from the type definition.
  abstract?: string;
  domain?: ResearchDomain;
  centrality?: number;
}

export interface EdgeData extends SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  type: EdgeType;
}

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}
