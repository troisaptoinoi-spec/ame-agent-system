/**
 * Storage Module - Quản lý lưu trữ điểm và cài đặt
 */
const Storage = (() => {
    const KEYS = {
        HIGH_SCORE: 'snake_high_score',
        SOUND_ENABLED: 'snake_sound_enabled'
    };

    function getHighScore() {
        try {
            return parseInt(localStorage.getItem(KEYS.HIGH_SCORE)) || 0;
        } catch {
            return 0;
        }
    }

    function setHighScore(score) {
        try {
            localStorage.setItem(KEYS.HIGH_SCORE, score.toString());
        } catch {
            // Storage not available
        }
    }

    function isSoundEnabled() {
        try {
            const val = localStorage.getItem(KEYS.SOUND_ENABLED);
            return val === null ? true : val === 'true';
        } catch {
            return true;
        }
    }

    function setSoundEnabled(enabled) {
        try {
            localStorage.setItem(KEYS.SOUND_ENABLED, enabled.toString());
        } catch {
            // Storage not available
        }
    }

    return {
        getHighScore,
        setHighScore,
        isSoundEnabled,
        setSoundEnabled
    };
})();
