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

    // 初始化頁面
    function init() {
        // 預設顯示計時器模式
        modeButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-mode="timer"]').classList.add('active');
        modeTitle.setAttribute('data-lang', 'timer');
        modeTitle.textContent = document.querySelector('[data-mode="timer"]').textContent;
        timerSettings.style.display = 'flex'; // 顯示計時器設定
        updateDisplay();
    }

    // 格式化時間為 hh:mm:ss.毫秒
    function formatTime(ms) {
        const hours = Math.floor(ms / 3600000); // 計算小時
        const minutes = Math.floor((ms % 3600000) / 60000); // 計算分鐘
        const seconds = Math.floor((ms % 60000) / 1000); // 計算秒
        const milliseconds = Math.floor((ms % 1000) / 10); // 計算毫秒（兩位數）
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
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
            modeTitle.textContent = button.textContent;

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