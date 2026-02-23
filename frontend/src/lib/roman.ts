const ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
  7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII',
};

/** Maps semester number 1–12 to Roman numeral (I–XII); higher numbers as string. */
export function toRoman(semester: number): string {
  return ROMAN[semester] ?? String(semester);
}
