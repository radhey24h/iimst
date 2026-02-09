namespace Iimst.Api.Helpers;

public static class StringHelper
{
    public static string? NullIfEmpty(this string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
}

public static class RomanNumerals
{
    private static readonly string[] Romans = { "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII" };

    /// <summary>Convert semester number 1–8 to Roman numeral (I–VIII).</summary>
    public static string ToRoman(int semester)
    {
        if (semester < 1 || semester > 8) return semester.ToString();
        return Romans[semester];
    }
}
