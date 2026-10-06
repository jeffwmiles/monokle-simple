import {useEffect, useState} from 'react';

import {Alert, Button, Empty, Spin} from 'antd';
import {ReloadOutlined} from '@ant-design/icons';
import {Background, Controls, MiniMap, Position, ReactFlow} from '@xyflow/react';
import type {Edge, Node} from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

import '@xyflow/react/dist/style.css';

type GraphResource = {
  id: string; name: string; kind: string; namespace?: string;
  refs?: {target?: {type: string; resourceId?: string; imageId?: string; tag?: string}; name?: string}[];
};

export function ResourceGraph(props: {
  resources: GraphResource[]; resourceMap: Record<string, GraphResource>; defaultNamespace?: string; elkWorker?: Worker;
  getProblemsForResource?: (id: string, level: 'error' | 'warning') => unknown[];
  onSelectResource?: (resource: GraphResource) => void; onSelectImage?: (id: string) => void;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [layoutError, setLayoutError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLayoutError(undefined);
    setIsLoading(true);
    const resources = {...props.resourceMap};
    for (const resource of props.resources) resources[resource.id] = resource;
    const graphEdges = new Map<string, Edge>();
    const adjacency = new Map<string, Set<string>>();
    for (const resource of Object.values(resources)) {
      for (const ref of resource.refs || []) {
        const target = ref.target?.type === 'image' ? ref.target.imageId : ref.target?.resourceId;
        if (target && ref.target?.type === 'image' && !resources[target]) {
          resources[target] = {id: target, name: `${ref.name || target}${ref.target.tag ? `:${ref.target.tag}` : ''}`, kind: 'Image'};
        }
        if (!target || target === resource.id || !resources[target]) continue;
        const id = `${resource.id}-${target}`;
        graphEdges.set(id, {id, source: resource.id, target});
        if (!adjacency.has(resource.id)) adjacency.set(resource.id, new Set());
        if (!adjacency.has(target)) adjacency.set(target, new Set());
        adjacency.get(resource.id)!.add(target);
        adjacency.get(target)!.add(resource.id);
      }
    }
    const queue = props.resources.map(resource => resource.id);
    const included = new Set(queue);
    for (let index = 0; index < queue.length; index += 1) {
      for (const target of adjacency.get(queue[index]) || []) {
        if (included.has(target)) continue;
        included.add(target);
        queue.push(target);
      }
    }
    const visibleEdges = [...graphEdges.values()].filter(edge => included.has(edge.source) && included.has(edge.target));
    const worker = props.elkWorker || new Worker(new URL('elkjs/lib/elk-worker.min.js', import.meta.url));
    const elk = new ELK({workerFactory: () => worker});
    elk.layout({id: 'resources', layoutOptions: {'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.spacing.nodeNode': '30'}, children: [...included].map(id => ({id, width: 190, height: 70})), edges: visibleEdges.map(edge => ({id: edge.id, sources: [edge.source], targets: [edge.target]}))}).then(layout => {
      if (cancelled) return;
      setNodes((layout.children || []).map(node => {
        const resource = resources[node.id];
        const errors = props.getProblemsForResource?.(resource.id, 'error')?.length || 0;
        return {id: resource.id, sourcePosition: Position.Right, targetPosition: Position.Left, position: {x: node.x || 0, y: node.y || 0}, data: {resource, label: <div><strong style={{overflowWrap: 'anywhere'}}>{resource.name}</strong><div style={{fontSize: 11, marginTop: 4, overflowWrap: 'anywhere'}}>{resource.kind}{resource.namespace ? ` · ${resource.namespace}` : ''}</div></div>}, style: {width: 190, minHeight: 70, borderRadius: 4, background: '#191F21', color: '#DBDBDB', borderColor: errors ? '#E84749' : '#5A5A5A'}};
      }));
      setEdges(visibleEdges);
      setIsLoading(false);
    }).catch(error => {
      if (cancelled) return;
      setLayoutError(error instanceof Error ? error.message : String(error));
      setIsLoading(false);
      console.error('Resource graph layout failed', error);
    });
    return () => {cancelled = true; if (!props.elkWorker) worker.terminate();};
  }, [props.resources, props.resourceMap, props.getProblemsForResource, props.elkWorker, attempt]);

  if (layoutError) return <Alert type="error" title="Resource graph layout failed" description={layoutError} action={<Button icon={<ReloadOutlined />} onClick={() => setAttempt(value => value + 1)}>Retry</Button>} />;
  if (isLoading) return <Spin style={{display: 'block', padding: 24}} />;
  if (!nodes.length) return <Empty description="No resources selected" />;
  return <div style={{width: '100%', height: '100%', minHeight: 250}}><ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(_, node) => {const resource = node.data.resource as GraphResource; if (resource.kind === 'Image') props.onSelectImage?.(resource.id); else props.onSelectResource?.(resource);}} colorMode="dark" nodesDraggable={false}><Background /><Controls /><MiniMap /></ReactFlow></div>;
}
