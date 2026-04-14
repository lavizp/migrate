import { X } from "lucide-react";
import { Input } from "@migrate/ui/components/input";
import { Button } from "@migrate/ui/components/button";
import type { Node } from "@xyflow/react";

interface NodePropertiesProps {
  node: Node | null;
  onClose: () => void;
}

export function NodeProperties({ node, onClose }: NodePropertiesProps) {
  if (!node) return null;

  const renderFields = () => {
    switch (node.type) {
      case "llmCall":
        return (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Model
              </label>
              <select className="w-full p-2 rounded-lg border-2 border-black bg-white text-sm">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Prompt
              </label>
              <textarea
                className="w-full p-2 rounded-lg border-2 border-black bg-white text-sm min-h-[120px]"
                placeholder="Enter your prompt..."
                defaultValue={node.data.prompt || ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Temperature
              </label>
              <Input type="number" step="0.1" min="0" max="2" defaultValue={node.data.temperature || "0.7"} />
            </div>
          </>
        );
      case "textComplete":
        return (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Model
              </label>
              <select className="w-full p-2 rounded-lg border-2 border-black bg-white text-sm">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Prompt
              </label>
              <Input placeholder="Enter prompt..." defaultValue={node.data.prompt || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Max Tokens
              </label>
              <Input type="number" defaultValue={node.data.maxTokens || "1000"} />
            </div>
          </>
        );
      case "chatModel":
        return (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Model
              </label>
              <select className="w-full p-2 rounded-lg border-2 border-black bg-white text-sm">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                System Message
              </label>
              <textarea
                className="w-full p-2 rounded-lg border-2 border-black bg-white text-sm min-h-[80px]"
                placeholder="You are a helpful assistant..."
                defaultValue={node.data.systemMessage || ""}
              />
            </div>
          </>
        );
      case "sendEmail":
        return (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                To
              </label>
              <Input placeholder="recipient@example.com" defaultValue={node.data.to || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Subject
              </label>
              <Input placeholder="Email subject" defaultValue={node.data.subject || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Body
              </label>
              <textarea
                className="w-full p-2 rounded-lg border-2 border-black bg-white text-sm min-h-[120px]"
                placeholder="Email body..."
                defaultValue={node.data.body || ""}
              />
            </div>
          </>
        );
      case "readEmail":
        return (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                IMAP Server
              </label>
              <Input placeholder="imap.example.com" defaultValue={node.data.server || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Username
              </label>
              <Input placeholder="your-email@example.com" defaultValue={node.data.username || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Folder
              </label>
              <Input placeholder="INBOX" defaultValue={node.data.folder || "INBOX"} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Max Emails
              </label>
              <Input type="number" defaultValue={node.data.maxEmails || "10"} />
            </div>
          </>
        );
      case "uploadFile":
        return (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Folder ID
              </label>
              <Input placeholder="1abc123..." defaultValue={node.data.folderId || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                File Path
              </label>
              <Input placeholder="/path/to/file.pdf" defaultValue={node.data.filePath || ""} />
            </div>
          </>
        );
      case "downloadFile":
        return (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                File ID
              </label>
              <Input placeholder="1abc123..." defaultValue={node.data.fileId || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Destination
              </label>
              <Input placeholder="/downloads/" defaultValue={node.data.destination || ""} />
            </div>
          </>
        );
      case "listFiles":
        return (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Folder ID
              </label>
              <Input placeholder="root" defaultValue={node.data.folderId || "root"} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Max Files
              </label>
              <Input type="number" defaultValue={node.data.maxFiles || "50"} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-80">
                Filter
              </label>
              <Input placeholder="*.pdf" defaultValue={node.data.filter || ""} />
            </div>
          </>
        );
      default:
        return (
          <p className="text-sm opacity-60">No configuration options available.</p>
        );
    }
  };

  return (
    <div className="w-80 h-full bg-[#F2F2F7] border-l-2 border-black p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-black">{node.data.label as string}</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="space-y-4">{renderFields()}</div>
      <div className="mt-6 pt-4 border-t">
        <Button className="w-full">Save Changes</Button>
      </div>
    </div>
  );
}