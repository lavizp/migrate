import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Cloud } from "lucide-react";

const ACCENT = "#22C55E";

export default function GoogleDriveNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`
        px-4 py-3 rounded-[16px]
        border-[2.5px] border-black
        bg-white min-w-[180px]
        ${selected ? `ring-2 ring-[${ACCENT}] ring-offset-2` : ""}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`!bg-[${ACCENT}] !w-3 !h-3 !border-2 !border-white`}
        style={{ backgroundColor: ACCENT }}
      />
      <div className="flex items-center gap-2">
        <div style={{ color: ACCENT }}>
          <Cloud size={18} />
        </div>
        <span className="text-sm font-medium text-black">{data.label as string}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={`!bg-[${ACCENT}] !w-3 !h-3 !border-2 !border-white`}
        style={{ backgroundColor: ACCENT }}
      />
    </div>
  );
}