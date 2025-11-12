import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { NodeData, EdgeData, Classification } from '../types';

interface GraphViewerProps {
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string | null) => void;
}

const CLASSIFICATION_COLORS: Record<Classification, string> = {
  seed: "#3498db",        // Blue
  lnp: "#2ecc71",         // Green
  peripheral: "#f39c12",  // Orange
  unclassified: "#95a5a6" // Gray
};

const RADIUS_MAP: Record<Classification, number> = {
  seed: 16,
  lnp: 10,
  peripheral: 7,
  unclassified: 7
};

const GraphViewer: React.FC<GraphViewerProps> = ({ nodes, edges, selectedNodeId, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeData, EdgeData>>();

  const drag = (simulation: d3.Simulation<NodeData, EdgeData> | undefined) => {
    // Fix: Cast d to any to access properties added by d3 simulation.
    // This resolves errors about fx, fy, x, and y not existing on type NodeData,
    // which likely stem from a project-specific type resolution issue.
    // FIX: Use `this` context for the dragged element and type it to fix a cryptic error.
    function dragstarted(this: SVGGElement, event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>, d: NodeData) {
      if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
      (d as any).fx = (d as any).x;
      (d as any).fy = (d as any).y;
      d3.select(this).raise();
    }
  
    // Fix: Cast d to any to access simulation properties.
    function dragged(event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>, d: NodeData) {
      (d as any).fx = event.x;
      (d as any).fy = event.y;
    }
  
    // Fix: Cast d to any to access simulation properties.
    function dragended(event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>, d: NodeData) {
      if (!event.active && simulation) simulation.alphaTarget(0);
      (d as any).fx = null;
      (d as any).fy = null;
    }
  
    return d3.drag<SVGGElement, NodeData>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 0;
    const height = svg.node()?.getBoundingClientRect().height || 0;

    // Cleanup previous elements
    svg.selectAll('*').remove();

    const container = svg.append('g').attr('class', 'graph-container');

    // Define arrow markers
    container.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 23) // A fixed value that works well for various radii
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    // Setup force simulation
    const simulation = d3.forceSimulation<NodeData, EdgeData>(nodes)
      .force('link', d3.forceLink(edges).id(d => (d as NodeData).id).distance(100))
      .force('charge', d3.forceManyBody().strength(-250)) // Adjusted strength for potentially larger graph
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.2))
      // FIX: Explicitly type the generic for forceCollide to correctly infer the datum type.
      .force('collision', d3.forceCollide<NodeData>().radius(d => RADIUS_MAP[d.classification] + 4));
    
    simulation.velocityDecay(0.5); 
    simulationRef.current = simulation;

    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      // FIX: Add generic type to .data() to fix type inference for the key function.
      .data<EdgeData>(edges, d => `${(d.source as NodeData).id}-${(d.target as NodeData).id}`)
      .enter().append('line')
      .attr('stroke', d => (d as EdgeData).type === 'expands_to' ? CLASSIFICATION_COLORS.lnp : '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => (d as EdgeData).type === 'expands_to' ? 2.5 : 1.5)
      .attr('marker-end', 'url(#arrowhead)');
      
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      // FIX: Add generic type to .data() to fix type inference for the key function.
      .data<NodeData>(nodes, d => d.id)
      .enter().append('g')
      .attr('class', 'node-group')
      .call(drag(simulationRef.current))
      .on('click', (event, d) => {
        if (event.defaultPrevented) return; 
        event.stopPropagation();
        onNodeClick(selectedNodeId === d.id ? null : d.id);
      })
      .on('mouseover', function(event, d) {
        d3.select(this).select('text').style('display', 'block');
      })
      .on('mouseout', function(event, d) {
        if (selectedNodeId !== d.id) {
            d3.select(this).select('text').style('display', 'none');
        }
      });
      
    node.append('circle')
      .attr('r', d => RADIUS_MAP[d.classification])
      .attr('fill', d => CLASSIFICATION_COLORS[d.classification])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
      
    node.append('text')
      .text(d => `${d.title.substring(0, 20)}... ${d.year ? `(${d.year})` : ''}`)
      .attr('x', d => RADIUS_MAP[d.classification] + 4)
      .attr('y', 4)
      .style('fill', '#ccc')
      .style('font-size', '10px')
      .style('pointer-events', 'none')
      .style('display', 'none');

    simulationRef.current.on('tick', () => {
      link
        .attr('x1', d => (d.source as d3.SimulationNodeDatum).x!)
        .attr('y1', d => (d.source as d3.SimulationNodeDatum).y!)
        .attr('x2', d => (d.target as d3.SimulationNodeDatum).x!)
        .attr('y2', d => (d.target as d3.SimulationNodeDatum).y!);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            container.attr('transform', event.transform);
        });
    
    svg.call(zoom as any);
    svg.on('click', () => onNodeClick(null));

    return () => {
        simulationRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    // FIX: Add explicit types to selections to ensure correct type inference in subsequent operations.
    const nodeElements = svg.selectAll<SVGGElement, NodeData>('.node-group');
    const linkElements = svg.selectAll<SVGLineElement, EdgeData>('.links line');

    if (!selectedNodeId) {
      nodeElements.transition().duration(200)
        .style('opacity', 1)
        .select('circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);
      
      nodeElements.select('text').style('display', 'none');

      linkElements.transition().duration(200)
        .attr('stroke-opacity', 0.6);
      return;
    }
    
    const neighborIds = new Set<string>();
    edges.forEach(edge => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        if (sourceId === selectedNodeId) neighborIds.add(targetId);
        if (targetId === selectedNodeId) neighborIds.add(sourceId);
    });

    nodeElements
      .transition().duration(200)
      // FIX: Removed redundant casting.
      .style('opacity', d => d.id === selectedNodeId || neighborIds.has(d.id) ? 1 : 0.1);

    nodeElements.select('circle')
      .transition().duration(200)
      // FIX: Removed redundant casting.
      .attr('stroke', d => d.id === selectedNodeId ? '#34d399' : (neighborIds.has(d.id) ? '#60a5fa' : '#fff'))
      .attr('stroke-width', d => d.id === selectedNodeId || neighborIds.has(d.id) ? 3 : 1.5);

    nodeElements.select('text')
        // FIX: Removed redundant casting.
        .style('display', d => d.id === selectedNodeId || neighborIds.has(d.id) ? 'block' : 'none');

    linkElements
      .transition().duration(200)
      // FIX: Typing the selection above ensures 'd' is correctly typed as EdgeData, fixing compiler errors.
      .attr('stroke-opacity', d => {
          const sourceId = (d.source as NodeData).id;
          const targetId = (d.target as NodeData).id;
          return sourceId === selectedNodeId || targetId === selectedNodeId ? 1 : 0.1;
      });

  }, [selectedNodeId, nodes, edges]);


  return <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>;
};

export default GraphViewer;