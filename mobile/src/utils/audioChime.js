// Tiện ích phát âm thanh chuông thông báo (Notification Chime) chuẩn âm thanh cao cấp
// Sử dụng Web Audio API native: mượt mà, không phụ thuộc file ngoài, tương thích iOS Safari & Android

export const playNotificationChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Tone 1: 880 Hz (Nốt A5) - Tiếng chuông trong trẻo
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12); // Lên nốt C6

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 1318.5 Hz (Nốt E6) - Âm vang ngân cao tinh tế (độ trễ 0.1s tạo hiệu ứng Ding-Dong)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.22); // G6

    gain2.gain.setValueAtTime(0.001, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('Notification audio chime error:', err);
  }
};
