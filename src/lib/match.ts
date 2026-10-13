const FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
};

export function namesMatch(a: string, b: string): boolean {
  const left = a.toLowerCase().trim();
  const right = b.toLowerCase().trim();
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

export function parseAmount(amount: string): number | null {
  const trimmed = amount.trim();
  if (!trimmed) return null;
  let value = 0;
  let found = false;
  for (const char of trimmed) {
    if (FRACTIONS[char] !== undefined) {
      value += FRACTIONS[char];
      found = true;
      break;
    }
  }
  const match = trimmed.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    value += Number.parseFloat(match[1]);
    found = true;
  }
  return found && value > 0 ? value : null;
}
