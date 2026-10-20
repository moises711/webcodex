import "server-only";
import { headers } from "next/headers";
export async function requestNonce() {
  return (await headers()).get("x-nonce") || undefined;
}
