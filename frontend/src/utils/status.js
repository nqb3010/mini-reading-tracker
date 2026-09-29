export const READING_STATUSES = ['want_to_read', 'reading', 'read']

export const STATUS_LABELS = {
  want_to_read: 'Muốn đọc',
  reading: 'Đang đọc',
  read: 'Đã đọc',
}

export const STATUS_META = {
  want_to_read: { badge: 'neutral', color: 'var(--gray-500)' },
  reading:      { badge: 'blue',    color: 'var(--buyer-active)' },
  read:         { badge: 'green',   color: 'var(--status-done-fg)' },
}

export const STATUS_OPTIONS = READING_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

export function isReadingStatus(value) {
  return READING_STATUSES.includes(value)
}
