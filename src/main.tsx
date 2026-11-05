import { createRoot } from 'react-dom/client';
import './index.css';

async function start() {
  const mode = await fetch('/api/game/mode').then((r) => {
    if (!r.ok) throw new Error('Không đọc được cấu hình lớp học');
    return r.json();
  });
  globalThis.__ENGLISH_ONLY__ = mode.englishOnly === true;
  if (!mode.englishOnly && new URLSearchParams(window.location.search).get('game') === 'english') {
    const url = new URL('/', window.location.href);
    url.port = '3007';
    window.location.replace(url.href);
    return;
  }
  document.title = mode.englishOnly ? 'Lớp Học Tiếng Anh' : 'Lớp Học Chữ';
  const { default: App } = await import('./App');
  const { LiveChat } = await import('./live/LiveChat');
  createRoot(document.getElementById('root')!).render(
    new URLSearchParams(window.location.search).get('view') === 'chat'
      ? <div className="min-h-screen bg-slate-950 p-4 text-slate-100"><LiveChat standalone /></div>
      : <App />,
  );
}

start().catch(() => {
  document.getElementById('root')!.textContent = 'Chưa kết nối được máy chủ lớp học. Bạn tải lại trang để thử lại nhé.';
});
