// @ts-expect-error: require.context is a webpack feature not recognized by TypeScript
const scheduleFiles = require.context("/src", true, /schedule\.ts$/);
scheduleFiles.keys().forEach((key) => {
    scheduleFiles(key);
});