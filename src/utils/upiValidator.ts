import { UPI_OFFICIAL_HANDLES } from "@/types";

export function extractUPIID(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9.\-_]{3,256}@[a-zA-Z]{2,30}/);
  if (!match) return null;

  const upi = match[0].toLowerCase();
  const domain = upi.split("@")[1];

  if (!domain) return null;

  if (UPI_OFFICIAL_HANDLES.has(domain)) return upi;

  if (/^[a-z]{2,20}$/.test(domain)) return upi;

  return null;
}
