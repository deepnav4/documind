"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import {
  addEdge,
  type Connection,
  type Edge,
  type Node as ReactFlowNode,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { FlowContent, AgentNode } from "@/components/ai/canvas";

type MindMapCanvasProps = {
  data: any[];
};

export function MindMapCanvas({ data }: MindMapCanvasProps) {
  const LEVEL_WIDTH = 300;
  const NODE_HEIGHT = 80;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const nodeTypes = useMemo(() => {
      return { agent: AgentNode };
  }, []);

  const { baseNodes, baseEdges, childrenMap } = useMemo(() => {
    const bNodes: ReactFlowNode[] = [];
    const bEdges: Edge[] = [];
    const cmap: Record<string, string[]> = {};

    const calculateHeight = (node: any) => {
      if (!node.subPoints || node.subPoints.length === 0) return NODE_HEIGHT;
      let height = 0;
      node.subPoints.forEach((child: any) => {
        height += calculateHeight(child);
      });
      return Math.max(height, NODE_HEIGHT);
    };

    const traverse = (node: any, level: number, currentY: number, parentId: string | null) => {
      const id = node.index.toString();
      const subtreeHeight = calculateHeight(node);
      const y = currentY + subtreeHeight / 2 - NODE_HEIGHT / 2;
      const x = level * LEVEL_WIDTH;

      cmap[id] = [];

      bNodes.push({
        id,
        type: "agent",
        position: { x, y },
        data: { 
            label: node.point, 
            onToggleCollapse: toggleCollapse,
            hasChildren: node.subPoints && node.subPoints.length > 0
        },
      });

      if (parentId) {
        bEdges.push({
          id: `e${parentId}-${id}`,
          source: parentId,
          target: id,
          animated: true,
          type: "smoothstep"
        });
        cmap[parentId].push(id);
      }

      if (node.subPoints && node.subPoints.length > 0) {
        let childY = currentY;
        node.subPoints.forEach((child: any) => {
          const childHeight = calculateHeight(child);
          traverse(child, level + 1, childY, id);
          childY += childHeight;
        });
      }
    };

    let startY = 0;
    data.forEach((rootNode) => {
      const height = calculateHeight(rootNode);
      traverse(rootNode, 0, startY, null);
      startY += height + 50; 
    });

    return { baseNodes: bNodes, baseEdges: bEdges, childrenMap: cmap };
  }, [data, toggleCollapse]);

  useEffect(() => {
    const hiddenSet = new Set<string>();
    const stack = Array.from(collapsedNodes);
    while (stack.length > 0) {
        const current = stack.pop()!;
        const children = childrenMap[current] || [];
        for (const child of children) {
            hiddenSet.add(child);
            stack.push(child);
        }
    }

    setNodes(baseNodes.map(n => ({
        ...n,
        hidden: hiddenSet.has(n.id),
        data: {
            ...n.data,
            isCollapsed: collapsedNodes.has(n.id)
        }
    })));

    setEdges(baseEdges.map(e => ({
        ...e,
        hidden: hiddenSet.has(e.target)
    })));
  }, [baseNodes, baseEdges, childrenMap, collapsedNodes, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const id = `${Date.now()}`;
    const newNode: ReactFlowNode = {
      id,
      type: "agent",
      position: {x: Math.random() * 400 + 100, y: Math.random() * 200 + 50},
      data: {label: `New Node`, onToggleCollapse: toggleCollapse},
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, toggleCollapse]);

  const flowRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={flowRef} className={isFullscreen ? "fixed inset-0 z-50 bg-background" : "h-[700px] w-full border rounded-none md:rounded-xl overflow-hidden shadow-sm relative"}>
      <ReactFlowProvider>
        <FlowContent
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          flowRef={flowRef}
          addNode={addNode}
          isFullscreen={isFullscreen}
          toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />
      </ReactFlowProvider>
    </div>
  );
}
