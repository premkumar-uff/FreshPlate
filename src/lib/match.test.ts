import { describe, expect, it } from "vitest";
import { namesMatch, parseAmount } from "./match";

describe("namesMatch", () => {
  it("matches case-insensitively and in both directions", () => {
    expect(namesMatch("Tomato", "Tomatoes")).toBe(true);
    expect(namesMatch("tomatoes", "Tomatoes")).toBe(true);
    expect(namesMatch("Rice", "Rice")).toBe(true);
    expect(namesMatch("Rice", "Bread")).toBe(false);
  });

  it("never matches empty strings", () => {
    expect(namesMatch("", "Rice")).toBe(false);
    expect(namesMatch("  ", "Rice")).toBe(false);
  });
});

describe("parseAmount", () => {
  it("parses integers and trailing text", () => {
    expect(parseAmount("1 cup")).toBe(1);
    expect(parseAmount("2, chopped")).toBe(2);
    expect(parseAmount("4")).toBe(4);
  });

  it("parses fractions and mixed numbers", () => {
    expect(parseAmount("½ cup")).toBe(0.5);
    expect(parseAmount("1½ cups")).toBe(1.5);
  });

  it("returns null when no quantity is present", () => {
    expect(parseAmount("a few leaves")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });
});
