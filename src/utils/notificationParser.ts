import { ParsedTxn } from "@/props";
import { AMOUNT_PATTERNS, CREDIT_KEYWORDS, DEBIT_KEYWORDS } from "@/types";
import { formatTimestamp } from "./formatTimestamp";

function normalizeNumberString(s: string) {
  return s.replace(/[^\d.]/g, "");
}

function parseAmountFromText(text: string): number | null {
  for (const re of AMOUNT_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const raw = m[1] ?? m[0];
      const cleaned = normalizeNumberString(raw);
      if (!cleaned) continue;

      const n = Number(cleaned);
      if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    }
  }
  return null;
}

function parseAccountMask(text: string) {
  const m =
    text.match(/\bA\/c(?:ount)?\s*X?(\d{2,6})\b/i) ||
    text.match(/\bX(\d{3,6})\b/);

  return m ? `****${m[1]}` : null;
}

function parseMerchant(text: string) {
  const m = text.match(
    /\b(?:to|at|merchant|payee|vendor|via)[:\s-]*([A-Za-z0-9\-\s&._]{3,60})/i,
  );

  if (!m) return null;

  return m[1].trim().replace(/\s{2,}/g, " ");
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
  if (parts.direction && parts.direction !== "unknown") score += 20;
  if (parts.merchant) score += 15;

  if (parts.amount && parts.amount > 1e9) score -= 30;

  return Math.max(0, Math.min(100, score));
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
): ParsedTxn {
  const dateObj =
    ts instanceof Date
      ? ts
      : typeof ts === "number"
        ? new Date(ts)
        : new Date();
  const formatted = formatTimestamp(dateObj);

  const amount = parseAmountFromText(rawText);
  const accountMask = parseAccountMask(rawText);
  const merchant = parseMerchant(rawText);
  const direction = detectDirection(rawText, amount);
  const confidence = confidenceScore({ amount, merchant, direction });

  const id = makeId(rawText, sender ?? null);
  const safeAmount = amount && amount > 1e12 ? null : amount;

  return {
    id,
    raw: rawText,
    sender: sender ?? null,
    amount: safeAmount ?? null,
    currency: safeAmount != null ? "INR" : null,
    direction,
    merchant: merchant ?? null,
    accountMask: accountMask ?? null,
    timestamp: formatted,
    createdAt: dateObj.getTime(),
    confidence,
  };
}
