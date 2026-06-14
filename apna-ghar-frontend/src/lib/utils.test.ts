import { describe, it, expect } from "vitest";
import { withWidth } from "./utils";

describe("withWidth", () => {
  const base =
    "https://images.unsplash.com/photo-x?auto=format&fit=crop&w=1200&q=70";

  it("overrides an existing w query param", () => {
    const out = withWidth(base, 160);
    expect(out).toContain("w=160");
    expect(out).not.toContain("w=1200");
  });

  it("preserves the other query params", () => {
    const out = withWidth(base, 400);
    expect(out).toContain("q=70");
    expect(out).toContain("fit=crop");
    expect(out).toContain("auto=format");
  });

  it("adds w when the url has none", () => {
    const out = withWidth("https://images.unsplash.com/photo-y?q=70", 600);
    expect(out).toContain("w=600");
  });

  it("returns non-url strings unchanged (e.g. local upload paths)", () => {
    expect(withWidth("/uploads/abc.jpg", 200)).toBe("/uploads/abc.jpg");
  });
});
