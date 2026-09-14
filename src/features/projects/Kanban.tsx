"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Plus, Search, MoreVertical, Calendar, User, CheckCircle2, 
  Clock, AlertCircle, Trash2, Edit2, X, Filter, Lock, Sparkles 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
}

const initialTasks: Task[] = [
  { 
    id: "t1", 
    title: "Design user dashboard & widgets", 
    description: "Create responsive glassmorphic cards and dynamic chart layouts.",
    status: "TODO", 
    priority: "HIGH",
    assignee: "Alice",
    dueDate: "Tomorrow"
  },
  { 
    id: "t2", 
    title: "Implement enterprise authentication", 
    description: "Configure JWT sessions and demo bypass for test suites.",
    status: "IN_PROGRESS", 
    priority: "URGENT",
    assignee: "Bob",
    dueDate: "Today"
  },
  { 
    id: "t3", 
    title: "Optimize Dexie offline sync cache", 
    description: "Ensure local client mutations sync smoothly when reconnected.",
    status: "IN_PROGRESS", 
    priority: "MEDIUM",
    assignee: "Charlie",
    dueDate: "Sep 18"
  },
  { 
    id: "t4", 
    title: "Initialize Next.js Turbopack core", 
    description: "Configure Next.js 16 and Tailwind v4 design tokens.",
    status: "DONE", 
    priority: "LOW",
    assignee: "Alice",
    dueDate: "Completed"
  },
];

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "bg-slate-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-indigo-500" },
  { id: "DONE", title: "Completed", color: "bg-emerald-500" },
];

function SortableTask({ 
  task, 
  onEdit, 
  onDelete 
}: { 
  task: Task; 
  onEdit: (t: Task) => void; 
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors: Record<TaskPriority, string> = {
    LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    MEDIUM: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    HIGH: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    URGENT: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800",
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border-2 border-dashed border-indigo-400 opacity-60 min-h-[110px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Edit task"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {task.dueDate}
        </span>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[9px]">
            {task.assignee.charAt(0)}
          </div>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{task.assignee}</span>
        </div>
      </div>
    </div>
  );
}

function Column({
  column,
  tasks,
  onQuickAdd,
  onEdit,
  onDelete,
}: {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
  onQuickAdd: (col: TaskStatus) => void;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "Column", columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-slate-100/60 dark:bg-slate-900/40 p-4 rounded-3xl min-w-[320px] w-[320px] max-w-[340px] border transition-all ${
        isOver ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20" : "border-slate-200/80 dark:border-slate-800/80"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{column.title}</h3>
          <span className="bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-semibold">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onQuickAdd(column.id)}
          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={`Add task to ${column.title}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3 flex-1 min-h-[220px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <p className="text-xs text-slate-400">No tasks in this lane</p>
            <button
              onClick={() => onQuickAdd(column.id)}
              className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              + Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  // Form State
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: string;
    dueDate: string;
  }>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "Alice",
    dueDate: "Next Week",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTaskIndex = tasks.findIndex((t) => t.id === activeId);
    if (activeTaskIndex === -1) return;

    // Check if dragging over a column container directly
    const overColumn = COLUMNS.find((c) => c.id === overId);
    if (overColumn) {
      if (tasks[activeTaskIndex].status !== overColumn.id) {
        setTasks((prev) => {
          const updated = [...prev];
          updated[activeTaskIndex] = {
            ...updated[activeTaskIndex],
            status: overColumn.id,
          };
          return updated;
        });
      }
      return;
    }

    // Dropping over another task
    const overTaskIndex = tasks.findIndex((t) => t.id === overId);
    if (overTaskIndex !== -1) {
      if (tasks[activeTaskIndex].status !== tasks[overTaskIndex].status) {
        setTasks((prev) => {
          const updated = [...prev];
          updated[activeTaskIndex] = {
            ...updated[activeTaskIndex],
            status: tasks[overTaskIndex].status,
          };
          return arrayMove(updated, activeTaskIndex, overTaskIndex);
        });
      } else {
        setTasks((prev) => arrayMove(prev, activeTaskIndex, overTaskIndex));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleOpenAddModal = (status: TaskStatus = "TODO") => {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      status,
      priority: "MEDIUM",
      assignee: "Alice",
      dueDate: "Tomorrow",
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
    });
    setModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: "Task deleted",
      description: "The task was removed from the project.",
      type: "info",
    });
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    if (editingTask) {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...taskForm }
            : t
        )
      );
      toast({
        title: "Task updated",
        description: `Changes saved for "${taskForm.title}".`,
        type: "success",
      });
    } else {
      // Create new task
      const newTask: Task = {
        id: `t-${Date.now()}`,
        ...taskForm,
      };
      setTasks((prev) => [newTask, ...prev]);
      toast({
        title: "Task created",
        description: `Added "${taskForm.title}" to ${taskForm.status}.`,
        type: "success",
      });
    }

    setModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Sprint Projects & Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag cards between columns or manage priority states.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal("TODO")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pt-2">
        <button className="pb-3 border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold text-sm">Kanban Board</button>
        <button onClick={() => {
            if (onNavigate) onNavigate("billing");
            else toast({ title: "Upgrade Required", description: "Redirecting to billing plans...", type: "info" });
          }} className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-sm flex items-center gap-1.5 transition-colors group cursor-pointer">
          <Sparkles size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
          Burndown Insights
          <Lock size={12} className="ml-0.5 opacity-50" />
        </button>
        <button onClick={() => {
            if (onNavigate) onNavigate("billing");
            else toast({ title: "Upgrade Required", description: "Redirecting to billing plans...", type: "info" });
          }} className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-sm flex items-center gap-1.5 transition-colors group cursor-pointer">
          Cross-Project Dependencies
          <Lock size={12} className="ml-0.5 opacity-50" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                priorityFilter === p
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns Area */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 items-start min-w-max h-full">
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                column={col}
                tasks={filteredTasks.filter((t) => t.status === col.id)}
                onQuickAdd={handleOpenAddModal}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <SortableTask
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingTask ? "Edit Task Details" : "Create New Task"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Implement real-time notifications"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Details, acceptance criteria, or links..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Lane
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    placeholder="e.g. Sep 25"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
