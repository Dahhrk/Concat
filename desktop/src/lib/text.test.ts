// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2026 Jareer and Concat contributors

/**
 * Font identity from a file path.
 *
 * `familyForPath` names the CSS family a custom font registers under, and that
 * name is written into the project's font list and referenced by text clips.
 * Two files that end up with one name would silently render as each other -
 * exactly the collision the uniquing exists to prevent.
 */
import { describe, expect, test } from "vitest";

import { alignedCenterX, familyForPath } from "./text";

describe("familyForPath", () => {
  test("the file's own name, without its extension", () => {
    expect(familyForPath("/fonts/Inter-Bold.otf", [])).toBe("Inter-Bold");
    expect(familyForPath("/fonts/Cabinet Grotesk.TTF", [])).toBe("Cabinet Grotesk");
  });

  test("windows paths split on backslashes too", () => {
    expect(familyForPath("C:\\Fonts\\Regular.otf", [])).toBe("Regular");
  });

  test("a taken name gets a counter, and the counter keeps counting", () => {
    expect(familyForPath("/a/Regular.otf", ["Regular"])).toBe("Regular 2");
    expect(familyForPath("/b/Regular.otf", ["Regular", "Regular 2"])).toBe("Regular 3");
  });

  test("punctuation CSS would choke on is stripped", () => {
    expect(familyForPath("/f/Font™.otf", [])).toBe("Font");
    // Inner dots go with the punctuation; only the last extension was an
    // extension.
    expect(familyForPath("/f/My.Font.v2.otf", [])).toBe("MyFontv2");
  });

  test("a name with nothing usable left falls back, and still uniques", () => {
    expect(familyForPath("/f/★.otf", [])).toBe("Custom font");
    expect(familyForPath("/f/★.otf", ["Custom font"])).toBe("Custom font 2");
  });
});

describe("alignedCenterX", () => {
  const FRAME = 1920;
  const BLOCK = 400;

  test("center alignment: block centre sits at frame centre + offset", () => {
    expect(alignedCenterX("center", 0, FRAME, BLOCK)).toBe(FRAME / 2);
    expect(alignedCenterX("center", 0.1, FRAME, BLOCK)).toBe(FRAME / 2 + 0.1 * FRAME);
  });

  test("left alignment: block left edge sits at anchor, centre shifts right", () => {
    const cx = alignedCenterX("left", 0, FRAME, BLOCK);
    const leftEdge = cx - BLOCK / 2;
    expect(leftEdge).toBe(FRAME / 2);
  });

  test("left alignment with offset: left edge tracks the anchor", () => {
    const cx = alignedCenterX("left", -0.5, FRAME, BLOCK);
    const leftEdge = cx - BLOCK / 2;
    expect(leftEdge).toBe(0);
  });

  test("right alignment: block right edge sits at anchor, centre shifts left", () => {
    const cx = alignedCenterX("right", 0, FRAME, BLOCK);
    const rightEdge = cx + BLOCK / 2;
    expect(rightEdge).toBe(FRAME / 2);
  });

  test("right alignment with offset: right edge tracks the anchor", () => {
    const cx = alignedCenterX("right", 0.5, FRAME, BLOCK);
    const rightEdge = cx + BLOCK / 2;
    expect(rightEdge).toBe(FRAME);
  });

  test("left and right are symmetric about center", () => {
    const offset = 0.15;
    const anchor = FRAME / 2 + offset * FRAME;
    const leftCx = alignedCenterX("left", offset, FRAME, BLOCK);
    const rightCx = alignedCenterX("right", offset, FRAME, BLOCK);

    expect(leftCx - anchor).toBe(BLOCK / 2);
    expect(anchor - rightCx).toBe(BLOCK / 2);
  });

  test("wider text pushes the centre further from the anchor", () => {
    const narrow = alignedCenterX("left", 0, FRAME, 200);
    const wide = alignedCenterX("left", 0, FRAME, 600);
    expect(wide - narrow).toBe(200);
  });
});
