const fs = require('fs');
const content = fs.readFileSync('server/routes.ts', 'utf8');

const pairMatch = content.match(/\["([^"]+)"\s*,\s*"Thank you"\]/);
const itemMatch = content.match(/gurmukhi:\s*"([^"]+)",\s*romanized:\s*"Shukriya"/);

console.log('Pair:', pairMatch ? pairMatch[1] : 'not found');
console.log('Item:', itemMatch ? itemMatch[1] : 'not found');
if (pairMatch && itemMatch) {
  console.log('Exact match?', pairMatch[1] === itemMatch[1]);
  for (let i = 0; i < pairMatch[1].length; i++) {
    console.log(pairMatch[1][i], pairMatch[1].charCodeAt(i));
  }
  console.log('---');
  for (let i = 0; i < itemMatch[1].length; i++) {
    console.log(itemMatch[1][i], itemMatch[1].charCodeAt(i));
  }
}
