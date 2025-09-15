// Game state variables
let gameDate = localStorage.getItem('gameDate') || null;
let currentIndex = parseInt(localStorage.getItem('guessIndex'), 10) || 0;
let score = parseInt(localStorage.getItem('score'), 10) || 0;
let winStreak = parseInt(localStorage.getItem('winStreak'), 10) || 0;

function getJSON(key, defaultValue) {
    let item = localStorage.getItem(key);
    if (!item) {
        return defaultValue;
    }
    try { return JSON.parse(item); }
    catch (e) { console.log(`Error: ${e}`); }
    return defaultValue;
}

let guesses = getJSON('guesses', []);
let boxColors = getJSON('boxColors', [])

function setBoxColors() {
    let boxes = document.getElementsByClassName('box');
    for (let i = 0; i < boxes.length; i++) {
        if (boxColors[i]) {
            if (boxes[i]) boxes[i].style.backgroundColor = boxColors[i];
        }
        else {
            if (boxes[i]) boxes[i].style.backgroundColor = 'grey';
        }
    }
}

let lines = null;
let today = null;
let streak = Number(winStreak);


// Get today's ITYSL quotes
async function loadLines() {
    if (lines != null) return lines;
    try {
        const response = await fetch('/get_content');
        lines = await response.json();
        return lines;
    }
    catch (err) {
        console.log('Error getting lines', err);
        lines = [];
        return [];
    }
}


function $(id) {
    return document.getElementById(id);
}

function getDate() {
    const now = new Date();
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = now.getUTCFullYear();
    return `${mm}-${dd}-${yyyy}`;
}


let countdownInterval = null;

function displayCountdown() {
    const tiles = document.getElementById('tiles');
    if (!tiles) return;

    const now = new Date();

    // Compute next UTC midnight
    const tomorrowUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1, // tomorrow
        0, 0, 0, 0
    ));

    const targetDate = tomorrowUTC.getTime();        // timestamp of next UTC midnight
    const timeLimit = targetDate - now.getTime();    // total ms until target at function start

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    const pad = n => (n < 10 ? '0' : '') + n;

    const update = () => {
        const msLeft = targetDate - Date.now();

        if (msLeft <= 0) {
            tiles.innerHTML = `<span>00:</span><span>00:</span><span>00</span>`;
            tiles.classList.remove('color-full', 'color-half');
            tiles.classList.add('color-empty');
            clearInterval(countdownInterval);
            countdownInterval = null;
            return;
        }

        // color logic same as before
        if (msLeft < timeLimit / 2) {
            tiles.classList.remove('color-full');
            tiles.classList.add('color-half');
        } else {
            tiles.classList.add('color-full');
            tiles.classList.remove('color-half', 'color-empty');
        }
        if (msLeft < timeLimit / 4) {
            tiles.classList.remove('color-half');
            tiles.classList.add('color-empty');
        }

        const totalSeconds = Math.floor(msLeft / 1000);
        const hours = pad(Math.floor(totalSeconds / 3600));
        const mins = pad(Math.floor((totalSeconds % 3600) / 60));
        const seconds = pad(totalSeconds % 60);

        tiles.innerHTML = `<span>${hours}:</span><span>${mins}:</span><span>${seconds}</span>`;
    };

    update();
    countdownInterval = setInterval(update, 1000);
}


function showLine() {

    currentIndex = Math.min(currentIndex, lines.length);

    if (!lines || lines.length === 0) {
        if ($('line')) $('line').textContent = 'Error: No quotes available :('
        return;
    }

    if (currentIndex < lines.length) {
        if ($('line_count')) $('line_count').textContent =
        `Quote ${currentIndex + 1}/${lines.length}`;
        if ($('line')) $('line').textContent =
        `${lines[currentIndex].line_text}`;

        if ($('dropdown_container')) $('dropdown_container').style.display = '';
        if ($('submit_button')) $('submit_button').style.display = '';
        if ($('submit_button')) $('submit_button').disabled = false;
    }
    else {
        if (score == lines.length) {
            streak++;
            winStreak = streak;
            localStorage.setItem('winStreak',winStreak);
        }
        else {
            localStorage.setItem('winStreak', 0);
            winStreak = 0;
        }
        // Set end-of-game appearance
        if ($('dropdown_container')) $('dropdown_container').style.display = 'none';
        if ($('submit_button')) $('submit_button').style.display = 'none';
        if ($('line')) $('line').style.fontStyle = 'normal';
        if ($('line_count')) $('line_count').textContent = 'Stats';
        if ($('line')) $('line').style.whiteSpace = 'pre-line';
        if ($('line')) $('line').textContent =
        `Score: ${score}/${lines.length} | Winning streak: ${winStreak}
        
        Time until next Leavdle:`;

        displayCountdown();

        let html = "";
        for (let i = 0; i < lines.length; i++) {
        html += `<strong>Quote ${i + 1}:<br></strong> "${lines[i].line_text}"<br><br>`;
        html += `<strong>Sketch:</strong> ${lines[i].sketch_name}<br><br><hr><br>`;
        }
        if ($('stats')) $('stats').innerHTML = html;
        if ($('stats_container')) $('stats_container').style.display = '';
    }
}


async function submitGuess() {
    const button = $('submit_button');
    if (button) button.disabled = true;

    const selected = $('sketch_select');
    const guessId = selected ? String(selected.value) : '';
    guesses.push(guessId);

    const correctId = String(lines[currentIndex].sketch_id);

    let boxes = document.getElementsByClassName('box');

    if (guessId === correctId) {
        score++;
        if (boxes[currentIndex]) boxes[currentIndex].style.backgroundColor = '#80eb80ff';
        boxColors.push('#80eb80ff');
    }
    else {
        if (boxes[currentIndex]) boxes[currentIndex].style.backgroundColor = 'red';
        boxColors.push('red');
    }

    currentIndex++;

    localStorage.setItem('guessIndex', currentIndex);
    localStorage.setItem('guesses', JSON.stringify(guesses));
    localStorage.setItem('boxColors', JSON.stringify(boxColors));
    localStorage.setItem('score', score);

    if (currentIndex >= lines.length && score === lines.length) {
        if ($('victory')) $('victory').play();
    }

    showLine();

    if (button) button.disabled = false;
}


async function init() {
    lines = await loadLines();
    today = getDate();

    if (gameDate !== today) {
        // Player hasn't played today's game - reset layout
        gameDate = today;
        currentIndex = 0;
        guesses = [];
        boxColors = [];
        score = 0;

        const tiles = document.getElementById("tiles");
        if (tiles) tiles.innerHTML = '';

        localStorage.setItem('gameDate', today);
        localStorage.setItem('guessIndex', currentIndex);
        localStorage.setItem('guesses', JSON.stringify(guesses));
        localStorage.setItem('boxColors', JSON.stringify(boxColors));
        localStorage.setItem('score', score);
    }
    
    if (currentIndex < lines.length) {
        if ($('stats_container')) $('stats_container').style.display = 'none';
    }

    $("form").addEventListener('submit', function(e) {
        e.preventDefault();
    });
    setBoxColors();
    showLine();
    $('submit_button').addEventListener('click', submitGuess);
}


document.addEventListener('DOMContentLoaded', init);
