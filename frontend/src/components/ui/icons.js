/**
 * Lucide glyphs used in the UI prototype (same 24×24 stroke style, currentColor, as W3 `Icons`).
 * Each icon is a list of SVG elements; `AppIcon.vue` renders them.
 */
const path = (d) => ({ tag: 'path', attrs: { d } })
const circle = (cx, cy, r) => ({
  tag: 'circle',
  attrs: { cx, cy, r },
})
const line = (x1, x2, y1, y2) => ({
  tag: 'line',
  attrs: { x1, x2, y1, y2 },
})
const rect = (x, y) => ({
  tag: 'rect',
  attrs: { width: 7, height: 7, x, y, rx: 1 },
})

export const ICONS = {
  bookOpen: [
    path('M12 7v14'),
    path(
      'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
    ),
  ],
  library: [path('m16 6 4 14'), path('M12 6v14'), path('M8 8v12'), path('M4 4v16')],
  search: [circle(11, 11, 8), path('m21 21-4.3-4.3')],
  searchX: [path('m13.5 8.5-5 5'), path('m8.5 8.5 5 5'), circle(11, 11, 8), path('m21 21-4.3-4.3')],
  plus: [path('M5 12h14'), path('M12 5v14')],
  check: [path('M20 6 9 17l-5-5')],
  x: [path('M18 6 6 18'), path('m6 6 12 12')],
  star: [
    {
      tag: 'polygon',
      attrs: {
        points:
          '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
      },
    },
  ],
  trash: [
    path('M3 6h18'),
    path('M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'),
    path('M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'),
    line(10, 10, 11, 17),
    line(14, 14, 11, 17),
  ],
  pencil: [
    path(
      'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
    ),
    path('m15 5 4 4'),
  ],
  save: [
    path(
      'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    ),
    path('M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7'),
    path('M7 3v4a1 1 0 0 0 1 1h7'),
  ],
  alert: [circle(12, 12, 10), line(12, 12, 8, 12), line(12, 12.01, 16, 16)],
  circleCheck: [circle(12, 12, 10), path('m9 12 2 2 4-4')],
  info: [circle(12, 12, 10), path('M12 16v-4'), path('M12 8h.01')],
  refresh: [
    path('M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'),
    path('M21 3v5h-5'),
    path('M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'),
    path('M8 16H3v5'),
  ],
  loader: [path('M21 12a9 9 0 1 1-6.219-8.56')],
  grid: [rect(3, 3), rect(14, 3), rect(14, 14), rect(3, 14)],
  rows: [
    path('M3 12h.01'),
    path('M3 18h.01'),
    path('M3 6h.01'),
    path('M8 12h13'),
    path('M8 18h13'),
    path('M8 6h13'),
  ],
  database: [
    { tag: 'ellipse', attrs: { cx: 12, cy: 5, rx: 9, ry: 3 } },
    path('M3 5V19A9 3 0 0 0 21 19V5'),
    path('M3 12A9 3 0 0 0 21 12'),
  ],
  chevronLeft: [path('m15 18-6-6 6-6')],
  chevronRight: [path('m9 18 6-6-6-6')],
  chevronDown: [path('m6 9 6 6 6-6')],
}
