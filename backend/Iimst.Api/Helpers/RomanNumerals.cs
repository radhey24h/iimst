namespace Iimst.Api.Helpers;

public static class StringHelper
{
    public static string? NullIfEmpty(this string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
}

public static class RomanNumerals
{
    private static readonly string[] Romans = { "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII" };

    /// <summary>Convert semester number 1–12 to Roman numeral (I–XII); higher numbers as string.</summary>
    public static string ToRoman(int semester)
    {
        if (semester >= 1 && semester < Romans.Length) return Romans[semester];
        return semester.ToString();
    }
}
