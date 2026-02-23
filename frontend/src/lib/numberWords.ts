const digitWords: Record<string, string> = {
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
};

/**
 * Converts a number to digit-by-digit words (e.g. 65 → "Six Five", 339 → "Three Three Nine").
 * Used for "Total (In Words)" on the Result-cum-Detailed Marks Card.
 */
export function digitsToWords(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return '';
  const s = String(Math.round(value));
  return s.split('').map((d) => digitWords[d] ?? d).join(' ');
}
