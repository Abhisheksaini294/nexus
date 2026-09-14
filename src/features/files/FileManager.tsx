"use client";

import React, { useState, useCallback } from "react";
import { 
  Folder, File as FileIcon, UploadCloud, MoreVertical, Search, 
  Plus, Download, Trash2, Edit3, Eye, HardDrive, CheckCircle2, X 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: string;
  modified: string;
  uploadProgress?: number;
  category?: "document" | "image" | "archive" | "code";
}

const initialItems: FileItem[] = [
  { id: "1", name: "Design Assets & Brand Kit", type: "folder", modified: "Today", category: "image" },
  { id: "2", name: "Q3 Planning & Budgets", type: "folder", modified: "Yesterday", category: "document" },
  { id: "3", name: "Executive-Roadmap-2026.pdf", type: "file", size: "3.4 MB", modified: "Oct 24", category: "document" },
  { id: "4", name: "nexus-brand-logo.svg", type: "file", size: "156 KB", modified: "Oct 20", category: "image" },
  { id: "5", name: "system-architecture-spec.md", type: "file", size: "48 KB", modified: "Oct 18", category: "code" },
  { id: "6", name: "production-backup.tar.gz", type: "file", size: "142 MB", modified: "Sep 28", category: "archive" },
];

export default function FileManager() {
  const [items, setItems] = useState<FileItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newType, setNewType] = useState<"folder" | "file">("folder");
  const [newItemName, setNewItemName] = useState("");
  const { toast } = useToast();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles: FileItem[] = Array.from(e.dataTransfer.files).map((file, i) => ({
        id: `upload-${Date.now()}-${i}`,
        name: file.name,
        type: "file",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        modified: "Just now",
        uploadProgress: 0,
        category: "document",
      }));

      setItems((prev) => [...newFiles, ...prev]);
      toast({
        title: "Uploading file(s)",
        description: `Starting upload of ${newFiles.length} file(s).`,
        type: "info",
      });

      // Simulate upload progress
      newFiles.forEach((file) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 25) + 15;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            toast({
              title: "Upload complete",
              description: `Uploaded ${file.name} successfully.`,
              type: "success",
            });
          }
          setItems((prev) =>
            prev.map((item) =>
              item.id === file.id
                ? { ...item, uploadProgress: progress === 100 ? undefined : progress }
                : item
            )
          );
        }, 250);
      });
    }
  }, [toast]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const created: FileItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      type: newType,
      size: newType === "file" ? "1.2 MB" : undefined,
      modified: "Just now",
      category: newType === "file" ? "document" : undefined,
    };

    setItems((prev) => [created, ...prev]);
    setIsNewModalOpen(false);
    setNewItemName("");
    toast({
      title: `${newType === "folder" ? "Folder" : "File"} created`,
      description: `Added "${created.name}" to workspace.`,
      type: "success",
    });
  };

  const handleDeleteItem = (id: string, name: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setActiveMenuId(null);
    toast({
      title: "Item removed",
      description: `Deleted "${name}".`,
      type: "info",
    });
  };

  const handleDownloadItem = (name: string) => {
    setActiveMenuId(null);
    const blob = new Blob([`Nexus File Content: ${name}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Download started",
      description: `Downloading ${name}`,
      type: "success",
    });
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full space-y-6">
      {/* Top Header & Search / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Cloud File Storage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store, preview, and share assets across your enterprise teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Storage Meter Summary */}
      <div className="p-5 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <HardDrive size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">45.8 GB Used</span>
              <span className="text-xs text-slate-400">of 100 GB (45%)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">High performance encrypted cloud storage</p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-indigo-500 h-full w-[25%]" title="Documents (25GB)" />
            <div className="bg-violet-500 h-full w-[15%]" title="Images (15GB)" />
            <div className="bg-emerald-500 h-full w-[5%]" title="Other (5GB)" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
            <span>Docs: 25GB</span>
            <span>Images: 15GB</span>
            <span>Free: 54.2GB</span>
          </div>
        </div>
      </div>

      {/* Drop Zone & File List Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex-1 bg-white dark:bg-slate-900/70 border-2 rounded-3xl p-6 transition-all ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xl"
            : "border-slate-200/80 dark:border-slate-800/80"
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/90 z-20 rounded-3xl backdrop-blur-xs">
            <UploadCloud size={48} className="text-indigo-500 mb-3 animate-bounce" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Drop files anywhere to upload</h2>
            <p className="text-xs text-slate-400 mt-1">Automatic compression and cloud replication</p>
          </div>
        )}

        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-3 px-4">
          <div className="col-span-6">Name</div>
          <div className="col-span-3">Last Modified</div>
          <div className="col-span-2">File Size</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* File Rows */}
        <div className="space-y-1.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setPreviewItem(item)}
              className="grid grid-cols-12 gap-4 items-center p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800"
            >
              {/* Item Name */}
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                {item.type === "folder" ? (
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Folder size={18} />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    <FileIcon size={18} />
                  </div>
                )}
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                  {item.name}
                </span>
              </div>

              {/* Last Modified */}
              <div className="col-span-3 text-xs text-slate-500 dark:text-slate-400">
                {item.modified}
              </div>

              {/* Size & Progress */}
              <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400 flex items-center">
                {item.uploadProgress !== undefined ? (
                  <div className="w-full max-w-[120px] flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-200"
                        style={{ width: `${item.uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono">{item.uploadProgress}%</span>
                  </div>
                ) : (
                  item.size || "—"
                )}
              </div>

              {/* Actions Menu */}
              <div className="col-span-1 flex justify-end relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === item.id ? null : item.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>

                {activeMenuId === item.id && (
                  <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                        setActiveMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>
                    {item.type === "file" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadItem(item.name);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id, item.name);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-400">
              No files or folders found matching your query.
            </div>
          )}
        </div>
      </div>

      {/* New Item Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Item</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Item Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType("folder")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      newType === "folder"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Folder
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("file")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      newType === "file"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    File
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {newType === "folder" ? "Folder Name" : "File Name"}
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={newType === "folder" ? "e.g. Sprint Mockups" : "e.g. project-brief.pdf"}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs shadow-indigo-500/20 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {previewItem.type === "folder" ? <Folder className="text-indigo-500" size={18} /> : <FileIcon className="text-indigo-500" size={18} />}
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{previewItem.name}</h2>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 my-4 text-center p-6">
              {previewItem.type === "folder" ? (
                <Folder size={52} className="text-indigo-500 mb-2" />
              ) : (
                <FileIcon size={52} className="text-slate-400 mb-2" />
              )}
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{previewItem.name}</p>
              <p className="text-[11px] text-slate-400 mt-1">Size: {previewItem.size || "Directory"} • Modified: {previewItem.modified}</p>
            </div>

            <div className="flex justify-end gap-2">
              {previewItem.type === "file" && (
                <button
                  onClick={() => handleDownloadItem(previewItem.name)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              )}
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
