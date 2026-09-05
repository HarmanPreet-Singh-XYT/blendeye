"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SlateLabel } from "@/components/cinema/slate-label";
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Save,
  FileText,
  Lightbulb,
  MessageSquare,
  Compass,
  Zap,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  type ScratchpadNote,
  getScratchpadNotes,
  saveScratchpadNote,
  deleteScratchpadNote,
} from "@/lib/project-store";

interface ScratchpadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onApplyNoteToScript?: (noteContent: string) => void;
}

const CATEGORIES: Array<{ id: ScratchpadNote["category"]; label: string; icon: typeof Lightbulb }> = [
  { id: "concept", label: "High Concept", icon: Lightbulb },
  { id: "character", label: "Character Arc", icon: MessageSquare },
  { id: "scene", label: "Scene Beat", icon: FileText },
  { id: "dialogue", label: "Dialogue Line", icon: MessageSquare },
  { id: "location", label: "Visual Staging", icon: Compass },
];

type PendingScratchpadAction =
  | { type: "close" }
  | { type: "select"; note: ScratchpadNote }
  | { type: "new" };

export function ScratchpadDialog({
  open,
  onOpenChange,
  projectId,
  onApplyNoteToScript,
}: ScratchpadDialogProps) {
  const [notes, setNotes] = React.useState<ScratchpadNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

  // Note editor state
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState<ScratchpadNote["category"]>("concept");

  // Unsaved changes protection
  const [pendingAction, setPendingAction] = React.useState<PendingScratchpadAction | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = React.useState(false);

  const currentSavedNote = React.useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const hasUnsavedChanges = React.useMemo(() => {
    if (!currentSavedNote) return false;
    return (
      title !== currentSavedNote.title ||
      content !== currentSavedNote.content ||
      category !== currentSavedNote.category
    );
  }, [currentSavedNote, title, content, category]);

  // Load notes
  const refreshNotes = React.useCallback(() => {
    const loaded = getScratchpadNotes(projectId);
    setNotes(loaded);
    if (loaded.length > 0 && !selectedNoteId) {
      setSelectedNoteId(loaded[0].id);
      setTitle(loaded[0].title);
      setContent(loaded[0].content);
      setCategory(loaded[0].category);
    }
  }, [projectId, selectedNoteId]);

  React.useEffect(() => {
    if (open) {
      refreshNotes();
      setPendingAction(null);
      setShowUnsavedPrompt(false);
    }
  }, [open, refreshNotes]);

  const handleSelectNote = (note: ScratchpadNote) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
  };

  const handleRequestSelectNote = (note: ScratchpadNote) => {
    if (note.id === selectedNoteId) return;
    if (hasUnsavedChanges) {
      setPendingAction({ type: "select", note });
      setShowUnsavedPrompt(true);
      return;
    }
    handleSelectNote(note);
  };

  const handleCreateNewNote = () => {
    const newNote: ScratchpadNote = {
      id: `note-${Date.now().toString(36)}`,
      projectId,
      title: "Untitled Idea Memo",
      content: "",
      category: "concept",
      createdAt: Date.now(),
    };
    saveScratchpadNote(newNote);
    refreshNotes();
    setSelectedNoteId(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
    setCategory(newNote.category);
  };

  const handleRequestCreateNewNote = () => {
    if (hasUnsavedChanges) {
      setPendingAction({ type: "new" });
      setShowUnsavedPrompt(true);
      return;
    }
    handleCreateNewNote();
  };

  const handleRequestClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (hasUnsavedChanges) {
        setPendingAction({ type: "close" });
        setShowUnsavedPrompt(true);
        return;
      }
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  const handleDiscardAndProceed = () => {
    if (currentSavedNote) {
      setTitle(currentSavedNote.title);
      setContent(currentSavedNote.content);
      setCategory(currentSavedNote.category);
    }
    setShowUnsavedPrompt(false);
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;
    if (action.type === "close") {
      onOpenChange(false);
    } else if (action.type === "select") {
      handleSelectNote(action.note);
    } else if (action.type === "new") {
      handleCreateNewNote();
    }
  };

  const handleSaveAndProceed = () => {
    if (selectedNoteId) {
      const note: ScratchpadNote = {
        id: selectedNoteId,
        projectId,
        title: title.trim() || "Untitled Note",
        content: content.trim(),
        category,
        createdAt: Date.now(),
      };
      saveScratchpadNote(note);
      refreshNotes();
      toast.add({
        title: "Note Saved",
        description: "Idea memo saved to your showrunner scratchpad.",
        type: "success",
      });
    }
    setShowUnsavedPrompt(false);
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;
    if (action.type === "close") {
      onOpenChange(false);
    } else if (action.type === "select") {
      handleSelectNote(action.note);
    } else if (action.type === "new") {
      handleCreateNewNote();
    }
  };

  const handleSaveCurrentNote = () => {
    if (!selectedNoteId) return;
    const note: ScratchpadNote = {
      id: selectedNoteId,
      projectId,
      title: title.trim() || "Untitled Note",
      content: content.trim(),
      category,
      createdAt: Date.now(),
    };
    saveScratchpadNote(note);
    refreshNotes();
    toast.add({
      title: "Note Saved",
      description: "Idea memo saved to your showrunner scratchpad.",
      type: "success",
    });
  };

  const handleDeleteCurrentNote = (id: string) => {
    deleteScratchpadNote(id);
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (remaining.length > 0) {
      handleSelectNote(remaining[0]);
    } else {
      setSelectedNoteId(null);
      setTitle("");
      setContent("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleRequestClose}>
      <DialogContent className="max-w-4xl bg-[#0b0c10] border-border/80 p-0 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="border-b border-border/70 bg-[#10121a] p-5 pb-4 shrink-0 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <SlateLabel>Showrunner Scratchpad · Creative Brain</SlateLabel>
            </div>
            <DialogTitle className="text-xl font-heading tracking-tight text-foreground">
              Writers&apos; Room Pitch Bible &amp; Idea Scratchpad
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Fast-capture unformatted thoughts, character tics, scene beats, and dialogue fragments.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge
                variant="outline"
                className="border-amber-500/50 bg-amber-500/10 text-amber-400 font-mono text-[10px] animate-pulse"
              >
                Unsaved Edits
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestCreateNewNote}
              className="text-xs h-8 gap-1.5 border-border"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Memo</span>
            </Button>
            {selectedNoteId && (
              <Button
                size="sm"
                onClick={handleSaveCurrentNote}
                className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Note</span>
              </Button>
            )}
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => handleRequestClose(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Close Scratchpad"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body: Left Notes Nav, Right Note Editor */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Notes Sidebar */}
          <div className="w-64 border-r border-border/70 bg-[#0d0e14] p-3 flex flex-col justify-between shrink-0 overflow-y-auto space-y-1.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase text-muted-foreground">
                <span>Stored Memos ({notes.length})</span>
              </div>

              {notes.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No notes drafted yet. Click &ldquo;New Memo&rdquo; to start.
                </div>
              ) : (
                notes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleRequestSelectNote(n)}
                    className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex flex-col gap-1 ${
                      selectedNoteId === n.id
                        ? "bg-secondary text-foreground border border-accent/40 shadow-xs"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground truncate flex-1">
                        {n.title || "Untitled Memo"}
                      </span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 capitalize">
                        {n.category}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {n.content || "Empty note content..."}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Note Editor */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#090a0d] p-5 overflow-y-auto space-y-4">
            {selectedNoteId ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Memo Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Sub-level Key Swap Beat, Character Motivation..."
                      className="text-xs h-8 bg-secondary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Category Tag
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="h-8 w-full rounded border border-border bg-secondary/20 px-2 text-xs text-foreground focus:outline-none capitalize"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Idea &amp; Context Notes</span>
                    {onApplyNoteToScript && content.trim() && (
                      <button
                        type="button"
                        onClick={() => onApplyNoteToScript(content)}
                        className="text-accent hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Sparkles className="h-3 w-3" />
                        Append to Master Screenplay
                      </button>
                    )}
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Draft raw creative ideas, dialogue exchanges, visual staging notes, or cinematic references..."
                    rows={12}
                    className="w-full rounded-lg border border-border bg-secondary/20 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-accent resize-none text-foreground font-mono leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCurrentNote(selectedNoteId)}
                    className="text-xs text-muted-foreground hover:text-rose-400 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Memo</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveCurrentNote}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Note</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-muted-foreground p-8 space-y-2">
                <Lightbulb className="h-8 w-8 text-accent/40" />
                <span className="font-bold text-foreground">Select or create a scratchpad memo</span>
                <p className="max-w-xs text-[11px]">
                  Use the Showrunner Scratchpad to brainstorm raw story elements before crystallizing them into the production graph.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRequestCreateNewNote}
                  className="mt-2 text-xs"
                >
                  Create First Memo
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Unsaved Memo Changes Confirmation Modal */}
      <AlertDialog open={showUnsavedPrompt} onOpenChange={setShowUnsavedPrompt}>
        <AlertDialogContent className="bg-[#10121a] border-border text-foreground max-w-md shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-heading font-bold text-foreground">
              Unsaved Scratchpad Memo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              You have unsaved edits in this memo. If you proceed without saving, these modifications will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
            <AlertDialogCancel
              onClick={() => {
                setShowUnsavedPrompt(false);
                setPendingAction(null);
              }}
              className="text-xs h-8 cursor-pointer"
            >
              Keep Editing
            </AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDiscardAndProceed}
              className="text-xs h-8 cursor-pointer"
            >
              Discard Edits
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAndProceed}
              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
            >
              Save &amp; Proceed
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
