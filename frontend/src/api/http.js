const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export const NETWORK_ERROR_MESSAGE = 'Cannot reach the server. Check your network connection.'
export const UNEXPECTED_RESPONSE_MESSAGE = 'The server returned an invalid response.'

export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isAbortError(error) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function apiUrl(path, query) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const search = params.toString()
  return `${API_BASE_URL}${path}${search ? `?${search}` : ''}`
}

function parseJson(text) {
  try { return JSON.parse(text) } catch { return undefined }
}

function isErrorEnvelope(value) {
  const error = value?.error
  return typeof error?.code === 'string' && typeof error.message === 'string'
}

export async function request(path, options = {}) {
  const { method = 'GET', query, body, signal } = options
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(apiUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_ERROR_MESSAGE)
  }

  const text = response.status === 204 ? '' : await response.text()
  const json = text ? parseJson(text) : undefined

  if (!response.ok) {
    if (isErrorEnvelope(json)) {
      const { code, message, details } = json.error
      throw new ApiError(response.status, code, message, details ?? [])
    }
    if (response.status >= 500) throw new ApiError(response.status, 'NETWORK_ERROR', NETWORK_ERROR_MESSAGE)
    throw new ApiError(response.status, 'UNEXPECTED_RESPONSE', UNEXPECTED_RESPONSE_MESSAGE)
  }

  if (response.status === 204) return undefined
  if (json === undefined) throw new ApiError(response.status, 'UNEXPECTED_RESPONSE', UNEXPECTED_RESPONSE_MESSAGE)
  return json
}
