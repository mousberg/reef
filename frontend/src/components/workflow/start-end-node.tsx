import { Handle, Position } from "reactflow";

interface StartEndNodeProps {
  data: {
    label: string;
  };
}

export function StartEndNode({ data }: StartEndNodeProps) {
  const { label } = data;
  const isStart = label === "START";

  return (
    <div
      className={`
      border-2 rounded-full shadow-md min-w-[120px] min-h-[120px] 
      flex items-center justify-center
      ${
        isStart
          ? "bg-green-50 border-green-400 text-green-700"
          : "bg-red-50 border-red-400 text-red-700"
      }
    `}
    >
      {!isStart && (
        <Handle type="target" position={Position.Left} className="w-3 h-3" />
      )}

      <div className="text-center">
        <div className="font-semibold text-sm">{label}</div>
      </div>

      {isStart && (
        <Handle type="source" position={Position.Right} className="w-3 h-3" />
      )}
    </div>
  );
}
