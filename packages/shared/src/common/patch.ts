import { JsonPathType, JsonType } from "./json";

export function applyPatchToPayload(
  currentPayload: JsonType,
  patch: { path: JsonPathType; value: JsonType },
): JsonType {
  //TODO: do stuff here :)

  return currentPayload; // for now
}
