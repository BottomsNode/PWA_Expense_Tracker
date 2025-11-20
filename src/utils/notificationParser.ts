import { ParsedTxn } from "@/props";
import { AMOUNT_PATTERNS, CREDIT_KEYWORDS, DEBIT_KEYWORDS } from "@/types";
import { formatTimestamp } from "./formatTimestamp";
import { extractUPIID } from "./upiValidator";

function sanitizeRaw(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, "") // remove URLs
    .replace(/com\.[a-z0-9._-]+/gi, "") // remove package names
    .replace(/[^\x20-\x7E]/g, "") // remove weird unicode
    .replace(/[\s]{2,}/g, " ") // collapse double spaces
    .trim();
}

function isSuspicious(text: string): boolean {
  const blacklist = /(fraud|alert|warning|blocked|secure|complaint|scam)/i;
  return blacklist.test(text);
}

function normalizeNumber(s: string) {
  return s.replace(/[^\d.]/g, "");
}

function parseAmount(text: string): number | null {
  for (const re of AMOUNT_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const raw = m[1] ?? m[0];
      const cleaned = normalizeNumber(raw);
      if (!cleaned) continue;

      const num = Number(cleaned);
      if (num > 0 && num < 1_00_00_000) return num; // safe cap
    }
  }
  return null;
}

function parseMerchant(text: string): string | null {
  // 1) UPI ID (highest priority)
  const upi = extractUPIID(text);
  if (upi) return upi;

  // 2) Merchant keywords
  const m = text.match(
    /\b(?:to|at|payee|merchant|vendor|via)[: ]+([A-Za-z][A-Za-z0-9 ._&-]{2,40})/i,
  );
  if (!m) return null;

  const merchant = m[1].trim();

  // reject garbage
  if (/com\./i.test(merchant)) return null;
  if (/https?:\/\//i.test(merchant)) return null;
  if (!/[a-z]/i.test(merchant)) return null;

  return merchant;
}

function parseAccountMask(text: string) {
  const m = text.match(/\b(?:XX|x|X)(\d{3,6})\b/);
  return m ? `****${m[1]}` : null;
}

function detectDirection(text: string, amount?: number | null) {
  if (CREDIT_KEYWORDS.test(text)) return "credit";
  if (DEBIT_KEYWORDS.test(text)) return "debit";
  if (amount && /debited|deducted/i.test(text)) return "debit";
  return "unknown";
}

function confidenceScore(parts: {
  amount?: number | null;
  merchant?: string | null;
  direction?: string;
}) {
  let score = 0;
  if (parts.amount != null) score += 50;
  if (parts.merchant) score += 30;
  if (parts.direction !== "unknown") score += 20;
  return Math.max(10, Math.min(100, score));
}

function makeId(raw: string, sender?: string | null) {
  const key = `${sender ?? ""}||${raw}`;
  let hash = 2166136261 >>> 0;

  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(hash ^ key.charCodeAt(i), 16777619) >>> 0;
  }

  return `txn_${hash.toString(36)}`;
}

export function parseNotification(
  rawText: string,
  sender?: string | null,
  ts?: Date | number | null,
): ParsedTxn | null {
  const text = sanitizeRaw(rawText);

  if (!text) return null;
  if (isSuspicious(text)) return null;

  const dateObj =
    ts instanceof Date
      ? ts
      : typeof ts === "number"
        ? new Date(ts)
        : new Date();
  const formatted = formatTimestamp(dateObj);

  const amount = parseAmount(text);
  const merchant = parseMerchant(text);
  const direction = detectDirection(text, amount);
  const accountMask = parseAccountMask(text);

  // must have at least amount or merchant or direction
  if (!amount && !merchant && direction === "unknown") {
    return null;
  }

  const id = makeId(text, sender ?? null);

  return {
    id,
    raw: rawText,
    sender: sender ?? null,
    amount: amount ?? null,
    currency: amount ? "INR" : null,
    direction,
    merchant,
    accountMask,
    timestamp: formatted,
    createdAt: dateObj.getTime(),
    confidence: confidenceScore({ amount, merchant, direction }),
  };
}
