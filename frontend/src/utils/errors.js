import { ApiError } from '../api/http'

export function toApiError(caught) {
  if (caught instanceof ApiError) return caught
  return new ApiError(0, 'NETWORK_ERROR', caught?.message ?? 'Unknown error')
}

export function errorCode(error) {
  return error?.code ?? 'UNKNOWN'
}

export function errorMessage(error) {
  return error?.message ?? 'Unknown error'
}

export function errorToastMeta(error) {
  return error.code !== 'NETWORK_ERROR' ? error.code : undefined
}
