import { customAlphabet } from "nanoid";

const generate = customAlphabet("0123456789", 8);

export function generateOrderNumber(): string {
  return `AHP${generate()}`;
}
