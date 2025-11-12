import { GraphData, NodeData, EdgeData, Classification, NodeType, EdgeType } from '../types';

const TITLES = [
  'Lipid Nanoparticles for mRNA Delivery',
  'Advancements in Cationic Lipids for Gene Therapy',
  'PEGylation of Nanoparticles to Improve Circulation Time',
  'Structural Analysis of Self-Assembled Lipid Systems',
  'Targeted Drug Delivery Using Functionalized Liposomes',
  'The Role of Helper Lipids in LNP Stability',
  'Microfluidic Synthesis of Monodisperse Nanoparticles',
  'In Vivo Efficacy of siRNA-Loaded LNPs',
  'Cryo-EM of Lipid Nanoparticle Morphologies',
  'Biodegradable Lipids for Safer Drug Delivery',
];

const AUTHORS = [
  ['Cullis, P. R.', 'Hope, M. J.'],
  ['Zamecnik, P. C.', 'Stephenson, M. L.'],
  ['Langer, R.', 'Folkman, J.'],
  ['Weissman, D.', 'Karikó, K.'],
  ['Akinc, A.', 'Maier, M. A.'],
  ['Semple, S. C.', 'Chen, J.'],
  ['Heyes, J. A.', 'Leung, A. K.'],
  ['Belliveau, N. M.', 'Hu, F. T.'],
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockData = (): GraphData => {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];

  // 1. Create a Seed Node
  const seedNode: NodeData = {
    id: 'seed-0',
    type: 'seed',
    title: 'A Foundational Paper on Lipid Nanoparticles for Vaccine Development',
    classification: 'seed',
    year: 2018,
    authors: getRandomElement(AUTHORS),
    doi: `10.1038/nature${getRandomInt(10000, 99999)}`,
    depth_level: 0,
  };
  nodes.push(seedNode);

  // 2. Create LNP nodes expanded from the seed
  const lnpNodesCount = getRandomInt(4, 6);
  for (let i = 0; i < lnpNodesCount; i++) {
    const year = seedNode.year! + getRandomInt(1, 3);
    const lnpNode: NodeData = {
      id: `lnp-${i}`,
      type: 'expanded',
      title: `LNP Expansion: ${getRandomElement(TITLES)}`,
      classification: 'lnp',
      year,
      authors: getRandomElement(AUTHORS),
      doi: `10.1126/science.abc${getRandomInt(1000, 9999)}`,
      depth_level: 1,
    };
    nodes.push(lnpNode);
    edges.push({
      source: seedNode.id,
      target: lnpNode.id,
      type: 'expands_to',
    });
  }

  // 3. Create Peripheral nodes (references) for LNP nodes
  const lnpNodes = nodes.filter(n => n.classification === 'lnp');
  for (const lnpNode of lnpNodes) {
    const peripheralCount = getRandomInt(3, 5);
    for (let i = 0; i < peripheralCount; i++) {
        const id = `peripheral-${lnpNode.id}-${i}`;
        // Avoid creating duplicate nodes
        if (nodes.some(n => n.id === id)) continue;

        const year = lnpNode.year! - getRandomInt(1, 10);
        const peripheralNode: NodeData = {
            id: id,
            type: 'reference',
            title: `Cited Work: ${getRandomElement(TITLES)}`,
            classification: 'peripheral',
            year: year > 0 ? year : lnpNode.year,
            authors: getRandomElement(AUTHORS),
            doi: `10.1021/acs.jmedchem.${getRandomInt(1000, 9999)}`,
            depth_level: 2,
        };
        nodes.push(peripheralNode);
        edges.push({
            source: lnpNode.id,
            target: peripheralNode.id,
            type: 'cites',
        });
    }
  }

  // 4. Add some cross-citations between peripheral nodes
  const peripheralNodes = nodes.filter(n => n.classification === 'peripheral');
  if (peripheralNodes.length > 1) {
    for (let i = 0; i < peripheralNodes.length / 2; i++) {
      const sourceNode = getRandomElement(peripheralNodes);
      let targetNode = getRandomElement(peripheralNodes);
      let attempts = 0;
      const maxAttempts = 50; // Prevent potential infinite loop

      // Ensure it's not a self-citation and the target is older
      while ((targetNode.id === sourceNode.id || targetNode.year! >= sourceNode.year!) && attempts < maxAttempts) {
        targetNode = getRandomElement(peripheralNodes);
        attempts++;
      }
      
      if (attempts < maxAttempts) {
        // Ensure edge doesn't already exist
        const edgeExists = edges.some(e => e.source === sourceNode.id && e.target === targetNode.id);
        if (!edgeExists) {
          edges.push({
            source: sourceNode.id,
            target: targetNode.id,
            type: 'cites',
          });
        }
      }
    }
  }

  return { nodes, edges };
};