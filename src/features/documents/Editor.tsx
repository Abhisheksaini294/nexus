"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  List, ListOrdered, CheckSquare, Code, Quote, 
  Undo, Redo, Save, Download, Copy, Trash2, Plus, 
  FileText, Sparkles, Check
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DocItem {
  id: string;
  title: string;
  updatedAt: string;
  content: string;
}

const initialDocs: DocItem[] = [
  {
    id: "doc-1",
    title: "Q3 Product Roadmap & Vision",
    updatedAt: "10 mins ago",
    content: `
      <h1>Nexus OS - Q3 Product Roadmap</h1>
      <p>This document outlines the strategic priorities for Nexus Enterprise OS across the upcoming quarter.</p>
      <h2>Primary Objectives</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Define core workspace feature set & architecture</li>
        <li data-type="taskItem" data-checked="true">Implement client-side Dexie offline database sync</li>
        <li data-type="taskItem" data-checked="false">Deploy interactive whiteboards and analytics engine</li>
        <li data-type="taskItem" data-checked="false">Deliver real-time team collaboration with WebSocket fallback</li>
      </ul>
      <h2>Architecture Principles</h2>
      <p>High performance, dark mode first, sub-100ms client interactions, and zero-friction enterprise onboarding.</p>
    `,
  },
  {
    id: "doc-2",
    title: "System Technical Specification",
    updatedAt: "Yesterday",
    content: `
      <h1>Technical Specification & Data Layer</h1>
      <p>Nexus is built using Next.js 16 with Turbopack, Tailwind CSS v4, and Prisma ORM.</p>
      <h2>Key Components</h2>
      <ul>
        <li><strong>Frontend Framework:</strong> Next.js App Router (React 19)</li>
        <li><strong>State Management:</strong> Zustand persistent storage</li>
        <li><strong>Database Layer:</strong> Prisma ORM with hybrid client offline persistence</li>
      </ul>
      <blockquote>"Zero configuration required for local exploration."</blockquote>
    `,
  },
  {
    id: "doc-3",
    title: "Weekly Engineering Sync Notes",
    updatedAt: "3 days ago",
    content: `
      <h1>Engineering Sync - Sprint 42</h1>
      <p>Attendees: Alice, Bob, Charlie, Sarah.</p>
      <h2>Action Items</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Benchmark Turbopack build pipelines</li>
        <li data-type="taskItem" data-checked="false">Review Kanban drag-and-drop boundary edge-cases</li>
        <li data-type="taskItem" data-checked="false">Add CSV export capabilities to Reporting module</li>
      </ul>
    `,
  },
];

export default function DocumentEditor() {
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [activeDocId, setActiveDocId] = useState<string>("doc-1");
  const [isSaved, setIsSaved] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("nexus_documents");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setDocs(parsed);
          setActiveDocId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved docs");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nexus_documents", JSON.stringify(docs));
  }, [docs]);

  const currentDoc = docs.find((d) => d.id === activeDocId) || docs[0];

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands or begin typing your document...",
      }),
    ],
    content: currentDoc.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-slate dark:prose-invert focus:outline-none max-w-full min-h-[480px] p-6 text-sm sm:text-base leading-relaxed",
      },
    },
    onUpdate: () => {
      setIsSaved(false);
    },
  });

  const handleSelectDoc = (doc: DocItem) => {
    setActiveDocId(doc.id);
    if (editor) {
      editor.commands.setContent(doc.content);
    }
    setIsSaved(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, title: newTitle } : d))
    );
    setIsSaved(false);
  };

  const handleSaveDocument = () => {
    if (!editor) return;
    const updatedHtml = editor.getHTML();
    setDocs((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? { ...d, content: updatedHtml, updatedAt: "Just now" }
          : d
      )
    );
    setIsSaved(true);
    toast({
      title: "Document saved",
      description: `"${currentDoc.title}" saved successfully.`,
      type: "success",
    });
  };

  const handleCreateDoc = () => {
    const newDoc: DocItem = {
      id: `doc-${Date.now()}`,
      title: "Untitled Document",
      updatedAt: "Just now",
      content: "<h1>Untitled Document</h1><p>Start drafting your project specifications here...</p>",
    };
    setDocs((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    if (editor) {
      editor.commands.setContent(newDoc.content);
    }
    setIsSaved(true);
    toast({
      title: "New document created",
      description: "Ready for editing.",
      type: "success",
    });
  };

  const handleDeleteDoc = () => {
    if (docs.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must keep at least one document in workspace.",
        type: "error",
      });
      return;
    }
    const remaining = docs.filter((d) => d.id !== activeDocId);
    setDocs(remaining);
    handleSelectDoc(remaining[0]);
    toast({
      title: "Document deleted",
      description: `"${currentDoc.title}" was moved to trash.`,
      type: "info",
    });
  };

  const handleExportMarkdown = () => {
    if (!editor) return;
    const textContent = editor.getText();
    const blob = new Blob([textContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDoc.title.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported to Markdown",
      description: `Downloaded ${a.download}`,
      type: "success",
    });
  };

  const handleCopyHtml = () => {
    if (!editor) return;
    const html = editor.getHTML();
    navigator.clipboard.writeText(html);
    toast({
      title: "HTML Copied",
      description: "Rendered document HTML copied to clipboard.",
      type: "success",
    });
  };

  if (!mounted) {
    return <div className="flex-1 flex items-center justify-center p-12"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full max-w-7xl mx-auto w-full">
      {/* Document Sidebar Selector */}
      <div className="w-full lg:w-72 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 flex flex-col shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Documents ({docs.length})
            </h2>
          </div>
          <button
            onClick={handleCreateDoc}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
            title="Create new document"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* List of documents */}
        <div className="py-3 space-y-1.5 flex-1 overflow-y-auto">
          {docs.map((doc) => {
            const isSelected = doc.id === activeDocId;
            return (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600/10 dark:bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent"
                }`}
              >
                <p className="text-xs font-bold truncate leading-snug">{doc.title}</p>
                <p className="text-[10px] text-slate-400 mt-1">{doc.updatedAt}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        {/* Title Bar & Status */}
        <div className="p-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
          <input
            type="text"
            value={currentDoc.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 bg-transparent outline-none border-b border-transparent focus:border-indigo-500 transition-colors flex-1"
          />

          <div className="flex items-center gap-2 shrink-0">
            {/* Save Status Badge */}
            <span className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-full ${
              isSaved 
                ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" 
                : "text-amber-600 bg-amber-500/10 dark:text-amber-400"
            }`}>
              {isSaved ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
              {isSaved ? "Saved" : "Unsaved changes"}
            </span>

            <button
              onClick={handleSaveDocument}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Save size={13} />
              <span>Save</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Export as Markdown (.md)"
            >
              <Download size={16} />
            </button>

            <button
              onClick={handleCopyHtml}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy HTML to clipboard"
            >
              <Copy size={16} />
            </button>

            <button
              onClick={handleDeleteDoc}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Delete document"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Rich Formatting Toolbar */}
        {editor && (
          <div className="flex flex-wrap items-center gap-1 p-2 px-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 text-xs">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("bold") ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Bold"
            >
              <Bold size={15} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("italic") ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Italic"
            >
              <Italic size={15} />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("heading", { level: 1 }) ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Heading 1"
            >
              <Heading1 size={15} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("heading", { level: 2 }) ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Heading 2"
            >
              <Heading2 size={15} />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("bulletList") ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Bullet list"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("orderedList") ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Numbered list"
            >
              <ListOrdered size={15} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("taskList") ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Task list with checkboxes"
            >
              <CheckSquare size={15} />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("codeBlock") ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Code block"
            >
              <Code size={15} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                editor.isActive("blockquote") ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Quote block"
            >
              <Quote size={15} />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              title="Undo"
            >
              <Undo size={15} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              title="Redo"
            >
              <Redo size={15} />
            </button>
          </div>
        )}

        {/* Document Editor Body */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950/60 cursor-text">
          {editor && <EditorContent editor={editor} />}
        </div>
      </div>
    </div>
  );
}
