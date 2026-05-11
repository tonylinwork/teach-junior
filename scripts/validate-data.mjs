import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dataDir = path.join(root, 'src', 'data');
const excluded = new Set(['chapters.json', 'summaryData.json']);
const sectionTypes = new Set(['true_false', 'single_choice', 'multi_choice']);
const errors = [];

const readJson = async (filePath) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    errors.push(`Invalid JSON: ${path.relative(root, filePath)} (${error.message})`);
    return null;
  }
};

const stripHtml = (value) => String(value ?? '').replace(/<[^>]*>/g, '').trim();

const optionTexts = (content) => {
  const matches = [...String(content ?? '').matchAll(/<p>([A-E])\.\s*([\s\S]*?)<\/p>/g)];
  return matches.map((match) => ({
    letter: match[1],
    text: stripHtml(match[2]),
  }));
};

const files = (await readdir(dataDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => name.endsWith('.json') && !excluded.has(name) && !name.endsWith('.bak'))
  .sort();

const chapters = await readJson(path.join(dataDir, 'chapters.json'));
const chapterIds = Array.isArray(chapters) ? chapters.map((chapter) => chapter.id) : [];
const fileIds = files.map((file) => path.basename(file, '.json'));

for (const id of chapterIds) {
  if (!fileIds.includes(id)) errors.push(`chapters.json lists missing file: ${id}.json`);
}

for (const id of fileIds) {
  if (!chapterIds.includes(id)) errors.push(`Data file is missing from chapters.json: ${id}.json`);
}

const questionIds = new Map();
let questionCount = 0;

for (const file of files) {
  const chapterId = path.basename(file, '.json');
  const relativeFile = path.join('src', 'data', file);
  const quiz = await readJson(path.join(dataDir, file));
  if (!quiz) continue;

  if (!quiz.title) errors.push(`${relativeFile}: missing title`);
  if (!quiz.summary) errors.push(`${relativeFile}: missing summary`);
  if (!Array.isArray(quiz.sections) || quiz.sections.length === 0) {
    errors.push(`${relativeFile}: missing sections`);
    continue;
  }

  const numbers = [];

  for (const section of quiz.sections) {
    if (!sectionTypes.has(section.type)) errors.push(`${relativeFile}: unknown section type "${section.type}"`);
    if (!Array.isArray(section.questions)) {
      errors.push(`${relativeFile}: section "${section.name ?? section.type}" missing questions`);
      continue;
    }

    for (const question of section.questions) {
      questionCount += 1;
      numbers.push(question.number);

      const label = `${relativeFile} ${question.id ?? `(question ${question.number})`}`;
      const expectedId = `${chapterId}_q${question.number}`;

      if (question.id !== expectedId) errors.push(`${label}: expected id "${expectedId}"`);
      if (questionIds.has(question.id)) errors.push(`${label}: duplicate id also in ${questionIds.get(question.id)}`);
      questionIds.set(question.id, relativeFile);
      if (question.type !== section.type) errors.push(`${label}: question type must match section type "${section.type}"`);
      if (!question.content) errors.push(`${label}: missing content`);
      if (!question.explanation) errors.push(`${label}: missing explanation`);

      if (typeof question.answer !== 'string') {
        errors.push(`${label}: answer must be a string`);
        continue;
      }

      if (question.type === 'true_false' && !['○', '╳'].includes(question.answer)) {
        errors.push(`${label}: true_false answer must be ○ or ╳`);
      }

      if (question.type === 'single_choice' && !/^[A-E]$/.test(question.answer)) {
        errors.push(`${label}: single_choice answer must be A-E`);
      }

      if (question.type === 'multi_choice' && !/^[A-E]+$/.test(question.answer)) {
        errors.push(`${label}: multi_choice answer must be letters A-E without spaces`);
      }

      if (['single_choice', 'multi_choice'].includes(question.type)) {
        const options = optionTexts(question.content);
        for (const letter of ['A', 'B', 'C', 'D']) {
          if (!options.some((option) => option.letter === letter)) errors.push(`${label}: missing option ${letter}`);
        }
        for (const letter of question.answer.split('')) {
          if (!options.some((option) => option.letter === letter)) errors.push(`${label}: answer references missing option ${letter}`);
        }

        const seen = new Map();
        for (const option of options) {
          if (!option.text) continue;
          if (seen.has(option.text)) {
            errors.push(`${label}: duplicate option text "${option.text}"`);
          }
          seen.set(option.text, option.letter);
        }
      }
    }
  }

  const max = Math.max(...numbers);
  for (let number = 1; number <= max; number += 1) {
    if (!numbers.includes(number)) errors.push(`${relativeFile}: missing question number ${number}`);
  }
}

if (errors.length > 0) {
  console.error(`Data validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Data validation passed: ${files.length} chapter files, ${questionCount} questions.`);
