import { describe, expect, it } from "vitest";
import { parseVisionResult } from "./api";

describe("parseVisionResult", () => {
  it("keeps a well-formed payload", () => {
    const result = parseVisionResult({
      items: [
        { name: "Tomatoes", note: "red, ripe", confidence: "high" },
        { name: "Basil", note: "", confidence: "medium" },
      ],
      summary: "Fresh produce on a counter.",
    });
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({ name: "Tomatoes", note: "red, ripe", confidence: "high" });
    expect(result.summary).toBe("Fresh produce on a counter.");
  });

  it("drops entries without a usable name and caps at four", () => {
    const result = parseVisionResult({
      items: [
        { name: "  ", note: "blank" },
        { note: "no name" },
        "just a string",
        { name: "Onion" },
        { name: "Carrots" },
        { name: "Peas" },
        { name: "Beans" },
      ],
      summary: "ok",
    });
    expect(result.items.map((item) => item.name)).toEqual(["Onion", "Carrots", "Peas", "Beans"]);
  });

  it("normalises unknown confidence values to medium", () => {
    const result = parseVisionResult({
      items: [{ name: "Eggs", confidence: "certain" }],
      summary: "A carton of eggs.",
    });
    expect(result.items[0].confidence).toBe("medium");
  });

  it("survives garbage input", () => {
    expect(parseVisionResult(undefined)).toEqual({
      items: [],
      summary: "",
    });
    expect(parseVisionResult("not json").items).toEqual([]);
    expect(parseVisionResult({ items: "nope", summary: 42 }).items).toEqual([]);
  });
});
