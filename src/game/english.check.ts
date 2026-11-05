import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseBank } from './questions';

process.env.ENGLISH_ONLY = '1';
const { GAME } = await import('./config');
const { Classroom } = await import('./quiz');
const bank = parseBank({ '25-tieng-anh.txt': fs.readFileSync(new URL('./cau-hoi/25-tieng-anh.txt', import.meta.url), 'utf8') });
assert.equal(GAME.roundPlan.length, 20);
assert.ok(GAME.roundPlan.every((slot) => slot === 'anh'));
assert.equal(GAME.showEvery, 0);
const room = new Classroom(bank, 1000);
room.newRound(1000);
let now = 1000;
const questions = new Set<string>();
let englishSpeech = false;
for (let i = 0; i < 120 && questions.size < 20; i++) {
  now = room.phaseEndsAt + 1;
  const lines = room.tick(now);
  if (room.q && ['question', 'bonus', 'reveal'].includes(room.phase)) {
    assert.equal(room.q.slot, 'anh');
    assert.equal(room.q.math, undefined);
    questions.add(room.q.id);
  }
  if (room.phase === 'reveal') englishSpeech ||= lines.some((line) => line.text.includes('| E:'));
}
assert.equal(questions.size, 20, 'Một tiết phải có đủ 20 từ khác nhau');
assert.ok(englishSpeech, 'Đáp án phải được đọc bằng giọng tiếng Anh');
console.log(`english.check: ${bank.length} từ nguồn; tiết 20 câu tiếng Anh không lặp; giữ giọng đọc Anh, tắt game trắc nghiệm Việt`);
