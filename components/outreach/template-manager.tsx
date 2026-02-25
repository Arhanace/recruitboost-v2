"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createTemplate, deleteTemplate } from "@/actions/emails";

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

interface TemplateManagerProps {
  initialTemplates: Template[];
}

export function TemplateManager({ initialTemplates }: TemplateManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  function resetForm() {
    setName("");
    setSubject("");
    setBody("");
    setError(null);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Template name is required");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!body.trim()) {
      setError("Body is required");
      return;
    }

    startTransition(async () => {
      try {
        await createTemplate({
          name: name.trim(),
          subject: subject.trim(),
          body: body.trim(),
        });
        resetForm();
        setCreateOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create template"
        );
      }
    });
  }

  function handleDelete(id: number) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteTemplate(id);
      } catch {
        // Error handled by revalidation
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Email Templates
          </h3>
          <p className="text-sm text-muted-foreground">
            Create reusable templates for faster outreach
          </p>
        </div>
        <Dialog
          open={createOpen}
          onOpenChange={(value) => {
            setCreateOpen(value);
            if (!value) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Template</DialogTitle>
                <DialogDescription>
                  Save a reusable email template for quick composing.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="tpl-name">
                    Template Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tpl-name"
                    placeholder="e.g., Initial Introduction"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tpl-subject">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tpl-subject"
                    placeholder="e.g., Interest in Your Program"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tpl-body">
                    Body <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="tpl-body"
                    placeholder="Write your template body..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={isPending}
                    rows={8}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setCreateOpen(false);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Template"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {initialTemplates.length === 0 ? (
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No templates yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first template to speed up email composition
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Subject Preview</TableHead>
                <TableHead className="w-[100px]">Default</TableHead>
                <TableHead className="w-[130px]">Created</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">
                        {template.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {template.subject}
                    </p>
                  </TableCell>
                  <TableCell>
                    {template.isDefault ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 gap-1">
                        <Star className="w-3 h-3" />
                        Default
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(template.id)}
                      disabled={isPending && deletingId === template.id}
                    >
                      {isPending && deletingId === template.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
