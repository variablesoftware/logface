/**
 * Format a string with printf-style replacements (e.g., %s, %d, %f, %o, %O).
 * @param fmt - The format string
 * @param args - Arguments to replace in the format string
 * @returns An array with the formatted string as the first element, followed by any unused args
 */
export function formatWithReplacements(
  fmt: string,
  args: unknown[],
): unknown[] {
  if (typeof fmt !== "string") return [fmt, ...args];
  let i = 0;
  const formatted = fmt.replace(/%[sdifoO]/g, (match) => {
    if (i >= args.length) return match;
    const val = args[i++];
    switch (match) {
      case "%s":
        return String(val);
      case "%d":
      case "%i":
        return String(parseInt(val as string, 10));
      case "%f":
        return String(parseFloat(val as string));
      case "%o":
      case "%O":
        return typeof val === "object" ? JSON.stringify(val) : String(val);
      default:
        return match;
    }
  });
  return [formatted, ...args.slice(i)];
}
