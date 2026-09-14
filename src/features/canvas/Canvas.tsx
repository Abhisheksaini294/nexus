"use client";

import React, { useState, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import { 
  Square, Circle, Type, MousePointer2, StickyNote, 
  Trash2, RotateCcw, ZoomIn, ZoomOut, Maximize2, Download 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Shape {
  id: string;
  type: "rect" | "circle" | "text" | "note";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color: string;
}

const COLOR_PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#1e293b", // Slate Dark
];

export default function Canvas() {
  const [shapes, setShapes] = useState<Shape[]>([
    { id: "1", type: "rect", x: 120, y: 120, width: 220, height: 120, color: "#6366f1" },
    { id: "2", type: "circle", x: 420, y: 180, width: 140, height: 140, color: "#f43f5e" },
    { id: "3", type: "note", x: 180, y: 320, width: 200, height: 140, text: "Sprint 42: Refactor API schemas & test buttons", color: "#f59e0b" },
    { id: "4", type: "text", x: 440, y: 360, width: 220, height: 60, text: "Collaborative Whiteboard", color: "#6366f1" },
  ]);

  const [activeTool, setActiveTool] = useState<"select" | "rect" | "circle" | "note" | "text">("select");
  const [selectedColor, setSelectedColor] = useState<string>("#6366f1");
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("nexus_canvas");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          setShapes(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved canvas");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nexus_canvas", JSON.stringify(shapes));
  }, [shapes]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "select") {
      // If clicking directly on canvas background while in select mode, deselect.
      if (e.target === e.currentTarget) {
         setSelectedShapeId(null);
      }
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left + 50;
    const clickY = e.clientY - rect.top + 50;

    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: activeTool,
      x: clickX,
      y: clickY,
      width: activeTool === "circle" ? 120 : activeTool === "note" ? 180 : activeTool === "text" ? 200 : 180,
      height: activeTool === "circle" ? 120 : activeTool === "note" ? 120 : activeTool === "text" ? 60 : 90,
      text: activeTool === "note" ? "New sticky note..." : activeTool === "text" ? "Click to edit text" : undefined,
      color: selectedColor,
    };

    setShapes((prev) => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
    setActiveTool("select");
    toast({
      title: "Shape added",
      description: `Created a new ${newShape.type} on the canvas.`,
      type: "success",
    });
  };

  const handleTextChange = (id: string, newText: string) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, text: newText } : s));
  };

  const handleDeleteSelected = () => {
    if (!selectedShapeId) return;
    setShapes((prev) => prev.filter((s) => s.id !== selectedShapeId));
    setSelectedShapeId(null);
    toast({
      title: "Shape deleted",
      description: "Item removed from whiteboard.",
      type: "info",
    });
  };

  const handleClearCanvas = () => {
    setShapes([]);
    setSelectedShapeId(null);
    toast({
      title: "Canvas cleared",
      description: "All shapes and notes were removed.",
      type: "info",
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(shapes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexus-canvas-board.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Canvas exported",
      description: "Whiteboard vector layout downloaded.",
      type: "success",
    });
  };

  // Bring selected shape to front by reordering array
  const bringToFront = (id: string) => {
    setShapes(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx <= 0) return prev; // already in front or not found
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.push(item);
      return copy;
    });
  };

  if (!mounted) {
    return <div className="flex-1 flex items-center justify-center p-12"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col animate-fade-in-up">
      {/* Top Floating Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1.5 sm:gap-2">
        {/* Tool Selectors */}
        {[
          { id: "select", icon: MousePointer2, label: "Select (V)" },
          { id: "rect", icon: Square, label: "Rectangle (R)" },
          { id: "circle", icon: Circle, label: "Circle (O)" },
          { id: "note", icon: StickyNote, label: "Sticky Note (N)" },
          { id: "text", icon: Type, label: "Text (T)" },
        ].map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`p-2.5 rounded-xl transition-all btn-press ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
              title={tool.label}
            >
              <tool.icon size={18} />
            </button>
          );
        })}

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Color presets */}
        <div className="flex items-center gap-1.5">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => {
                 setSelectedColor(color);
                 if (selectedShapeId) {
                    setShapes(prev => prev.map(s => s.id === selectedShapeId ? { ...s, color } : s));
                 }
              }}
              className={`w-6 h-6 rounded-full transition-transform btn-press ${
                selectedColor === color ? "scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900" : "hover:scale-110 opacity-80"
              }`}
              style={{ backgroundColor: color }}
              title={`Select ${color}`}
            />
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* Action Controls */}
        {selectedShapeId && (
          <button
            onClick={handleDeleteSelected}
            className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors btn-press"
            title="Delete selected shape"
          >
            <Trash2 size={18} />
          </button>
        )}

        <button
          onClick={handleClearCanvas}
          className="p-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors btn-press"
          title="Clear all"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={handleExport}
          className="p-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors btn-press"
          title="Export board data"
        >
          <Download size={18} />
        </button>
      </div>

      {/* Infinite Canvas Viewport */}
      <div className="flex-1 w-full h-full relative" onClick={handleCanvasClick}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={2}
          centerOnInit
          panning={{ disabled: activeTool !== "select" }}
          wheel={{ step: 0.2 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Floating bottom zoom controls */}
              <div className="absolute bottom-6 right-6 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                <button
                  onClick={() => zoomIn()}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 btn-press"
                  title="Zoom in"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 btn-press"
                  title="Zoom out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 btn-press"
                  title="Reset view (100%)"
                >
                  <Maximize2 size={18} />
                </button>
              </div>

              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <div 
                  className="w-[4000px] h-[4000px] bg-grid-pattern relative"
                  onPointerDown={(e) => {
                     // If clicking directly on the canvas grid while active tool is select, deselect.
                     if (activeTool === "select" && e.target === e.currentTarget) {
                        setSelectedShapeId(null);
                     }
                  }}
                >
                  {shapes.map((shape) => {
                    const isSelected = selectedShapeId === shape.id;
                    return (
                      <motion.div
                        key={shape.id}
                        drag={activeTool === "select"}
                        dragMomentum={false}
                        initial={{ x: shape.x, y: shape.y }}
                        onDragStart={() => bringToFront(shape.id)}
                        onPointerDown={(e) => {
                          e.stopPropagation(); // prevent pan
                          setSelectedShapeId(shape.id);
                          bringToFront(shape.id);
                        }}
                        className={`absolute flex items-center justify-center ${activeTool === "select" ? 'cursor-grab active:cursor-grabbing' : ''} transition-shadow ${
                          isSelected ? "ring-2 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-950 shadow-2xl z-20" : "shadow-md hover:shadow-lg z-10"
                        }`}
                        style={{
                          width: shape.width,
                          height: shape.height,
                          backgroundColor:
                            shape.type === "note"
                              ? shape.color
                              : shape.type !== "text"
                              ? `${shape.color}25`
                              : "transparent",
                          borderColor: shape.color,
                          borderWidth: shape.type === "text" ? 0 : 3,
                          borderRadius: shape.type === "circle" ? "50%" : "12px",
                          padding: shape.type === "text" ? "0px" : "16px",
                        }}
                      >
                        {shape.type === "text" && (
                          <textarea
                            value={shape.text}
                            onChange={(e) => handleTextChange(shape.id, e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="w-full h-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-xl font-black tracking-tight"
                            style={{ color: shape.color }}
                            placeholder="Type..."
                          />
                        )}
                        {shape.type === "note" && (
                          <textarea
                            value={shape.text}
                            onChange={(e) => handleTextChange(shape.id, e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="w-full h-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-sm font-semibold text-slate-900 leading-snug placeholder-slate-700/50"
                            placeholder="Write a note..."
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
