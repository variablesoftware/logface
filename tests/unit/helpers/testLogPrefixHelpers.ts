// tests/unit/testLogPrefixHelpers.ts
// Reusable helpers for matching logface log prefixes with optional test suite identifier tags

/**
 * Returns a regex that matches required [pool:X][worker:Y] tags, then [level][tag], then anything after (the message).
 * If tag is expect.any(String) or '*', matches any tag.
 * Example: [pool:1][worker:2][I][foo] ...
 */
export function testTagPrefixRegex(level: string, tag: string | { [Symbol.toStringTag]: string } | '*') {
  // Allow tag to be wildcard or expect.any(String)
  let tagPattern: string;
  if (tag === '*' || (typeof tag === 'object' && tag && tag.toString && tag.toString() === 'Any')) {
    tagPattern = '[^\]]+'; // any non-empty tag
  } else {
    tagPattern = escapeRegExp(tag as string);
  }
  return new RegExp(`^\\[pool:[^\\]]+]\\[worker:[^\\]]+]\\[${level}]\\[${tagPattern}]`);
}

/**
 * Returns a regex that matches the log prefix for the given level and tag.
 * Use with expect.stringMatching(matchLogPrefix(...)).
 * Tag can be string, '*', or expect.any(String).
 */
export function matchLogPrefix(level: string, tag: string | { [Symbol.toStringTag]: string } | '*') {
  return testTagPrefixRegex(level, tag);
}

/**
 * Returns an array matcher for toHaveBeenCalledWith that matches the new log output shape.
 * Use as: expect(spy).toHaveBeenCalledWith(...matchLogCall('I', 'foo', 'message'))
 *
 * Now returns [RegExp, string] for use with expect.stringMatching().
 * Tag can be string, '*', or expect.any(String).
 */
export function matchLogCall(level: string, tag: string | { [Symbol.toStringTag]: string } | '*', message: string) {
  return [matchLogPrefix(level, tag), message];
}

/**
 * Returns a regex that matches an ISO timestamp, then required [pool:X][worker:Y] tags, then [LEVEL][tag].
 * Tag can be string, '*', or expect.any(String).
 * Example: [2025-05-25T19:36:17.841Z] [pool:1][worker:88][INFO][ts]
 */
export function matchLogPrefixWithTimestamp(level: string, tag: string | { [Symbol.toStringTag]: string } | '*') {
  let tagPattern: string;
  if (tag === '*' || (typeof tag === 'object' && tag && tag.toString && tag.toString() === 'Any')) {
    tagPattern = '[^\]]+';
  } else {
    tagPattern = escapeRegExp(tag as string);
  }
  // Allow for any number of spaces after timestamp, and any trailing message
  return new RegExp(`^\\[\\d{4}-\\d{2}-\\d{2}T.*Z]\\s*\\[pool:[^\\]]+]\\[worker:[^\\]]+]\\[${level}]\\[${tagPattern}](?:\\s.*)?$`, 'i');
}

/**
 * Returns a regex that matches an optional ISO timestamp, required [pool:X][worker:Y] tags, [LEVEL][tag], and optional emoji.
 * Tag can be string, '*', or expect.any(String).
 * Example matches:
 *   [pool:1][worker:2][I][foo] msg
 *   [2025-05-25T19:36:17.841Z] [pool:1][worker:2][I][foo] msg
 *   [pool:1][worker:2][I][foo] 😎 msg
 *   [2025-05-25T19:36:17.841Z] [pool:1][worker:2][I][foo] 😎 msg
 */
export function matchFullLogPrefix({ level, tag, timestamp = false, emoji = false }: {
  level: string;
  tag: string | { [Symbol.toStringTag]: string } | '*';
  timestamp?: boolean;
  emoji?: boolean;
}) {
  // Timestamp: ^[ISO8601] (with trailing space)
  const ts = timestamp ? "\\[\\d{4}-\\d{2}-\\d{2}T.*Z]\\s*" : "";
  // Required test tags: [pool:X][worker:Y]
  const testTags = "\\[pool:[^\\]]+]\\[worker:[^\\]]+]";
  // Level/tag: [LEVEL][tag]
  let tagPattern: string;
  if (tag === '*' || (typeof tag === 'object' && tag && tag.toString && tag.toString() === 'Any')) {
    tagPattern = '[^\\]]+';
  } else {
    tagPattern = escapeRegExp(tag as string);
  }
  const lvlTag = `\\[${level}]\\[${tagPattern}]`;
  // Allow optional space and message after last tag, or nothing at all
  return new RegExp(`^${ts}${testTags}${lvlTag}(?:\\s.*)?$`, 'i');
}

/**
 * Escapes special regex characters in a string for use in a regex pattern.
 * Handles non-string input gracefully.
 */
export function escapeRegExp(str: string) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}
