document.addEventListener('DOMContentLoaded', () => {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeTitle = document.querySelector('.mode-title');
    const timerSettings = document.querySelector('.timer-settings');
    const display = document.querySelector('.display');
    const startBtn = document.querySelector('[data-action="start"]');
    const pauseBtn = document.querySelector('[data-action="pause"]');
    const resetBtn = document.querySelector('[data-action="reset"]');
    const lapBtn = document.querySelector('[data-action="lap"]');
    const lapsList = document.querySelector('.laps-list');
    const alarmSound = document.getElementById('alarm-sound'); // 獲取音效元素

    let currentMode = 'timer'; // 預設為計時器模式
    let time = 0;
    let intervalId = null;
    let isRunning = false;
    let laps = [];
    let currentLang = 'zh'; // 預設語言為中文

    // 檢測瀏覽器語言
    function detectLanguage() {
        const lang = navigator.language || navigator.languages[0];
        if (lang.startsWith('zh')) {
            return 'zh'; // 中文
        } else {
            return 'en'; // 英文（或其他語言）
        }
    }

    // 更新頁面語言
    function updateLanguage() {
        currentLang = detectLanguage();
        const langKey = `data-lang-${currentLang}`;

        // 更新標題
        document.querySelector('title').textContent = document.querySelector('title').getAttribute(langKey);

        // 更新所有帶 data-lang 的元素
        document.querySelectorAll('[data-lang]').forEach(element => {
            element.textContent = element.getAttribute(langKey);
        });

        // 更新 <select> 元素的選項
        document.querySelectorAll('select option').forEach(option => {
            option.textContent = option.getAttribute(langKey);
        });
    }

    // 初始化頁面
    function init() {
        // 設置語言
        updateLanguage();

        // 預設顯示計時器模式
        modeButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-mode="timer"]').classList.add('active');
        modeTitle.setAttribute('data-lang', 'timer');
        modeTitle.textContent = document.querySelector('[data-mode="timer"]').getAttribute(`data-lang-${currentLang}`);
        timerSettings.style.display = 'flex'; // 顯示計時器設定
        updateDisplay();
    }

    // 格式化時間
    function formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    }

    // 更新顯示
    function updateDisplay() {
        display.textContent = formatTime(time);
    }

    // 重置計時器
    function resetTimer() {
        clearInterval(intervalId);
        isRunning = false;
        time = 0;
        laps = [];
        lapsList.innerHTML = '';
        updateDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        lapBtn.disabled = true;
        // 停止音效
        if (alarmSound) {
            alarmSound.pause();
            alarmSound.currentTime = 0; // 重置音效到開頭
        }
    }

    // 切換模式
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentMode = button.getAttribute('data-mode');
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            modeTitle.setAttribute('data-lang', currentMode);
            modeTitle.textContent = button.getAttribute(`data-lang-${currentLang}`);

            // 根據模式顯示或隱藏 timer-settings
            if (currentMode === 'timer') {
                timerSettings.style.display = 'flex';
            } else {
                timerSettings.style.display = 'none';
            }

            resetTimer();
        });
    });

    // 開始計時
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            intervalId = setInterval(() => {
                if (currentMode === 'stopwatch') {
                    time += 10;
                } else if (currentMode === 'timer') {
                    if (time > 0) {
                        time -= 10;
                    } else {
                        clearInterval(intervalId);
                        isRunning = false;
                        startBtn.disabled = true;
                        pauseBtn.disabled = true;
                        // 時間到時播放音效
                        if (alarmSound) {
                            alarmSound.play().catch(error => {
                                console.error('音效播放失敗:', error);
                            });
                        }
                    }
                }
                updateDisplay();
            }, 10);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            lapBtn.disabled = false;
        }
    });

    // 暫停計時
    pauseBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(intervalId);
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            lapBtn.disabled = true;
        }
    });

    // 重置計時
    resetBtn.addEventListener('click', resetTimer);

    // 分圈
    lapBtn.addEventListener('click', () => {
        if (currentMode === 'stopwatch') {
            laps.push(time);
            const lapItem = document.createElement('div');
            lapItem.classList.add('lap-item', 'fade-in');
            lapItem.textContent = display.textContent;
            lapsList.prepend(lapItem);
        }
    });

    // 設置自訂時間
    document.querySelector('.set-custom-btn').addEventListener('click', () => {
        if (currentMode === 'timer') {
            const hours = parseInt(document.getElementById('custom-hours').value) * 3600000;
            const minutes = parseInt(document.getElementById('custom-minutes').value) * 60000;
            const seconds = parseInt(document.getElementById('custom-seconds').value) * 1000;
            time = hours + minutes + seconds;
            updateDisplay();
        }
    });

    // 快速設置時間按鈕
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentMode === 'timer') {
                time = parseInt(btn.getAttribute('data-duration'));
                updateDisplay();
            }
        });
    });

    // 初始化頁面
    init();
});