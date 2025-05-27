/**
 * Match a scope or level against a user-defined LOG pattern.
 * Supports wildcards such as `auth*` and `auth:*`.
 * @param scope - The tag or level name
 * @param pattern - The filter string, supports wildcards
 * @returns True if the scope matches the pattern
 * @internal
 */
export function matchesScopeFilter(scope: string, pattern: unknown): boolean {
  if (pattern == null) return true;
  if (typeof pattern === 'string') {
    if (pattern.endsWith(":*")) {
      return (
        scope === pattern.slice(0, -2) || scope.startsWith(pattern.slice(0, -1))
      );
    }
    if (pattern.endsWith("*")) {
      return scope.startsWith(pattern.slice(0, -1));
    }
    return scope === pattern;
  }
  if (pattern instanceof RegExp) {
    return pattern.test(scope);
  }
  if (typeof pattern === 'function') {
    return !!pattern(scope);
  }
  return false;
}
