import { parseBank } from './questions';
import { ENGLISH_ONLY } from './mode';
import { parseCodes, parseMc, type ShowBank } from './show';

// Vite gom mọi file câu hỏi lúc chạy; thêm file .txt vào cau-hoi/ là tự có
const files = import.meta.glob('./cau-hoi/*.txt', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const allQuestions = parseBank(files);
export const QUESTIONS = ENGLISH_ONLY ? allQuestions.filter((q) => q.slot === 'anh') : allQuestions;

// 2 game lớn (bản riêng): câu trắc nghiệm + mật mã
const show = import.meta.glob('./cau-hoi-show/*.txt', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const showFile = (name: string) => Object.entries(show).find(([p]) => p.endsWith(`/${name}`))?.[1] ?? '';
export const SHOW_BANK: ShowBank = ENGLISH_ONLY ? { mc: [], codes: [] } : { mc: parseMc(showFile('trac-nghiem.txt')), codes: parseCodes(showFile('mat-ma.txt')) };
