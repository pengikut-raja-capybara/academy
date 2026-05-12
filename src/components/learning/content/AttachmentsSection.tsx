import { memo } from "react";
import { FileText, FileArchive, Image as ImageIcon, Link as LinkIcon, Download, Paperclip } from "lucide-react";
import type { Attachment } from "../../../types";
import { resolveAssetUrl } from "../../../services/cms";

interface AttachmentsSectionProps {
  attachments: Attachment[];
  title?: string;
}

export const AttachmentsSection = memo(function AttachmentsSection({ attachments, title = "Lampiran Materi" }: AttachmentsSectionProps) {
  if (!attachments || attachments.length === 0) return null;

  const getIcon = (type?: string) => {
    switch (type) {
      case "pdf":
        return <FileText size={18} />;
      case "zip":
        return <FileArchive size={18} />;
      case "image":
        return <ImageIcon size={18} />;
      case "link":
        return <LinkIcon size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className="pb-6 border-t border-border pt-6 sm:pt-10 space-y-4 sm:space-y-6">
      <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
        <Paperclip className="text-blue-500" size={24} />
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">{title}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((item, index) => (
          <a
            key={index}
            href={resolveAssetUrl(item.file || item.url || "")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:shadow-md transition-all group"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{item.title}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{item.type || "file"}</p>
            </div>
            <div className="shrink-0 text-muted-foreground group-hover:text-blue-500 transition-colors">
              <Download size={18} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});
