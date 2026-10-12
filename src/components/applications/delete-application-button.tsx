"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import type { Application } from "@/lib/applications/types";
import { useApplications } from "@/lib/repository/applications-provider";
import { RepositoryError } from "@/lib/repository/types";

/** Delete with a confirmation dialog (focus is trapped in the dialog and returns afterwards). */
export function DeleteApplicationButton({ application }: { application: Application }) {
  const { deleteApplication } = useApplications();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleDelete(event: React.MouseEvent) {
    // Keep the dialog open until the delete finishes, so errors can be shown in it.
    event.preventDefault();
    startTransition(async () => {
      try {
        await deleteApplication(application.id);
        setOpen(false);
        router.push("/applications");
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
        <Button variant="outline">
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this application?</AlertDialogTitle>
          <AlertDialogDescription>
            {application.roleTitle} at {application.company} and its status history will be
            permanently deleted.
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
