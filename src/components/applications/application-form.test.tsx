// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RepositoryError } from "@/lib/repository/types";

import { ApplicationForm } from "./application-form";

function setup(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <ApplicationForm
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
    });
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
