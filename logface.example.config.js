// logface.example.config.js
// Example config for logface: multiple emoji sets and randomization

// eslint-disable-next-line no-undef
module.exports = {
  // Enable random emoji selection for each log message
  emojiRandom: true,

  // Provide multiple emoji options per log level (as arrays)
  emojis: {
    debug: ["🐛", "🔍", "🦠"],
    info: ["ℹ️", "💡", "🧭"],
    log: ["📝", "📄", "🗒️"],
    warn: ["⚠️", "🚧", "🛑"],
    error: ["🔥", "💥", "💣"],
  },

  // Optionally, you can specify color options as well
  colorEnabled: true, // or false to disable color
  colorLibrary: "chalk", // 'chalk', 'picocolors', 'colorette', or 'kleur'
};
