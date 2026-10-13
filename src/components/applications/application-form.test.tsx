// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RepositoryError } from "@/lib/repository/types";

import { ApplicationForm } from "./application-form";

const resumes = [
  {
    id: "de0c0000-0000-4000-8000-000000000001",
    name: "Frontend focus – v3",
    linkUrl: null,
    notes: null,
    createdAt: "2026-10-01T09:00:00.000Z",
    updatedAt: "2026-10-01T09:00:00.000Z",
  },
];

function setup(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <ApplicationForm
      resumes={resumes}
      submitLabel="Add application"
      cancelHref="/applications"
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe("ApplicationForm", () => {
  it("shows field errors and does not submit when required fields are empty", async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole("button", { name: "Add application" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Please fix the highlighted fields.");
    const company = screen.getByLabelText("Company");
    expect(company).toHaveAttribute("aria-invalid", "true");
    expect(company).toHaveAccessibleDescription("Enter the company name.");
  });

  it("submits parsed, typed values", async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText("Company"), "Sample Paper Co");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.selectOptions(screen.getByLabelText("Status"), "applied");
    await user.selectOptions(screen.getByLabelText("Work mode"), "remote");
    await user.type(screen.getByLabelText("Minimum"), "85,000");
    await user.click(screen.getByRole("button", { name: "Add application" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      company: "Sample Paper Co",
      roleTitle: "Frontend Engineer",
      status: "applied",
      workMode: "remote",
      salaryMin: 85000,
      salaryMax: null,
      salaryCurrency: "USD",
      notes: null,
      resumeId: null,
    });
  });

  it("records which resume was used", async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText("Company"), "Sample Paper Co");
    await user.type(screen.getByLabelText("Role title"), "Frontend Engineer");
    await user.selectOptions(screen.getByLabelText("Resume used"), "Frontend focus – v3");
    await user.click(screen.getByRole("button", { name: "Add application" }));

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ resumeId: resumes[0]!.id });
  });

  it("shows errors returned by the server on the matching fields", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new RepositoryError("Please fix the highlighted fields.", { company: ["Too long."] }),
      );
    const { user } = setup(onSubmit);

    await user.type(screen.getByLabelText("Company"), "Sample Paper Co");
    await user.type(screen.getByLabelText("Role title"), "Designer");
    await user.click(screen.getByRole("button", { name: "Add application" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please fix the highlighted fields.",
    );
    expect(screen.getByLabelText("Company")).toHaveAccessibleDescription("Too long.");
  });
});
