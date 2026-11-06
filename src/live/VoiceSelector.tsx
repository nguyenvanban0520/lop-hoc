import { useState } from 'react';
import { useLiveEvents } from './useLiveEvents';
import { sendControl } from './page';

export function VoiceSelector() {
  const [voice, setVoice] = useState('');
  const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(6);
  useLiveEvents({ onVoice: (state) => { setVoice(state.selected); setOptions(state.options); setRate(state.rate); setPitch(state.pitch); } });
  async function select(value: string, action = 'setVoice') {
    setBusy(true); setMessage('');
    try {
      const result = await sendControl(action, value);
      if (!result.success) throw new Error(result.error || 'Chưa lưu được giọng đọc');
      if (action === 'setVoice') setVoice(value);
      setMessage('Đã lưu · áp dụng từ câu đọc tiếp theo');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không kết nối được máy chủ'); }
    finally { setBusy(false); }
  }
  return <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-slate-900 p-3 text-xs">
    <label htmlFor="teacher-voice" className="text-slate-300">Giọng giáo viên</label>
    <select id="teacher-voice" className="rounded-lg bg-slate-800 px-3 py-2 text-white disabled:opacity-50" value={voice} disabled={busy || !options.length} onChange={(event) => select(event.target.value)}>
      {!options.length && <option value="">Đang tải giọng…</option>}
      {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
    <label className="flex items-center gap-2">Tốc độ
      <input aria-label="Tốc độ giọng" type="range" min={0.5} max={1.5} step={0.05} value={rate} disabled={busy || !options.length} onChange={(e) => setRate(Number(e.target.value))} onPointerUp={() => void select(String(rate), 'setRate')} onKeyUp={() => void select(String(rate), 'setRate')} className="w-28 accent-amber-500" />
      <b className="w-12">{rate.toFixed(2)}×</b>
    </label>
    <label className="flex items-center gap-2">Cao độ
      <input aria-label="Cao độ giọng" type="range" min={-30} max={30} step={1} value={pitch} disabled={busy || !options.length} onChange={(e) => setPitch(Number(e.target.value))} onPointerUp={() => void select(String(pitch), 'setPitch')} onKeyUp={() => void select(String(pitch), 'setPitch')} className="w-28 accent-amber-500" />
      <b className="w-12">{pitch > 0 ? '+' : ''}{pitch}%</b>
    </label>
    <button className="rounded-lg bg-slate-800 px-3 py-2 disabled:opacity-50" disabled={busy || !options.length} onClick={async () => { await select('1', 'setRate'); await select('0', 'setPitch'); }}>Giọng tự nhiên</button>
    <span role="status" className="text-slate-400">{busy ? 'Đang lưu…' : message || 'Tự lưu lựa chọn · giọng tiếng Anh giữ riêng'}</span>
  </div>;
}
