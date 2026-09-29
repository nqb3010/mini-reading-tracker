export function formatNumber(n) {
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat('vi-VN').format(n)
}

export function formatDate(ymd) {
  if (!ymd) return '—'
  const [year, month, day] = ymd.split('-')
  return `${day}/${month}/${year}`
}

export function formatDateTimeVN(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function todayVN() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}

export const EMPTY_VALUE = '—'
