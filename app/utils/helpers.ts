import type { Result } from "domain-functions";
import { errorMessagesFor } from "domain-functions";

function fieldHasErrors(result: Result | undefined, field: string): boolean {
  return Boolean(fieldFirstMessage(result, field));
}

function fieldFirstMessage(
  result: Result | undefined,
  field: string
): string | undefined {
  return result ? errorMessagesFor(result.inputErrors, field)[0] : undefined;
}

export { fieldHasErrors, fieldFirstMessage };