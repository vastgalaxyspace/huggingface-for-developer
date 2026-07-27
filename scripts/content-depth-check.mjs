import { getAllGuides } from '../src/data/guidesContent.js';

// Raised from 900 to 1,200 after AdSense rejected the site for "Low value
// content". At 900 most guides clustered within a few words of the floor, which
// reads as written-to-a-quota rather than written to cover the topic.
const MIN_TOTAL_WORDS = 1200;
const MIN_SECTION_COUNT = 3;
const MIN_FAQ_COUNT = 2;
const MIN_CHECKLIST_COUNT = 3;
const MIN_SOURCE_COUNT = 2;

// No single sentence may be shared by more than this many guides. Nine guides
// once opened with the same five checklist lines verbatim, so a reader comparing
// two pages saw an identical list — the cookie-cutter pattern Google's spam
// policies call out. Cross-page duplication is now a build failure, not a habit.
const MAX_SHARED_SENTENCE_USES = 1;

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
    sources: (guide.sources || []).length >= MIN_SOURCE_COUNT,
    lastUpdated: Boolean(guide.lastUpdated),
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

/**
 * Find checklist lines, section bodies, or FAQ answers reused across guides.
 * Short fragments are ignored — only sentence-length text is a duplication signal.
 */
const findDuplicates = (guides) => {
  const seen = new Map();
  for (const guide of guides) {
    const texts = [
      ...(guide.checklist || []),
      ...(guide.sections || []).map((s) => s.content),
      ...(guide.faq || []).map((f) => f.a),
    ];
    for (const raw of texts) {
      const text = String(raw || '').trim();
      if (countWords(text) < 8) continue;
      if (!seen.has(text)) seen.set(text, new Set());
      seen.get(text).add(guide.slug);
    }
  }
  return [...seen.entries()]
    .filter(([, slugs]) => slugs.size > MAX_SHARED_SENTENCE_USES)
    .map(([text, slugs]) => ({ text, slugs: [...slugs] }))
    .sort((a, b) => b.slugs.length - a.slugs.length);
};

const allGuides = getAllGuides();
const results = allGuides.map(analyzeGuide);
const failed = results.filter((item) => !item.pass);
const duplicates = findDuplicates(allGuides);

console.log('\nContent Depth Check\n');
for (const item of results) {
  const status = item.pass ? 'PASS' : 'FAIL';
  console.log(
    `[${status}] ${item.slug} | words=${item.totalWords} | sections=${item.sectionCount} | faq=${item.faqCount} | checklist=${item.checklistCount}`
  );
}

if (duplicates.length > 0) {
  console.log('\nDuplicate text shared across guides:\n');
  for (const { text, slugs } of duplicates) {
    console.log(`- used by ${slugs.length} (${slugs.join(', ')}):`);
    console.log(`    "${text.slice(0, 100)}${text.length > 100 ? '…' : ''}"`);
  }
  process.exitCode = 1;
}

if (failed.length > 0) {
  console.log('\nGuides requiring improvement:\n');
  for (const item of failed) {
    const reasons = [];
    if (!item.checks.totalWords) reasons.push(`words < ${MIN_TOTAL_WORDS}`);
    if (!item.checks.sections) reasons.push(`sections < ${MIN_SECTION_COUNT}`);
    if (!item.checks.faq) reasons.push(`faq < ${MIN_FAQ_COUNT}`);
    if (!item.checks.checklist) reasons.push(`checklist < ${MIN_CHECKLIST_COUNT}`);
    if (!item.checks.sources) reasons.push(`sources < ${MIN_SOURCE_COUNT}`);
    if (!item.checks.lastUpdated) reasons.push('missing lastUpdated');
    console.log(`- ${item.slug}: ${reasons.join(', ')}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nAll guides passed minimum depth checks.\n');
}
