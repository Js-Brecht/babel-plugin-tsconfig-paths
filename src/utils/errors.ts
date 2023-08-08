import { CodedError } from "../types";

export function isCodedError(error: unknown, code: string): error is CodedError {
  return error instanceof Error && (error as CodedError).code === code
}