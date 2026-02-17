import { describe, it, expect } from "vitest";

/**
 * Verify that the global CSS rule for touch-action: manipulation
 * is present in index.css — this removes the 300ms tap delay on Safari.
 */
import fs from "fs";
import path from "path";

const cssContent = fs.readFileSync(
  path.resolve(__dirname, "../index.css"),
  "utf-8"
);

describe("Safari 300ms tap delay avoidance", () => {
  it("applies touch-action: manipulation to all interactive elements", () => {
    // The rule should target buttons, links, role=button, inputs, selects, textareas, labels
    expect(cssContent).toContain("touch-action: manipulation");
    expect(cssContent).toMatch(/button.*a.*\[role="button"\].*input.*select.*textarea.*label/s);
  });

  it("disables webkit tap highlight globally", () => {
    expect(cssContent).toContain("-webkit-tap-highlight-color: transparent");
  });

  it("prevents iOS text size adjustment", () => {
    expect(cssContent).toContain("-webkit-text-size-adjust: 100%");
  });

  it("sets overscroll-behavior-y: none on html and body", () => {
    const matches = cssContent.match(/overscroll-behavior-y:\s*none/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
});
