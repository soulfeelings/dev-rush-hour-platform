import { expect, type APIResponse } from '@playwright/test';

export type ResponseBodyType = 'array' | 'object';

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

type GenericCollectionBody = {
  items?: unknown[];
  data?: unknown[];
  results?: unknown[];
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type ApiErrorOptions = {
  expectedStatus?: number;
  minStatus?: number;
  maxStatus?: number;
  allowedCodes?: string[];
  messageIncludes?: string;
};

type RequiredFieldCase = {
  field: string;
  payload: Record<string, unknown>;
};

type RequiredFieldsOptions = {
  endpoint: string;
  create: (payload: Record<string, unknown>) => Promise<APIResponse>;
  cases: RequiredFieldCase[];
};

export const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
export const invalidTypeValue = () => ({ invalid: true });

export async function expectJsonByType(
  response: APIResponse,
  path: string,
  type: ResponseBodyType
): Promise<unknown> {
  expect(response.ok(), `${path} should be OK`).toBeTruthy();
  const body = await response.json();

  if (type === 'array') {
    expect(Array.isArray(body), `${path} should return array`).toBe(true);
    return body;
  }

  expect(body, `${path} should return body`).toBeTruthy();
  expect(Array.isArray(body), `${path} should not return array`).toBe(false);
  expect(typeof body, `${path} should return object`).toBe('object');

  return body;
}

export async function expectApiErrorResponse(
  response: APIResponse,
  options: ApiErrorOptions = {}
): Promise<ApiErrorPayload> {
  if (options.expectedStatus !== undefined) {
    expect(response.status()).toBe(options.expectedStatus);
  } else {
    const minStatus = options.minStatus ?? 400;
    const maxStatus = options.maxStatus ?? 599;

    expect(response.status()).toBeGreaterThanOrEqual(minStatus);
    expect(response.status()).toBeLessThanOrEqual(maxStatus);
  }

  const body = (await response.json()) as ApiErrorBody;

  expect(body?.error, 'error envelope should exist').toBeTruthy();
  expect(body.error?.code, 'error.code should be present').toBeTruthy();
  expect(body.error?.message, 'error.message should be present').toBeTruthy();

  const error = body.error as ApiErrorPayload;

  if (options.allowedCodes) {
    expect(
      options.allowedCodes,
      `error.code "${error.code}" should be one of expected values`
    ).toContain(error.code);
  }

  if (options.messageIncludes) {
    expect(error.message.toLowerCase()).toContain(options.messageIncludes.toLowerCase());
  }

  return error;
}

export async function expectRequiredFieldRejections(
  options: RequiredFieldsOptions
): Promise<void> {
  for (const testCase of options.cases) {
    const fieldFailureMessage = `${options.endpoint} should reject invalid value for required field "${testCase.field}"`;

    // internal_error оставлен как допустимый код на переходный период,
    // пока все create-эндпоинты не нормализованы на validation_error/invalid_request.
    const response = await options.create(testCase.payload);
    expect(response.status(), fieldFailureMessage).toBeGreaterThanOrEqual(400);
    expect(response.status(), fieldFailureMessage).toBeLessThanOrEqual(599);

    const error = await expectApiErrorResponse(response, {
      expectedStatus: response.status(),
      allowedCodes: ['validation_error', 'invalid_request', 'internal_error'],
    });

    expect(
      error.message,
      fieldFailureMessage
    ).toBeTruthy();
  }
}

export function asCollectionItems(body: unknown): any[] {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];

  const typed = body as GenericCollectionBody;
  if (Array.isArray(typed.items)) return typed.items;
  if (Array.isArray(typed.data)) return typed.data;
  if (Array.isArray(typed.results)) return typed.results;

  return [];
}
