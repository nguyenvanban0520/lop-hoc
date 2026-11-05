import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Classroom } from './quiz';
import { parseBank } from './questions';

const dir = new URL('./cau-hoi/', import.meta.url);
const bank = parseBank(Object.fromEntries(fs.readdirSync(dir).map((name) => [name, fs.readFileSync(new URL(name, dir), 'utf8')])));
const room = new Classroom(bank, 1000);
room.forceVocabulary(1000);
assert.equal(room.view(1000).vocabularyMode, true);
const ids = new Set<string>();
for (let i = 0; i < 120 && ids.size < 20; i++) {
  room.tick(room.phaseEndsAt + 1);
  if (room.q) { assert.equal(room.q.slot, 'anh'); ids.add(room.q.id); }
}
assert.equal(ids.size, 20);
room.forceClassroom(room.phaseEndsAt + 1);
assert.equal(room.view(room.phaseStartedAt).vocabularyMode, false);
let mixed = false;
for (let i = 0; i < 20; i++) {
  room.tick(room.phaseEndsAt + 1);
  if (room.q && room.q.slot !== 'anh') { mixed = true; break; }
}
assert.ok(mixed, 'Có thể quay lại lớp học hỗn hợp');
console.log('vocabulary.check: bấm Từ Vựng được 20 câu Anh; chuyển lại Lớp Học Chữ được bộ câu gốc');
