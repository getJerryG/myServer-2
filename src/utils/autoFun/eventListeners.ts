// @ts-expect-error: require.context is a webpack feature not recognized by TypeScript
const eventFiles = require.context("/src", true, /event\.ts$/);
eventFiles.keys().forEach((key) => {
    eventFiles(key);
});