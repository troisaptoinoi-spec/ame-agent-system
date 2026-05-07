/**
 * Sound Module - Hệ thống âm thanh sử dụng Web Audio API
 * Không cần file âm thanh bên ngoài
 */
const Sound = (() => {
    let audioCtx = null;
    let enabled = true;

    function init() {
        enabled = Storage.isSoundEnabled();
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch {
            console.warn('Web Audio API not supported');
        }
    }

    function ensureContext() {
        if (!audioCtx) return false;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return true;
    }

    function playTone(frequency, duration, type = 'sine', volume = 0.15) {
        if (!enabled || !ensureContext()) return;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    }

    function playEat() {
        // Âm thanh khi ăn thức ăn - nốt tăng dần
        playTone(523, 0.08, 'sine', 0.12);  // C5
        setTimeout(() => playTone(659, 0.08, 'sine', 0.12), 50);  // E5
        setTimeout(() => playTone(784, 0.12, 'sine', 0.15), 100); // G5
    }

    function playGameOver() {
        // Âm thanh khi thua - nốt giảm dần
        playTone(440, 0.15, 'sawtooth', 0.1);
        setTimeout(() => playTone(349, 0.15, 'sawtooth', 0.1), 150);
        setTimeout(() => playTone(294, 0.2, 'sawtooth', 0.1), 300);
        setTimeout(() => playTone(220, 0.4, 'sawtooth', 0.08), 450);
    }

    function playMove() {
        // Âm thanh di chuyển rất nhẹ
        playTone(200, 0.03, 'sine', 0.02);
    }

    function playStart() {
        // Âm thanh bắt đầu
        playTone(330, 0.1, 'sine', 0.1);
        setTimeout(() => playTone(440, 0.1, 'sine', 0.1), 100);
        setTimeout(() => playTone(550, 0.15, 'sine', 0.12), 200);
    }

    function playNewRecord() {
        // Âm thanh kỷ lục mới
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.15, 'sine', 0.12), i * 120);
        });
    }

    function toggle() {
        enabled = !enabled;
        Storage.setSoundEnabled(enabled);
        return enabled;
    }

    function isEnabled() {
        return enabled;
    }

    return {
        init,
        playEat,
        playGameOver,
        playMove,
        playStart,
        playNewRecord,
        toggle,
        isEnabled
    };
})();
