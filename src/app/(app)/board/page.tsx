import type { Metadata } from "next";

import { KanbanBoardSection } from "@/components/board/kanban-board";

export const metadata: Metadata = { title: "Board" };

export default function BoardPage() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Board</h1>
        <p className="text-sm text-muted-foreground">
          Drag a card by its handle to change its status, or use the menu on each card.
        </p>
      </div>
      <KanbanBoardSection />
    </div>
  );
}
