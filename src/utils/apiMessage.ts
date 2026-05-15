import axios from 'axios';

type RtkFetchLikeError = {
  status: number | string;
  data?: unknown;
  error?: string;
};

const isRtkFetchLikeError = (error: unknown): error is RtkFetchLikeError =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  ('data' in error || 'error' in error);

type ApiPayload = {
  message?: unknown;
  error?: unknown;
  details?: unknown;
};

const toText = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value.trim() || null;
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }
  return null;
};

const extractFromPayload = (payload: unknown): string | null => {
  if (!payload) return null;

  const direct = toText(payload);
  if (direct) return direct;

  if (typeof payload === 'object') {
    const apiPayload = payload as ApiPayload;
    return (
      toText(apiPayload.message) ||
      toText(apiPayload.details) ||
      toText(apiPayload.error)
    );
  }

  return null;
};

export const getApiSuccessMessage = (
  payload: unknown,
  fallback = 'Operation completed successfully.',
): string => {
  return extractFromPayload(payload) || fallback;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (isRtkFetchLikeError(error)) {
    const messageFromPayload = extractFromPayload(error.data);
    if (messageFromPayload) return messageFromPayload;
    if (typeof error.error === 'string' && error.error) return error.error;
  }

  if (axios.isAxiosError(error)) {
    const messageFromPayload = extractFromPayload(error.response?.data);
    if (messageFromPayload) return messageFromPayload;
    if (error.message) return error.message;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  const message = extractFromPayload(error);
  return message || fallback;
};
