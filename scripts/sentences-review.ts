import { readFileSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';

interface Sentence {
  id: string;
  polish: string;
  english: string;
  level: string;
  tags: string[];
}

const inputFile = process.argv[2];

if (!inputFile) {
  console.error('Usage: npm run sentences:review <file.json>');
  process.exit(1);
}

const filePath = resolve(process.cwd(), inputFile);
const sentences: Sentence[] = JSON.parse(readFileSync(filePath, 'utf-8'));

const reviewList = sentences.map((s) => ({
  id: s.id,
  polish: s.polish,
  english: s.english,
}));

const outputName = basename(inputFile, '.json') + '-review.json';
const outputPath = resolve(process.cwd(), outputName);

writeFileSync(outputPath, JSON.stringify(reviewList, null, 2));
console.log(`Created ${outputName} with ${sentences.length} sentences`)

