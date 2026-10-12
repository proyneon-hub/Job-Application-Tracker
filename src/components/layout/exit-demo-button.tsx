"use client";

import { Button } from "@/components/ui/button";
import { clearDemoData } from "@/lib/repository/demo-repository";

/** Leaves demo mode: wipes the demo data from this browser, then lets the form clear the cookie. */
export function ExitDemoButton() {
  return (
    <form action="/demo/exit" method="post" onSubmit={() => clearDemoData()}>
      <Button type="submit" variant="outline" size="sm">
        Exit demo
      </Button>
    </form>
  );
}
