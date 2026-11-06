import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // lvh.me trỏ về 127.0.0.1; TikTok LIVE Studio không nhận "localhost"
    allowedHosts: ['lvh.me'],
    // Sổ lớp được ghi mỗi 20 giây; không được coi dữ liệu này là mã nguồn để tải lại stage.
    watch: {
      ignored: ['**/data/**', '**/data-*/**', '**/settings*.json', '**/.npm-cache/**', '**/music-uploads/**'],
    },
  },
});
