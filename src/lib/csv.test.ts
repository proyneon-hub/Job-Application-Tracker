import { describe, expect, it } from "vitest";

import { makeApplication } from "@/lib/applications/test-factory";

import { applicationsToCsv, csvCell, toCsv } from "./csv";

describe("csvCell", () => {
  it("leaves simple values alone and empties nulls", () => {
    expect(csvCell("Frontend Engineer")).toBe("Frontend Engineer");
    expect(csvCell(85000)).toBe("85000");
    expect(csvCell(null)).toBe("");
  });

  it("quotes commas, quotes and line breaks", () => {
    expect(csvCell("Springfield, Lakeside")).toBe('"Springfield, Lakeside"');
    expect(csvCell('Said "great fit"')).toBe('"Said ""great fit"""');
    expect(csvCell("line one\nline two")).toBe('"line one\nline two"');
  });

  it.each(['=HYPERLINK("http://evil.example")', "+1+1", "-2+3", "@SUM(A1)", "\tTabbed"])(
    "neutralises a formula-looking value: %s",
    (value) => {
      expect(csvCell(value).replace(/^"/, "")).toMatch(/^'/);
    },
  );

  it("does not alter negative numbers passed as numbers", () => {
    expect(csvCell(-5)).toBe("-5");
  });
});

describe("toCsv", () => {
  it("joins rows with CRLF", () => {
    expect(
      toCsv([
        ["a", "b"],
        ["c", null],
      ]),
    ).toBe("a,b\r\nc,");
  });
});

describe("applicationsToCsv", () => {
  it("writes a header row and one row per application with readable labels", () => {
    const csv = applicationsToCsv([
      makeApplication({
        company: "Sample Paper Co",
        roleTitle: "Designer",
        status: "interview",
        workMode: "on_site",
        notes: "Bring portfolio, ask about team",
      }),
    ]);
    const [header, row] = csv.split("\r\n");
    expect(header).toMatch(/^Company,Role title,Status,Work mode,/);
    expect(row).toMatch(/^Sample Paper Co,Designer,Interview,On-site,/);
    expect(row).toContain('"Bring portfolio, ask about team"');
  });
});
