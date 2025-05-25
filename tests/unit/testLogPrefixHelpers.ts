// tests/unit/testLogPrefixHelpers.ts
// Reusable helpers for matching logface log prefixes with optional test suite identifier tags

/**
 * Returns a regex that matches required [pool:X][worker:Y] tags, then [level][tag], then anything after (the message).
 * Example: [pool:1][worker:2][I][foo] ...
 */
export function testTagPrefixRegex(level: string, tag: string) {
  // Require [pool:X][worker:Y] in order
  return new RegExp(`^\\[pool:[^\\]]+]\\[worker:[^\\]]+]\\[${level}]\\[${escapeRegExp(tag)}]`);
}

/**
 * Returns a regex that matches the log prefix for the given level and tag.
 * Use with expect.stringMatching(matchLogPrefix(...)).
 */
export function matchLogPrefix(level: string, tag: string) {
  return testTagPrefixRegex(level, tag);
}

/**
 * Returns an array matcher for toHaveBeenCalledWith that matches the new log output shape.
 * Use as: expect(spy).toHaveBeenCalledWith(...matchLogCall('I', 'foo', 'message'))
 *
 * Now returns [RegExp, string] for use with expect.stringMatching().
 */
export function matchLogCall(level: string, tag: string, message: string) {
  return [matchLogPrefix(level, tag), message];
}

/**
 * Returns a regex that matches an ISO timestamp, then required [pool:X][worker:Y] tags, then [LEVEL][tag].
 * Example: [2025-05-25T19:36:17.841Z] [pool:1][worker:88][INFO][ts]
 */
export function matchLogPrefixWithTimestamp(level: string, tag: string) {
  return new RegExp(`^\\[\\d{4}-\\d{2}-\\d{2}T.*Z] \\[pool:[^\\]]+]\\[worker:[^\\]]+]\\[${level}]\\[${escapeRegExp(tag)}]`);
}

/**
 * Returns a regex that matches an optional ISO timestamp, required [pool:X][worker:Y] tags, [LEVEL][tag], and optional emoji.
 * Example matches:
 *   [pool:1][worker:2][I][foo] msg
 *   [2025-05-25T19:36:17.841Z] [pool:1][worker:2][I][foo] msg
 *   [pool:1][worker:2][I][foo] 😎 msg
 *   [2025-05-25T19:36:17.841Z] [pool:1][worker:2][I][foo] 😎 msg
 */
export function matchFullLogPrefix({ level, tag, timestamp = false, emoji = false }: {
  level: string;
  tag: string;
  timestamp?: boolean;
  emoji?: boolean;
}) {
  // Timestamp: ^[ISO8601] (with trailing space)
  const ts = timestamp ? "(?:\\[\\d{4}-\\d{2}-\\d{2}T.*Z] )?" : "";
  // Required test tags: [pool:X][worker:Y]
  const testTags = "\\[pool:[^\\]]+]\\[worker:[^\\]]+]";
  // Level/tag: [LEVEL][tag]
  const lvlTag = `\\[${level}]\\[${escapeRegExp(tag)}]`;
  // Emoji: optional space + emoji (non-space, non-bracket, non-word char)
  const emojiPart = emoji ? "(?: [^\\w\\[\\] ]+)?" : "(?: [^\\w\\[\\] ]+)?"; // always allow optional emoji
  // Allow trailing space or message
  return new RegExp(`^${ts}${testTags}${lvlTag}${emojiPart}`);
}

/**
 * Escapes special regex characters in a string for use in a regex pattern.
 * Handles non-string input gracefully.
 */
export function escapeRegExp(str: string) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}
