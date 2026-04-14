import { useState, useCallback, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Connection,
  type NodeTypes,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GripHorizontal, Brain, MessageSquare, Bot, Mail, MailOpen, Cloud, Upload, Download, FolderOpen } from "lucide-react";
import LLMNode from "@/components/workflow/nodes/LLMNode";
import EmailNode from "@/components/workflow/nodes/EmailNode";
import GoogleDriveNode from "@/components/workflow/nodes/GoogleDriveNode";
import { NodeProperties } from "@/components/workflow/NodeProperties";

const nodeTypes: NodeTypes = {
  llmCall: LLMNode,
  textComplete: LLMNode,
  chatModel: LLMNode,
  sendEmail: EmailNode,
  readEmail: EmailNode,
  uploadFile: GoogleDriveNode,
  downloadFile: GoogleDriveNode,
  listFiles: GoogleDriveNode,
};

export const Route = createFileRoute("/workflow")({
  component: WorkflowPageWithProvider,
});

function WorkflowPageWithProvider() {
  return (
    <ReactFlowProvider>
      <WorkflowPage />
    </ReactFlowProvider>
  );
}

function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const label = event.dataTransfer.getData("label") || type;
      
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach((node) => {
        if (selectedNode?.id === node.id) {
          setSelectedNode(null);
        }
      });
    },
    [selectedNode],
  );

  return (
    <div className="flex h-[calc(100vh-50px)]">
      <div className="w-60 h-full bg-[#F2F2F7] border-r-2 border-black p-4 overflow-y-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">
          Nodes
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 text-[#8B5CF6]">
              LLM
            </h3>
            <div className="space-y-2">
              {[
                { type: "llmCall", label: "LLM Call", icon: Brain },
                { type: "textComplete", label: "Text Complete", icon: MessageSquare },
                { type: "chatModel", label: "Chat Model", icon: Bot },
              ].map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/reactflow", item.type);
                    e.dataTransfer.setData("label", item.label);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex items-center gap-2 p-3 rounded-[16px] border-[2.5px] border-[#8B5CF6] cursor-grab active:cursor-grabbing bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="text-[#8B5CF6]">
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-black">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 text-[#3B82F6]">
              Email
            </h3>
            <div className="space-y-2">
              {[
                { type: "sendEmail", label: "Send Email", icon: Mail },
                { type: "readEmail", label: "Read Email", icon: MailOpen },
              ].map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/reactflow", item.type);
                    e.dataTransfer.setData("label", item.label);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex items-center gap-2 p-3 rounded-[16px] border-[2.5px] border-[#3B82F6] cursor-grab active:cursor-grabbing bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="text-[#3B82F6]">
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-black">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 text-[#22C55E]">
              Google Drive
            </h3>
            <div className="space-y-2">
              {[
                { type: "uploadFile", label: "Upload File", icon: Upload },
                { type: "downloadFile", label: "Download File", icon: Download },
                { type: "listFiles", label: "List Files", icon: FolderOpen },
              ].map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/reactflow", item.type);
                    e.dataTransfer.setData("label", item.label);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex items-center gap-2 p-3 rounded-[16px] border-[2.5px] border-[#22C55E] cursor-grab active:cursor-grabbing bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="text-[#22C55E]">
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-black">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 h-full" ref={reactFlowWrapper}>
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
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#ccc" />
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

      <NodeProperties node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}