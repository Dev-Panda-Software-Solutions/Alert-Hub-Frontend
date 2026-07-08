const fs = require('fs');
const content = fs.readFileSync('d:/startup/alter_hub/Alert-Hub-Frontend/src/assets/dump.txt', 'utf-8');
const match = content.match(/<svg[\s\S]*?<\/svg>/);
if (match) {
  fs.writeFileSync('d:/startup/alter_hub/Alert-Hub-Frontend/src/assets/empty-reminders.svg', match[0]);
  console.log('Extracted successfully');
} else {
  console.log('Not found in dump');
}
