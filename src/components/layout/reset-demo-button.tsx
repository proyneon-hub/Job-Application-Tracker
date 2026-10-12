"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { useApplications } from "@/lib/repository/applications-provider";

/** Puts the demo back to its original sample data, after a confirmation. */
export function ResetDemoButton() {
  const { resetDemo } = useApplications();
  const [announcement, setAnnouncement] = useState("");

  if (!resetDemo) return null;

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="bg-transparent">
            <RotateCcw aria-hidden="true" />
            Reset<span className="hidden sm:inline"> demo data</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the demo?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes will be thrown away and the original sample applications restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetDemo();
                setAnnouncement("Demo data reset.");
              }}
            >
              Reset demo data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
