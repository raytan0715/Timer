// 初始狀態
let time = 0;
let isRunning = false;
let mode = 'stopwatch';
let laps = [];
let timerRemaining = 5 * 60 * 1000; // 默認 5 分鐘
let timerDuration = 5 * 60 * 1000;
let intervalId = null;
let startTime = 0;
let accumulatedTime = 0;

// 語言設定
const language = navigator.language || navigator.userLanguage; // 獲取瀏覽器語言
const isChinese = language.startsWith('zh'); // 檢查是否為中文環境
const translations = {
    zh: {
        title: '計時器與碼表',
        stopwatch: '碼表',
        timer: '計時器',
        'duration-1m': '1 分鐘',
        'duration-5m': '5 分鐘',
        'duration-10m': '10 分鐘',
        set: '設定',
        start: '開始',
        pause: '暫停',
        reset: '重置',
        lap: '分圈',
        laps: '分圈時間',
        hour: '時',
        minute: '分',
        second: '秒',
        setAlert: '已設定為 {h} 時 {m} 分 {s} 秒！',
        invalidAlert: '請選擇有效的時間！',
        timerEnd: '計時結束！'
    },
    en: {
        title: 'Timer & Stopwatch',
        stopwatch: 'Stopwatch',
        timer: 'Timer',
        'duration-1m': '1 Minute',
        'duration-5m': '5 Minutes',
        'duration-10m': '10 Minutes',
        set: 'Set',
        start: 'Start',
        pause: 'Pause',
        reset: 'Reset',
        lap: 'Lap',
        laps: 'Lap Times',
        hour: 'hr',
        minute: 'min',
        second: 'sec',
        setAlert: 'Set to {h} hr {m} min {s} sec!',
        invalidAlert: 'Please select a valid time!',
        timerEnd: 'Time is up!'
    }
};

// 選擇當前語言
const lang = isChinese ? translations.zh : translations.en;

// 更新頁面語言
function updateLanguage() {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        element.textContent = lang[key];
    });

    // 更新 <select> 選項的語言
    const customHours = document.getElementById('custom-hours');
    const customMinutes = document.getElementById('custom-minutes');
    const customSeconds = document.getElementById('custom-seconds');

    // 清空現有選項
    customHours.innerHTML = '';
    customMinutes.innerHTML = '';
    customSeconds.innerHTML = '';

    // 動態生成小時選項（0-23）
    for (let h = 0; h <= 23; h++) {
        const option = document.createElement('option');
        option.value = h;
        option.textContent = `${h} ${lang.hour}`;
        customHours.appendChild(option);
    }

    // 動態生成分鐘選項（0-60）
    for (let m = 0; m <= 60; m++) {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = `${m} ${lang.minute}`;
        customMinutes.appendChild(option);
    }

    // 動態生成秒選項（0-60）
    for (let s = 0; s <= 60; s++) {
        const option = document.createElement('option');
        option.value = s;
        option.textContent = `${s} ${lang.second}`;
        customSeconds.appendChild(option);
    }

    // 設置預設值
    customHours.value = 0;
    customMinutes.value = 5;
    customSeconds.value = 0;

    // 更新標題
    document.title = lang.title;
}

// 初始語言設置
updateLanguage();

// 元素選擇器
const display = document.querySelector('.display');
const modeButtons = document.querySelectorAll('.mode-btn');
const controlButtons = document.querySelectorAll('.control-btn');
const lapsList = document.querySelector('.laps-list');
const modeTitle = document.querySelector('.mode-title');
const timerSettings = document.querySelector('.timer-settings');
const durationButtons = document.querySelectorAll('.duration-btn');
const customHours = document.getElementById('custom-hours');
const customMinutes = document.getElementById('custom-minutes');
const customSeconds = document.getElementById('custom-seconds');
const setCustomBtn = document.querySelector('.set-custom-btn');

// 更新顯示時間
function updateDisplay(ms) {
    const milliseconds = Math.floor(ms % 1000).toString().padStart(3, '0');
    const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
    const minutes = Math.floor((ms / (1000 * 60)) % 60).toString().padStart(2, '0');
    const hours = Math.floor(ms / (1000 * 60 * 60)).toString().padStart(2, '0');

    if (hours === '00') {
        display.textContent = `${minutes}:${seconds}.${milliseconds.substring(0, 2)}`;
    } else {
        display.textContent = `${hours}:${minutes}:${seconds}.${milliseconds.substring(0, 2)}`;
    }
}

// 開始碼表
function startStopwatch() {
    if (!isRunning) {
        startTime = Date.now() - accumulatedTime;
        intervalId = setInterval(() => {
            const currentTime = Date.now() - startTime;
            time = currentTime;
            updateDisplay(time);
        }, 10);
        isRunning = true;
        updateButtonStates();
    }
}

// 開始計時器
function startTimer() {
    if (!isRunning && timerRemaining > 0) {
        startTime = Date.now();
        const initialRemaining = timerRemaining;
        intervalId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            timerRemaining = Math.max(0, initialRemaining - elapsed);
            updateDisplay(timerRemaining);
            if (timerRemaining <= 0) {
                pauseTimer();
                alert(lang.timerEnd); // 計時結束提示
            }
        }, 10);
        isRunning = true;
        updateButtonStates();
    }
}

// 暫停
function pause() {
    if (isRunning) {
        clearInterval(intervalId);
        if (mode === 'stopwatch') {
            accumulatedTime = time;
        }
        isRunning = false;
        updateButtonStates();
    }
}

// 重置
function reset() {
    clearInterval(intervalId);
    if (mode === 'stopwatch') {
        time = 0;
        accumulatedTime = 0;
        laps = [];
        updateDisplay(time);
        lapsList.innerHTML = '';
    } else {
        timerRemaining = timerDuration;
        updateDisplay(timerRemaining);
    }
    isRunning = false;
    updateButtonStates();
}

// 記錄分圈
function lap() {
    if (isRunning && mode === 'stopwatch') {
        laps.unshift(time); // 添加到陣列開頭
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item fade-in';
        const lapNumber = laps.length;
        const lapTime = formatTime(time);
        lapItem.textContent = `${lang.lap} ${lapNumber}: ${lapTime}`; // 動態語言
        lapsList.prepend(lapItem); // 插入到列表頂部
    }
}

// 切換模式
function switchMode(newMode) {
    clearInterval(intervalId);
    mode = newMode;
    isRunning = false;
    accumulatedTime = 0;
    if (mode === 'stopwatch') {
        time = 0;
        updateDisplay(time);
        laps = [];
        lapsList.innerHTML = '';
        modeTitle.textContent = lang.stopwatch;
        timerSettings.style.display = 'none';
    } else {
        timerRemaining = timerDuration;
        updateDisplay(timerRemaining);
        modeTitle.textContent = lang.timer;
        timerSettings.style.display = 'flex';
    }
    updateButtonStates();
    timerContainer.classList.add('fade-in');
    setTimeout(() => timerContainer.classList.remove('fade-in'), 500);
}

// 設置計時器持續時間
function setTimerDuration(duration) {
    timerDuration = duration;
    timerRemaining = duration;
    if (!isRunning && mode === 'timer') {
        updateDisplay(timerRemaining);
    }
    clearInterval(intervalId);
}

// 設置自訂時間
function setCustomDuration() {
    const hours = parseInt(customHours.value) || 0;
    const minutes = parseInt(customMinutes.value) || 0;
    const seconds = parseInt(customSeconds.value) || 0;
    const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;

    if (totalMilliseconds > 0) {
        setTimerDuration(totalMilliseconds);
        const alertMessage = lang.setAlert
            .replace('{h}', hours)
            .replace('{m}', minutes)
            .replace('{s}', seconds);
        alert(alertMessage);
    } else {
        alert(lang.invalidAlert);
    }
}

// 更新按鈕狀態
function updateButtonStates() {
    controlButtons.forEach(button => {
        const action = button.getAttribute('data-action');
        button.disabled = false;
        if (action === 'start' && isRunning) button.disabled = true;
        if (action === 'pause' && !isRunning) button.disabled = true;
        if (action === 'lap' && (!isRunning || mode !== 'stopwatch')) button.disabled = true;
        if (action === 'start' && mode === 'timer' && timerRemaining <= 0) button.disabled = true;
    });
    modeButtons.forEach(button => button.classList.remove('active'));
    document.querySelector(`.mode-btn[data-mode="${mode}"]`).classList.add('active');
}

// 格式化時間
function formatTime(ms) {
    const milliseconds = Math.floor(ms % 1000).toString().padStart(3, '0');
    const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
    const minutes = Math.floor((ms / (1000 * 60)) % 60).toString().padStart(2, '0');
    const hours = Math.floor(ms / (1000 * 60 * 60)).toString().padStart(2, '0');

    if (hours === '00') {
        return `${minutes}:${seconds}.${milliseconds.substring(0, 2)}`;
    }
    return `${hours}:${minutes}:${seconds}.${milliseconds.substring(0, 2)}`;
}

// 事件監聽
const timerContainer = document.querySelector('.timer-container');
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const newMode = button.getAttribute('data-mode');
        if (newMode !== mode) {
            switchMode(newMode);
        }
    });
});

controlButtons.forEach(button => {
    button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        if (action === 'start' && mode === 'stopwatch') startStopwatch();
        if (action === 'start' && mode === 'timer') startTimer();
        if (action === 'pause') pause();
        if (action === 'reset') reset();
        if (action === 'lap') lap();
    });
});

durationButtons.forEach(button => {
    button.addEventListener('click', () => {
        const duration = parseInt(button.getAttribute('data-duration'));
        setTimerDuration(duration);
    });
});

setCustomBtn.addEventListener('click', setCustomDuration);

// 初始渲染
updateDisplay(time);
updateButtonStates();