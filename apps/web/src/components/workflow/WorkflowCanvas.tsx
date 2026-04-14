import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GripHorizontal, Trash2 } from "lucide-react";
import TriggerNode from "./nodes/TriggerNode";
import ActionNode from "./nodes/ActionNode";
import LogicNode from "./nodes/LogicNode";

const nodeTypes: NodeTypes = {
  webhook: TriggerNode,
  schedule: TriggerNode,
  http: TriggerNode,
  apiCall: ActionNode,
  transform: ActionNode,
  condition: LogicNode,
  loop: LogicNode,
};

interface WorkflowCanvasProps {
  onNodeSelect: (node: Node | null) => void;
  selectedNodeId: string | null;
}

export function WorkflowCanvas({ onNodeSelect, selectedNodeId }: WorkflowCanvasProps) {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach((node) => {
        if (selectedNodeId === node.id) {
          onNodeSelect(null);
        }
      });
    },
    [selectedNodeId, onNodeSelect],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect(node);
    },
    [onNodeSelect],
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  const setNodesWrapper = useMemo(
    () => (newNodes: Node[] | ((prev: Node[]) => Node[])) => {
      setNodes(newNodes);
    },
    [setNodes],
  );

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodesDelete={onNodesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#ccc" />
        <Controls className="border-2 border-black rounded-lg overflow-hidden" />
        {nodes.length === 0 && (
          <Panel position="top-center" className="mt-4">
            <div className="text-center text-gray-400">
              <GripHorizontal className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">Drag nodes from the sidebar to get started</p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export { useNodesState, useEdgesState };