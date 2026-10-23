# allocations

A minimal, keyboard-driven single-page app to construct, visualize, and share portfolio allocations across every breakdown chart representation.

**Live Site**: [https://gshaheen.github.io/allocations/](https://gshaheen.github.io/allocations/)

---

## ✨ Interaction & Design

1. **Initial Blank Screen**: Begins completely blank with only a blinking cursor in the center.
2. **Category Input**: Type any category, stock, or asset name (no autocomplete). Press `Enter`.
3. **Clockwise Box Drawing**: A thin black line draws a box around the category clockwise starting from the top-left corner. Once closed, the border transitions smoothly from black to a unique, random OKLCH mineral color.
4. **Slide Left & `?%` Prompt**: The box slides left, revealing `?%` with the blinking cursor.
5. **Percentage or Fraction Entry**: Type a numerical value or fraction (e.g. `25`, `1/3`, `2/3`, `1/4`). Press `Enter`. A matching clockwise box squares up the `%` value and joins flush with the category box.
6. **Repeat Until 100%**: Repeats until total allocation reaches 100% (no charts are shown before 100%).
7. **Smooth Fan-Out Transition**: As soon as 100% is reached, the input stage converges and 16 distinct breakdown charts fan out across the screen from the center.
8. **Equal-Size, Zero-Scroll, Zero-Whitespace Canvas**: All 16 charts fit the screen simultaneously in a $4 \times 4$ edge-to-edge grid with zero scrolling and zero wasted whitespace.
9. **Editorial Color Harmonies**: Every chart tile features its own unique, randomly generated OKLCH color scheme and its own interactive dotted-box legend with mouseover shimmer and inline click-to-edit.
10. **Top Header**: Lowercase `allocations` on the left with clean SVG icon buttons for **Share** and **Reset** on the right.

---

## 🚀 Running Locally

No build steps or dependencies required:

```bash
open index.html
```
