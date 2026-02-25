"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  Plus,
  Send,
  Sparkles,
  Loader2,
  Search,
  X,
  Clock,
  Save,
  SendHorizonal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendEmail, saveDraft } from "@/actions/emails";
import { getSavedCoaches, getCoaches, getCoachById } from "@/actions/coaches";
import { titleCase } from "@/lib/utils";

interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  school: string;
  sport: string;
  division: string | null;
  conference: string | null;
  role: string | null;
  state: string | null;
  region: string | null;
}

interface Template {
  id: number;
  userId: string;
  name: string;
  subject: string;
  body: string;
  isDefault: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface ComposeDialogProps {
  templates: Template[];
  initialCoachId?: number | null;
}

export function ComposeDialog({ templates, initialCoachId }: ComposeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedCoaches, setSelectedCoaches] = useState<Coach[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [followUpDays, setFollowUpDays] = useState("3");

  // Coach search state
  const [coachSearch, setCoachSearch] = useState("");
  const [savedCoachList, setSavedCoachList] = useState<Coach[]>([]);
  const [searchResults, setSearchResults] = useState<Coach[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadedSaved, setLoadedSaved] = useState(false);
  const [coachTab, setCoachTab] = useState("all");

  // AI generate state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiTone, setAiTone] = useState("professional");
  const [aiContext, setAiContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Load saved coaches when dialog opens
  useEffect(() => {
    if (open && !loadedSaved) {
      getSavedCoaches().then((results) => {
        setSavedCoachList(results.map((r) => r.coach));
        setLoadedSaved(true);
      });
    }
  }, [open, loadedSaved]);

  // Auto-open with pre-selected coach from URL param
  const [initialCoachLoaded, setInitialCoachLoaded] = useState(false);
  useEffect(() => {
    if (initialCoachId && !initialCoachLoaded) {
      setInitialCoachLoaded(true);
      getCoachById(initialCoachId).then((coach) => {
        if (coach) {
          setSelectedCoaches([coach]);
          setOpen(true);
        }
      });
    }
  }, [initialCoachId, initialCoachLoaded]);

  // Search coaches when search term changes
  const searchCoaches = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const result = await getCoaches({ search: term, page: 1, limit: 20 });
      setSearchResults(result.data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (coachSearch.trim().length >= 2) {
        searchCoaches(coachSearch);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [coachSearch, searchCoaches]);

  // Determine which coaches to show based on tab and search
  const displayCoaches =
    coachSearch.trim().length >= 2
      ? searchResults
      : coachTab === "saved"
      ? savedCoachList
      : [];

  function resetForm() {
    setSelectedCoaches([]);
    setSubject("");
    setBody("");
    setTemplateId("");
    setFollowUpEnabled(false);
    setFollowUpDays("3");
    setCoachSearch("");
    setSearchResults([]);
    setShowAiPanel(false);
    setAiTone("professional");
    setAiContext("");
    setError(null);
    setCoachTab("all");
  }

  function handleTemplateChange(value: string) {
    setTemplateId(value);
    if (value === "none") return;
    const template = templates.find((t) => t.id.toString() === value);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  }

  function toggleCoachSelection(coach: Coach) {
    setSelectedCoaches((prev) => {
      const isSelected = prev.some((c) => c.id === coach.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== coach.id);
      }
      if (prev.length >= 5) return prev;
      return [...prev, coach];
    });
  }

  function removeCoach(coachId: number) {
    setSelectedCoaches((prev) => prev.filter((c) => c.id !== coachId));
  }

  async function handleAiGenerate() {
    if (selectedCoaches.length === 0) {
      setError("Please select a coach first to generate an AI email");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: selectedCoaches[0].id,
          tone: aiTone,
          additionalContext: aiContext || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate email");
      }

      const data = await response.json();
      if (data.subject) setSubject(data.subject);
      if (data.body) setBody(data.body);
      setShowAiPanel(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveDraft() {
    setError(null);
    if (selectedCoaches.length === 0) {
      setError("Please select at least one recipient");
      return;
    }
    setIsSavingDraft(true);
    try {
      for (const coach of selectedCoaches) {
        await saveDraft({
          coachId: coach.id,
          subject: subject.trim(),
          body: body.trim(),
          templateId: templateId && templateId !== "none" ? parseInt(templateId) : undefined,
        });
      }
      resetForm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedCoaches.length === 0) {
      setError("Please select at least one recipient");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!body.trim()) {
      setError("Email body is required");
      return;
    }

    startTransition(async () => {
      try {
        for (const coach of selectedCoaches) {
          await sendEmail({
            coachId: coach.id,
            subject: subject.trim(),
            body: body.trim(),
            templateId: templateId && templateId !== "none" ? parseInt(templateId) : undefined,
            followUpDays: followUpEnabled ? parseInt(followUpDays) : undefined,
          });
        }
        resetForm();
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send email");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4" />
          Compose Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[920px] h-[85vh] max-h-[85vh] overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <SendHorizonal className="h-4 w-4 text-muted-foreground" />
              <DialogTitle className="text-base font-semibold">New Message</DialogTitle>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Compose and send an email to college coaches
          </DialogDescription>

          {error && (
            <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* Two-column layout */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left column - Coach selector */}
            <div className="w-[280px] border-r flex flex-col shrink-0">
              <Tabs value={coachTab} onValueChange={setCoachTab} className="flex flex-col flex-1">
                <TabsList className="mx-3 mt-3 grid grid-cols-2">
                  <TabsTrigger value="all" className="text-xs">All Coaches</TabsTrigger>
                  <TabsTrigger value="saved" className="text-xs">Saved Coaches</TabsTrigger>
                </TabsList>

                <div className="px-3 pt-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search coaches..."
                      value={coachSearch}
                      onChange={(e) => setCoachSearch(e.target.value)}
                      className="pl-8 h-8 text-xs"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
                  {isSearching && (
                    <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Searching...
                    </div>
                  )}

                  {!isSearching && displayCoaches.length === 0 && (
                    <div className="px-2 py-6 text-xs text-muted-foreground text-center">
                      {coachSearch.trim().length >= 2
                        ? "No coaches match your filters"
                        : coachTab === "saved"
                        ? savedCoachList.length === 0
                          ? "No saved coaches yet"
                          : "Your saved coaches"
                        : "Type to search all coaches"}
                    </div>
                  )}

                  {!isSearching && coachTab === "saved" && coachSearch.trim().length < 2 && savedCoachList.length > 0 && (
                    savedCoachList.map((coach) => {
                      const isSelected = selectedCoaches.some((c) => c.id === coach.id);
                      return (
                        <button
                          key={coach.id}
                          type="button"
                          className={`w-full text-left px-2 py-2 text-xs rounded-md transition-colors flex items-start gap-2 ${
                            isSelected ? "bg-primary/10" : "hover:bg-accent"
                          }`}
                          onClick={() => toggleCoachSelection(coach)}
                        >
                          <div className={`mt-0.5 h-3.5 w-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          }`}>
                            {isSelected && <span className="text-[8px] text-primary-foreground">✓</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {titleCase(coach.firstName)} {titleCase(coach.lastName)}
                            </p>
                            <p className="text-muted-foreground truncate">{coach.school}</p>
                          </div>
                        </button>
                      );
                    })
                  )}

                  {!isSearching && coachSearch.trim().length >= 2 && searchResults.length > 0 && (
                    searchResults.map((coach) => {
                      const isSelected = selectedCoaches.some((c) => c.id === coach.id);
                      return (
                        <button
                          key={coach.id}
                          type="button"
                          className={`w-full text-left px-2 py-2 text-xs rounded-md transition-colors flex items-start gap-2 ${
                            isSelected ? "bg-primary/10" : "hover:bg-accent"
                          }`}
                          onClick={() => toggleCoachSelection(coach)}
                        >
                          <div className={`mt-0.5 h-3.5 w-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          }`}>
                            {isSelected && <span className="text-[8px] text-primary-foreground">✓</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {titleCase(coach.firstName)} {titleCase(coach.lastName)}
                            </p>
                            <p className="text-muted-foreground truncate">{coach.school}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </Tabs>

              {/* Generate AI button */}
              <div className="p-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  disabled={selectedCoaches.length === 0}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Personalized Emails
                </Button>
              </div>
            </div>

            {/* Right column - Email form */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <div className="flex-1 p-4 space-y-3">
                {/* To field */}
                <div className="flex items-start gap-2 pb-3 border-b">
                  <span className="text-sm text-muted-foreground pt-1 shrink-0">To:</span>
                  <div className="flex flex-wrap gap-1 flex-1 min-h-[28px]">
                    {selectedCoaches.length === 0 ? (
                      <span className="text-sm text-muted-foreground pt-0.5">No recipients selected</span>
                    ) : (
                      selectedCoaches.map((coach) => (
                        <span
                          key={coach.id}
                          className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1"
                        >
                          {titleCase(coach.firstName)} {titleCase(coach.lastName)}
                          <button
                            type="button"
                            onClick={() => removeCoach(coach.id)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Template selector */}
                {templates.length > 0 && (
                  <div className="pb-3 border-b">
                    <Select value={templateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="h-8 text-xs w-[220px]">
                        <SelectValue placeholder="Choose a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No template</SelectItem>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.name}
                            {t.isDefault ? " (Default)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Subject */}
                <div className="pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Subject:</span>
                    <Input
                      placeholder="Write a compelling subject line"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={isPending}
                      className="border-0 shadow-none px-0 h-8 focus-visible:ring-0 text-sm"
                    />
                  </div>
                </div>

                {/* Body */}
                <Textarea
                  placeholder="Write your personalized message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={isPending}
                  className="min-h-[230px] border-0 shadow-none px-0 resize-none focus-visible:ring-0 text-sm"
                />

                {/* AI Generate Panel */}
                {showAiPanel && (
                  <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">AI Email Generator</span>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label className="text-xs">Tone</Label>
                        <Select value={aiTone} onValueChange={setAiTone}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs">Additional Context (optional)</Label>
                        <Textarea
                          placeholder="e.g., Mention my 4.0 GPA and state championship..."
                          value={aiContext}
                          onChange={(e) => setAiContext(e.target.value)}
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAiGenerate}
                        disabled={isGenerating || selectedCoaches.length === 0}
                        className="gap-1"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Generate Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-up bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-t bg-muted/20 min-h-[52px]">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="follow-up"
                    checked={followUpEnabled}
                    onCheckedChange={(checked) => setFollowUpEnabled(checked === true)}
                  />
                  <label htmlFor="follow-up" className="text-sm whitespace-nowrap">
                    Schedule automatic follow-up
                  </label>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {followUpEnabled && (
                    <>
                      <span className="text-xs text-muted-foreground">after</span>
                      <Select value={followUpDays} onValueChange={setFollowUpDays}>
                        <SelectTrigger className="h-7 w-[80px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 5, 7, 10, 14].map((d) => (
                            <SelectItem key={d} value={d.toString()}>
                              {d} day{d !== 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 px-4 py-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isPending || isSavingDraft || selectedCoaches.length === 0}
                  className="gap-1.5"
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save as Draft
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || selectedCoaches.length === 0}
                  className="gap-1.5 ml-auto"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Now
                    </>
                  )}
                </Button>
                {selectedCoaches.length > 1 && (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    variant="secondary"
                    className="gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send All {selectedCoaches.length}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
