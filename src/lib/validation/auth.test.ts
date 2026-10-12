import { describe, expect, it } from "vitest";

import { loginSchema, signUpSchema } from "./auth";

describe("signUpSchema", () => {
  it("accepts valid input and normalises the email", () => {
    const result = signUpSchema.parse({
      email: "  Sam@Example.TEST ",
      password: "correct horse",
      confirmPassword: "correct horse",
    });
    expect(result.email).toBe("sam@example.test");
  });

  it("rejects short passwords", () => {
    const result = signUpSchema.safeParse({
      email: "sam@example.test",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["password"]);
  });

  it("rejects mismatched passwords on the confirm field", () => {
    const result = signUpSchema.safeParse({
      email: "sam@example.test",
      password: "correct horse",
      confirmPassword: "battery staple",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});

describe("loginSchema", () => {
  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Enter a valid email address.");
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "sam@example.test", password: "" });
    expect(result.success).toBe(false);
  });
});
