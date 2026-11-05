import { useEffect, useRef, useState } from 'react';
import type { ChatEvent } from './types';
import { maskBanned } from './bannedWords';

const LIMIT = 1000;
type Row = ChatEvent & { id: number };
const clock = (time: number) => new Date(time).toLocaleTimeString('vi-VN', { hour12: false });

export function LiveChat({ standalone = false, fill = false }: { standalone?: boolean; fill?: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState('');
  const buffer = useRef<Row[]>([]);
  const received = useRef(0);
  const sequence = useRef(0);
  const list = useRef<HTMLDivElement>(null);
  const follow = useRef(true);

  useEffect(() => {
    const source = new EventSource('/api/tiktok/events');
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.addEventListener('chat', (event) => {
      try {
        const chat = JSON.parse((event as MessageEvent).data) as ChatEvent;
        if (typeof chat.comment !== 'string' || typeof chat.username !== 'string') return;
        buffer.current.push({ ...chat, id: ++sequence.current });
        if (buffer.current.length > LIMIT) buffer.current.shift();
        received.current++;
      } catch { /* Bỏ sự kiện không hợp lệ. */ }
    });
    return () => source.close();
  }, []);

  // Gom các bình luận để phòng đông không phải vẽ lại mỗi sự kiện.
  useEffect(() => {
    const timer = setInterval(() => {
      setTotal(received.current);
      if (paused || !buffer.current.length) return;
      const batch = buffer.current;
      buffer.current = [];
      setRows((old) => [...old, ...batch].slice(-LIMIT));
    }, 150);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    if (follow.current && list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [rows, query]);

  const search = query.trim().toLocaleLowerCase('vi');
  const shown = rows.filter((r) => !search || `${r.nickname} ${r.username} ${r.comment}`.toLocaleLowerCase('vi').includes(search));
  const button = 'rounded-lg bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-700';
  return (
    <section className={`rounded-2xl bg-slate-900 p-3 ring-1 ring-slate-800 ${fill ? 'flex h-full min-h-0 flex-col' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-semibold">💬 Chat trực tiếp</h2>
        <span className={`text-xs ${connected ? 'text-emerald-400' : 'text-amber-400'}`}>
          {connected ? '● Đang nhận' : '● Đang nối lại…'} · {total.toLocaleString('vi-VN')} bình luận
        </span>
        <button className={button} onClick={() => setPaused((p) => !p)}>{paused ? '▶ Tiếp tục' : '⏸ Dừng cuộn'}</button>
        <button className={button} onClick={() => { buffer.current = []; received.current = 0; setRows([]); setTotal(0); }}>Xóa khung chat</button>
      </div>
      <input className="my-2 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm" aria-label="Tìm bình luận" placeholder="Tìm tên hoặc nội dung bình luận…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div ref={list} onScroll={() => { const el = list.current; if (el) follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48; }}
        className={`overflow-y-auto rounded-lg bg-slate-950 p-2 ${fill ? 'min-h-0 flex-1' : standalone ? 'h-[calc(100dvh-200px)] min-h-48' : 'h-64'}`}>
        {!shown.length && <p className="p-4 text-sm text-slate-400">{rows.length ? 'Không có bình luận khớp tìm kiếm.' : 'Chờ bình luận… Bấm “1000 người cùng đoán” ở trang điều khiển để thử.'}</p>}
        {shown.map((r) => <div key={r.id} className="border-b border-slate-800/60 py-2 text-sm break-words">
          <time className="mr-2 text-xs text-slate-500">{clock(r.createTime ?? r.timestamp ?? Date.now())}</time>
          <strong className="text-cyan-300">{maskBanned(r.nickname || r.username)}</strong>
          <span className="ml-1 text-xs text-slate-500">@{maskBanned(r.username)}</span>
          <p className="mt-0.5 whitespace-pre-wrap text-slate-100">{maskBanned(r.comment)}</p>
        </div>)}
      </div>
      <p className="mt-2 text-xs text-slate-400">Hiện cả đáp án và chat giả lập · Giữ tối đa {LIMIT} bình luận gần nhất từ lúc mở trang.{paused && ' Đang dừng hiển thị; vẫn nhận tối đa 1000 bình luận mới.'}</p>
    </section>
  );
}
