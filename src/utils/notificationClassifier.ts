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

export function getMemory() {
  return loadMemory();
}

export function clearMemory() {
  localStorage.removeItem(MEMORY_KEY);
}

/* ------------------------------------------
    UTILITIES
------------------------------------------- */

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function extractAmount(text: string): number | null {
  const m =
    text.match(/(?:inr|rs|₹)\s*([\d,]+(?:\.\d+)?)/i) ||
    text.match(/([\d,]+(?:\.\d+)?)(?:\s*rs|\s*inr|₹)/i);

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

function detectFromList(text: string, list: Record<string, string>) {
  for (const key in list) {
    if (text.includes(key)) return list[key];
  }
  return null;
}

function addScore(map: ScoreMap, key: string, score: number) {
  map[key] = (map[key] || 0) + score;
}

function computeHeuristics(text: string) {
  const scores: ScoreMap = {};
  const tags: Set<string> = new Set();

  // Direction cues
  if (
    text.includes("paid") ||
    text.includes("debited") ||
    text.includes("withdraw")
  )
    addScore(scores, "debit", 5);

  if (
    text.includes("credited") ||
    text.includes("received") ||
    text.includes("deposited")
  )
    addScore(scores, "credit", 6);

  // UPI detection
  if (text.includes("upi") || text.includes("phonepe") || text.includes("gpay"))
    addScore(scores, "upi", 3);

  // ATM detection
  if (text.includes("atm") || text.includes("withdraw"))
    addScore(scores, "atm", 6);

  // Merchant detection
  for (const k in MERCHANT_KEYWORDS) {
    if (text.includes(k)) {
      addScore(scores, `merchant:${MERCHANT_KEYWORDS[k]}`, 5);

      const tag = TAG_KEYWORDS[k];
      if (tag) tags.add(tag);
    }
  }

  return { scores, tags: Array.from(tags) };
}

/* ------------------------------------------
    RULE-PARSE (Initial layer)
------------------------------------------- */

function ruleParse(body: string) {
  const raw = body;
  const text = normalize(raw);
  const amount = extractAmount(text);

  let direction: Direction = "unknown";

  if (
    text.includes("credited") ||
    text.includes("received") ||
    text.includes("deposited")
  ) {
    direction = "credit";
  } else if (
    text.includes("debited") ||
    text.includes("paid") ||
    text.includes("withdraw")
  ) {
    direction = "debit";
  }

  return {
    raw,
    text,
    amount,
    merchant: detectFromList(text, MERCHANT_KEYWORDS),
    bank: detectFromList(text, BANK_KEYWORDS),
    direction,
  };
}

/* ------------------------------------------
    FINAL CLASSIFIER
------------------------------------------- */

export function classifyTransaction(body: string): ClassificationProps | null {
  if (!body) return null;

  const memory = loadMemory();
  const rules = ruleParse(body);

  if (!rules.amount) return null; // No money = ignore

  const heur = computeHeuristics(rules.text);
  const scores = heur.scores;

  /* Direction override */
  let direction: Direction = rules.direction;
  if (direction === "unknown") {
    const creditScore = scores["credit"] || 0;
    const debitScore = scores["debit"] || 0;

    direction = creditScore > debitScore ? "credit" : "debit";
  }

  /* Party detection */
  const candidates: { party: string; score: number }[] = [];

  if (rules.merchant) candidates.push({ party: rules.merchant, score: 5 });
  if (rules.bank) candidates.push({ party: rules.bank, score: 3 });

  for (const key in scores) {
    if (key.startsWith("merchant:")) {
      candidates.push({
        party: key.replace("merchant:", ""),
        score: scores[key],
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const party = candidates[0]?.party || null;

  /* Category */
  let category = "Unknown";

  if (party && memory[party.toLowerCase()]) {
    category = memory[party.toLowerCase()];
  } else if (heur.tags.length > 0) {
    category = heur.tags[0];
  } else if (direction === "credit") {
    category = "Income";
  } else if (scores["atm"]) {
    category = "ATM Withdrawal";
  } else if (scores["upi"]) {
    category = "UPI Payment";
  } else if (rules.bank) {
    category = "Bank Debit";
  } else {
    category = "Expense";
  }

  /* Confidence score */
  const evidence =
    (rules.merchant ? 2 : 0) +
    (rules.bank ? 1 : 0) +
    (scores["upi"] || 0) +
    (scores["atm"] || 0) +
    (scores["credit"] || 0) +
    (scores["debit"] || 0);

  const confidence = Math.min(1, Math.max(0.15, evidence / 10));

  /* Final object */
  return {
    amount: rules.amount,
    direction,
    category,
    party,
    raw: body,
    hash: generateHash(body),
    confidence,
    tags: heur.tags,
  };
}

/* ------------------------------------------
    Debug utility
------------------------------------------- */

export function simulateTransaction(body: string) {
  console.log("SIM:", classifyTransaction(body));
}
