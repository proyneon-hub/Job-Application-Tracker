// @vitest-environment jsdom
import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeApplication } from "@/lib/applications/test-factory";

import { ApplicationCard } from "./application-card";

describe("ApplicationCard", () => {
  const app = makeApplication({
    company: "Sample Paper Co",
    roleTitle: "Frontend Engineer",
    status: "applied",
  });

  function setup() {
    const onMove = vi.fn();
    render(
      <DndContext>
        <ul>
          <ApplicationCard application={app} onMove={onMove} />
        </ul>
      </DndContext>,
    );
    return { onMove, user: userEvent.setup() };
  }

  it("has a labelled drag handle and a link to the details", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Drag Frontend Engineer at Sample Paper Co" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sample Paper Co" })).toHaveAttribute(
      "href",
      `/applications/${app.id}`,
    );
  });

  it("can be moved without dragging, using the Move to menu", async () => {
    const { onMove, user } = setup();
    const menu = screen.getByRole("combobox", {
      name: "Move Frontend Engineer at Sample Paper Co to",
    });
    expect(menu).toHaveValue("applied");

    await user.selectOptions(menu, "Move to Interview");

    expect(onMove).toHaveBeenCalledWith("interview");
  });
});
