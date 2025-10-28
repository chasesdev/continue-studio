const fs = require('fs');
const bail = (msg) => {
  console.error('❌', msg);
  process.exit(1);
};
// Basic check for duplicate reanimated plugins in mobile app
const mobileBabel = 'apps/mobile/babel.config.js';
if (fs.existsSync(mobileBabel)) {
  const content = fs.readFileSync(mobileBabel, 'utf8');
  const hasOldPlugin = content.includes('react-native-reanimated/plugin');
  const hasWorklets = content.includes('react-native-worklets/plugin');
  if (hasOldPlugin && hasWorklets) {
    bail('Remove one of the Reanimated Babel plugins (keep worklets or rely on Expo auto configuration)');
  }
}
console.log('✅ doctor checks passed');