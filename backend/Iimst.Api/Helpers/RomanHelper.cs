namespace Iimst.Api.Helpers;

/// <summary>Maps semester 1–12 to Roman numerals I–XII; higher numbers returned as string.</summary>
public static class RomanHelper
{
    private static readonly string[] Romans = { "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII" };

    public static string ToRoman(int semester)
    {
        if (semester >= 1 && semester < Romans.Length) return Romans[semester];
        return semester.ToString();
    }
}
