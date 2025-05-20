/**
 * Attempt to determine the caller file/module name from the stack trace.
 * Used for automatic tag inference if no tag is provided.
 * @returns The inferred caller tag or "unknown"
 * @internal
 */
export function getCallerTag(): string {
  const stack = new Error().stack;
  if (!stack) return "unknown";
  const lines = stack.split("\n").slice(2);
  for (const line of lines) {
    if (!line.includes("logface")) {
      const match = line.match(/at .*?[/\\]([^/\\]+?):\d+:\d+/);
      if (match) return match[1].replace(/\.[tj]s$/, "");
    }
  }
  return "unknown";
}
