import { ClassificationProps } from "@/props";
import {
  BANK_KEYWORDS,
  Direction,
  MEMORY_KEY,
  MEMORY_LIMIT,
  MERCHANT_KEYWORDS,
  ScoreMap,
  TAG_KEYWORDS,
} from "@/types";

/* ------------------------------------------
    MEMORY (Learns user corrections)
------------------------------------------- */
function loadMemory(): Record<string, string> {
  const raw = localStorage.getItem(MEMORY_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveMemory(mem: Record<string, string>) {
  const keys = Object.keys(mem);

  if (keys.length > MEMORY_LIMIT) {
    const last = keys.slice(-MEMORY_LIMIT);
    const newMem: Record<string, string> = {};
    last.forEach((k) => (newMem[k] = mem[k]));
    mem = newMem;
  }

  localStorage.setItem(MEMORY_KEY, JSON.stringify(mem));
}

export function recordCorrection(keyRaw: string, category: string) {
  if (!keyRaw) return;
  const mem = loadMemory();
  mem[keyRaw.toLowerCase()] = category;
  saveMemory(mem);
}

/* ------------------------------------------
    UTILITIES
------------------------------------------- */

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function extractAmount(text: string): number | null {
  const m = text.match(
    /(?:rs|inr|₹)?\s*([0-9,]+(?:\.[0-9]+)?)(?:\s*(?:rs|inr|₹))?/i,
  );
  if (!m) return null;
  return Number(m[1].replace(/,/g, ""));
}

function generateHash(str: string) {
  try {
    return btoa(unescape(encodeURIComponent(str))).slice(0, 30);
  } catch {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return String(h).slice(0, 30);
  }
}

function detectMerchant(text: string) {
  // 1) Keyword merchants
  for (const key in MERCHANT_KEYWORDS) {
    if (text.includes(key)) return MERCHANT_KEYWORDS[key];
  }

  // 2) POS detection: "at Reliance Mall"
  const posMatch = text.match(/at\s+([a-z0-9 &._-]+)/i);
  if (posMatch) return posMatch[1];

  // 3) Quoted names: "Starbucks"
  const quoteMatch = text.match(/"([^"]+)"/);
  if (quoteMatch) return quoteMatch[1];

  // 4) UPI ID fallback
  const upiMatch = text.match(/[a-z0-9.\-_]+@[a-z.]+/i);
  if (upiMatch) return upiMatch[0];

  // 5) BOB “to XXXXX”
  const toMatch = text.match(/to\s+([a-z0-9@._-]+)/i);
  if (toMatch) return toMatch[1];

  return null;
}

function detectBank(text: string) {
  for (const key in BANK_KEYWORDS) {
    if (text.includes(key)) return BANK_KEYWORDS[key];
  }
  return null;
}

function detectDirection(text: string): Direction {
  // Strongest signals first
  if (/\bcr\b\.?/i.test(text)) return "credit";
  if (/\bdr\b\.?/i.test(text)) return "debit";

  if (
    text.includes("credited") ||
    text.includes("received") ||
    text.includes("deposited")
  )
    return "credit";

  if (
    text.includes("debited") ||
    text.includes("paid") ||
    text.includes("withdraw") ||
    text.includes("spent") ||
    text.includes("sent") ||
    text.includes("transfer")
  )
    return "debit";

  return "unknown";
}

function computeHeuristics(text: string) {
  const scores: ScoreMap = {};
  const tags: Set<string> = new Set();

  if (text.includes("upi")) addScore(scores, "upi", 4);
  if (text.includes("atm")) addScore(scores, "atm", 5);

  for (const k in MERCHANT_KEYWORDS) {
    if (text.includes(k)) {
      addScore(scores, `merchant:${MERCHANT_KEYWORDS[k]}`, 4);

      const tag = TAG_KEYWORDS[k];
      if (tag) tags.add(tag);
    }
  }

  return { scores, tags: Array.from(tags) };
}

function addScore(map: ScoreMap, key: string, score: number) {
  map[key] = (map[key] || 0) + score;
}

/* ------------------------------------------
    FINAL CLASSIFIER (99% version)
------------------------------------------- */
export function classifyTransaction(body: string): ClassificationProps | null {
  if (!body) return null;

  const text = normalize(body);

  const amount = extractAmount(text);
  if (!amount) return null;

  const merchant = detectMerchant(text);
  const bank = detectBank(text);
  const direction = detectDirection(text);

  const heur = computeHeuristics(text);

  // Select best party
  const party = merchant || bank || null;

  // Category
  const memory = loadMemory();
  let category = "Expense";

  if (party && memory[party.toLowerCase()]) {
    category = memory[party.toLowerCase()];
  } else if (heur.tags.length > 0) {
    category = heur.tags[0];
  } else if (direction === "credit") {
    category = "Income";
  } else if (direction === "debit" && heur.scores["upi"]) {
    category = "UPI Payment";
  } else if (heur.scores["atm"]) {
    category = "ATM Withdrawal";
  } else if (bank) {
    category = "Bank Debit";
  }

  const confidence = Math.min(
    1,
    Math.max(
      0.2,
      (merchant ? 3 : 0) +
        (bank ? 2 : 0) +
        (heur.scores["upi"] || 0) +
        (heur.scores["atm"] || 0) / 10,
    ),
  );

  return {
    amount,
    direction,
    category,
    party,
    raw: body,
    hash: generateHash(body),
    confidence,
    tags: heur.tags,
  };
}
