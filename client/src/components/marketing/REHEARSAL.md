# Rehearsal: landing-page feature stills

Gold: `examples/static-card` (kept: one whole panel per card at a fixed design
size, real words only where the story is, a real QR, tabular numbers; changed:
mat ground instead of a bottom bleed, four different product surfaces instead of
one window plus a satellite, short.link's own tokens and product classes).

Beats: none — four stills. The section reads left to right: the redirect trace,
the numbers, the code, the control.

Captured: 1440 (4 across), 1024 (2 across), 390 (1 across), light and dark.

Gate: not run — these are host-page stills, not `Stage` components, so
`film.mjs` has no stage to gate. Reviewed instead with per-card screenshots at
2x and a fresh-eye pass on each width and on the dark theme.

Film: per-card 2x stills → clipping of right-aligned header content → window
inset on both sides; fade over the panel foot → read as fading content →
panels sized to end inside their own bottom padding; QR washed out by the fade
→ no mask on the QR panel; faint end-of-panel bands → row pitch and QR tile
resized to fill.

Review: "the panels are cut off at the bottom" → the bleed was replaced with a
whole panel on a mat; "QR not clean" → quiet zone widened to ~4 modules;
"empty band below the QR" → tile and padding grown.

Assumptions: the panels are decorative (`aria-hidden`), so the card copy carries
the meaning; the QR encodes https://short.link/launch.

Unresolved: the 2-across range (620–1200px) scales the still up to ~1.7x, which
reads as a deliberate close-up but is not a second design.

Not checked: motion and reduced motion (nothing animates); the section beyond
1440px; Safari's rendering of `ResizeObserver`-scaled text.

## "How it works" stage (video, masthead, three metric cards)

Replaced the four-step still rail with the supplied "Built for Intelligent
Performance" stage: a full-viewport section with the CloudFront stage video, the
LED-dot masthead and three glass metric cards drawn at 429 x 554.

Copy is short.link's, mapped onto the three card visuals: redirect speed (gauge),
click analytics (tile wall and window) and global reach (connection map). The
tile wall's gradient stops were not in the brief, so it is a reconstruction from
the described colours (violet to magenta to deep plum) rather than a
transcription of the original source.

Cards are rigid: every descendant measures in --u (1 unit = 1px at 429), so a
card scales without re-laying-out. Only the column count changes: three across,
two across in portrait tablets, stacked under 768px. The row is width- and
height-limited by container units, so the cards stay whole at any viewport.

Motion: the brief's one-shot entrance (headline lines, intro, cards, titles,
gauge/panel/map, metric, caption, control) runs when the section is 20% on
screen, because the section sits below the fold on a scrolling page instead of
being the whole document. A 3.2s failsafe clears the class; the third card's
control clears it first on animationend. Reduced motion hides the videos and
plays nothing.

Measured: 1440x900 gives 427x552 cards at 52 / 501 / 950, row 593 tall inside a
900px stage; 390x844 stacks three 351x453 cards, swaps to the narrow video and
keeps the headline on one line; no horizontal overflow at either width. CloudFront
media reached readyState 4 in the test browser.

Not checked: the rendered pixels were not screenshotted (the preview window was
not drawable during this pass), so only geometry, computed type sizes and media
state were verified. Safari/Firefox, the tablet two-across band mid-animation,
and the videos' playback appearance are unchecked.

## Feature motion (one gesture per card)

Gold: `references/craft.md` "Motion" — one short gesture per panel, each naming
the claim, all of it ending on the frame the still already had.

Beats, ~2.4s total once the grid is 15% on screen:
- redirect: the trace prints, row by row (0.15 / 0.4 / 0.65 / 0.9), then the
  `302 Found` row takes one accent glow — the hop.
- analytics: the line draws left to right (1.1s), the area fades up behind it,
  the last-point dot pops at the end.
- qr: a scan band sweeps the tile once (0.4s → 1.4s), then Download presses.
- control: the destination retypes in the field, then Save presses.

Unlike the steps rail, nothing is hidden at rest: a feature card has no order,
so every card must read as a finished product shot before it plays. The
gestures are all "already there, now moving" — a print wipe, a line draw, a
scan — rather than entrances from nothing.

Film: the trace values sat at full width from the first frame because
`max-width` does nothing on an inline span; `display: inline-block` on
`.fs-print` is what makes the print a print.

Measured: after 0.3s print widths 69/57/0/0/0, after 0.65s 69/57/0/0/50, after
1.6s 69/57/170/69/144; dashoffset 1400 → 0 by 1.6s; scan opacity 0 → 1 → 0.
Reduced motion leaves all of it at the finished frame with `animation: none`;
at rest (before the grid is seen) every card shows its full content.

Not checked: the same four cards in dark theme mid-animation, Firefox/Safari,
and whether the 15% trigger fires early enough on very tall phones.

## "How it's built" (one instrument, four readings)

Gold, deliberately not here: four more icon cards. The section's first claim is
about time, so it opens with a request-timing still — the one proof the copy
cannot make in words — and the other three facts are read off it.

The still (`BuiltStill.jsx`) is honest to scale: a 25 ms axis, the response at
3.6% (0.9 ms) and the log at 96.4% (24 ms), drawn to those widths rather than
by eye. The log lane is hatched over a tint, because that work happens after
the response, and the tint stops the hatch reading as empty paper at a glance.
A dashed guide crosses both lanes at the handover, so the log lane does not
look like it starts in mid-air. Below 900px the wide plate gives way to a
one-strip version with a legend (`m-still--narrow`, 360×200).

The four facts are a spec sheet, not cards: each row is the chart's own grid —
a 150px mono gutter holding the proof, the finding in the lane beside it — so
the list continues the instrument above it. Two gutters fit from 1100px; one
column at a 940px document measure from 1099 to 761; label above title above
body below that (DOM order, which is why every cell's `grid-row` is reset
rather than left auto).

Motion, once the section is 15% on screen: the response bar grows (0.14s), the
log bar follows (0.65s at 0.5s), and both values fade with their bars. Same
rules as elsewhere — `both` fill, reduced motion renders the finished frame.

Film: the axis' last label wrapped to two lines because `25 ms` had nothing
stopping it; `.bw-ticks > * { white-space: nowrap }` fixes it. Stacking first
came out title → label → body: the proof cell was auto-placed while `h3` still
held `grid-row: 1`, so the reset has to name all three children.

Measured: response 38px, log 1018px of a 1056px track, ticks centred at
0/10/20/25 under that same track; item grids 150px + rest at every width;
turning the page down to reduced motion gives 38/1018 with `animation: none`.
Not checked: Firefox/Safari, and see-the-motion screenshots in dark.
