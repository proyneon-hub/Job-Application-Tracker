"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { useApplications } from "@/lib/repository/applications-provider";
import { RepositoryError } from "@/lib/repository/types";
import type { Resume } from "@/lib/resumes/types";

/** Delete with a confirmation that says how many applications lose their link. */
export function DeleteResumeButton({
  resume,
  usedBy,
  onDeleted,
}: {
  resume: Resume;
  usedBy: number;
  onDeleted: () => void;
}) {
  const { deleteResume } = useApplications();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleDelete(event: React.MouseEvent) {
    // Keep the dialog open until the delete finishes, so errors can be shown in it.
    event.preventDefault();
    startTransition(async () => {
      try {
        await deleteResume(resume.id);
        setOpen(false);
        onDeleted();
      } catch (e) {
        setError(e instanceof RepositoryError ? e.message : "Couldn't delete. Please try again.");
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError(undefined);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 aria-hidden="true" />
          Delete<span className="sr-only"> {resume.name}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{resume.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {usedBy === 0
              ? "No applications use this resume."
              : usedBy === 1
                ? "1 application will keep its details but no longer show which resume was sent."
                : `${usedBy} applications will keep their details but no longer show which resume was sent.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            disabled={pending}
            onClick={handleDelete}
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
