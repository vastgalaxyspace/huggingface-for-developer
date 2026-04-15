import { guides } from '../src/data/guidesContent.js';

const MIN_TOTAL_WORDS = 220;
const MIN_SECTION_COUNT = 3;
const MIN_FAQ_COUNT = 2;
const MIN_CHECKLIST_COUNT = 3;

const countWords = (value = '') =>
  String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const analyzeGuide = (guide) => {
  const descriptionWords = countWords(guide.description);
  const sectionWords = (guide.sections || []).reduce((sum, section) => {
    return sum + countWords(section.heading) + countWords(section.content);
  }, 0);
  const takeawayWords = (guide.keyTakeaways || []).reduce((sum, item) => sum + countWords(item), 0);
  const faqWords = (guide.faq || []).reduce((sum, item) => sum + countWords(item.q) + countWords(item.a), 0);
  const checklistWords = (guide.checklist || []).reduce((sum, item) => sum + countWords(item), 0);
  const totalWords = descriptionWords + sectionWords + takeawayWords + faqWords + checklistWords;

  const checks = {
    totalWords: totalWords >= MIN_TOTAL_WORDS,
    sections: (guide.sections || []).length >= MIN_SECTION_COUNT,
    faq: (guide.faq || []).length >= MIN_FAQ_COUNT,
    checklist: (guide.checklist || []).length >= MIN_CHECKLIST_COUNT,
  };

  return {
    slug: guide.slug,
    title: guide.title,
    totalWords,
    sectionCount: (guide.sections || []).length,
    faqCount: (guide.faq || []).length,
    checklistCount: (guide.checklist || []).length,
    checks,
    pass: Object.values(checks).every(Boolean),
  };
};

const results = guides.map(analyzeGuide);
const failed = results.filter((item) => !item.pass);

console.log('\nContent Depth Check\n');
for (const item of results) {
  const status = item.pass ? 'PASS' : 'FAIL';
  console.log(
    `[${status}] ${item.slug} | words=${item.totalWords} | sections=${item.sectionCount} | faq=${item.faqCount} | checklist=${item.checklistCount}`
  );
}

if (failed.length > 0) {
  console.log('\nGuides requiring improvement:\n');
  for (const item of failed) {
    const reasons = [];
    if (!item.checks.totalWords) reasons.push(`words < ${MIN_TOTAL_WORDS}`);
    if (!item.checks.sections) reasons.push(`sections < ${MIN_SECTION_COUNT}`);
    if (!item.checks.faq) reasons.push(`faq < ${MIN_FAQ_COUNT}`);
    if (!item.checks.checklist) reasons.push(`checklist < ${MIN_CHECKLIST_COUNT}`);
    console.log(`- ${item.slug}: ${reasons.join(', ')}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nAll guides passed minimum depth checks.\n');
}
