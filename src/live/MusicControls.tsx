import { useRef, useState } from 'react';
import { useLiveEvents } from './useLiveEvents';
import { sendControl } from './page';

export function MusicControls() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [name, setName] = useState('');
  const [custom, setCustom] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  useLiveEvents({ onMusic: (data) => { setEnabled(data.enabled); setVolume(data.volume); setName(data.name); setCustom(data.custom); } });
  async function control(action: string, text: string) {
    setBusy(true); setMessage('');
    try {
      const result = await sendControl(action, text);
      if (!result.success) throw new Error(result.error || 'Chưa lưu được nhạc nền');
      setMessage('Đã lưu');
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Không kết nối được máy chủ'); }
    finally { setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      if (!/\.(mp3|wav)$/i.test(file.name)) throw new Error('Chọn file MP3 hoặc WAV nhé');
      if (file.size > 30 * 1024 * 1024) throw new Error('File tối đa 30 MB');
      const response = await fetch('/api/music/upload', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name) }, body: file });
      if (response.status === 413) throw new Error('File tối đa 30 MB');
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Chưa tải được file nhạc');
      setMessage('Đã tải nhạc · sẽ phát trên màn hình lớp học');
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Không tải được file nhạc'); }
    finally { setBusy(false); if (fileInput.current) fileInput.current.value = ''; }
  }
  const button = 'rounded-lg bg-slate-800 px-3 py-2 text-white disabled:opacity-50';
  return <section className="space-y-2 rounded-xl bg-slate-900 p-3 text-xs">
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-semibold">🎵 Nhạc nền</span>
      <button type="button" aria-pressed={enabled === true} disabled={busy || enabled === null} onClick={() => control('setMusic', enabled ? 'off' : 'on')} className={button}>{enabled ? '🔇 Tắt nhạc nền' : '▶ Bật nhạc nền'}</button>
      <button type="button" className={button} disabled={busy || enabled === null} onClick={() => fileInput.current?.click()}>📁 Chọn file nhạc</button>
      <input ref={fileInput} type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" aria-label="Chọn file nhạc nền" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
      {name && <button type="button" className={button} disabled={busy} onClick={() => control('setMusicSource', custom ? 'default' : 'file')}>{custom ? 'Dùng nhạc mặc định' : 'Dùng file đã tải'}</button>}
      <label className="flex items-center gap-2">Âm lượng
        <input aria-label="Âm lượng nhạc nền" type="range" min={0} max={1} step={0.05} value={volume} disabled={busy || enabled === null} onChange={(e) => setVolume(Number(e.target.value))} onPointerUp={() => void control('setMusicVolume', String(volume))} onKeyUp={() => void control('setMusicVolume', String(volume))} className="w-28 accent-amber-500" />
        <b>{Math.round(volume * 100)}%</b>
      </label>
    </div>
    <p className="break-words text-slate-300">{custom ? `File đang dùng: ${name}` : 'Đang dùng nhạc mặc định'} · Phát lặp · Tự giảm khi giáo viên nói</p>
    <p className="text-slate-400">MP3 / WAV · Tối đa 30 MB · Lưu trên máy của bạn · Chỉ màn hình lớp học phát tiếng</p>
    <p role="status" className="text-amber-300">{busy ? 'Đang lưu / tải file…' : message}</p>
  </section>;
}
