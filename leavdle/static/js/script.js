let gameDate = localStorage.getItem('gameDate') || null;
let currentIndex = parseInt(localStorage.getItem('guessIndex')) || 0;
let guesses = JSON.parse(localStorage.getItem('guesses')) || [];
let score = parseInt(localStorage.getItem('score')) || 0;
let winStreak = parseInt(localStorage.getItem('winStreak')) || 0;

let lines = null;
let today = null;
let streak = winStreak;


async function loadLines() {
    if (lines != null) {
        return lines;
    }
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


async function loadDate() {
    try {
        const response = await fetch('/get_game_date');
        today = await response.text();
        return today;
    }
    catch (err) {
        console.log('Error getting date', err);
        today = null;
        return today;
    }
}


function showLine() {
    if (currentIndex < lines.length) {
        document.getElementById('line_count').textContent =
        `Quote ${currentIndex + 1}/${lines.length}`;
        document.getElementById('line').textContent =
        `${lines[currentIndex].line_text}`;
    }
    else {
        if (score == lines.length) {
            streak++;
            localStorage.setItem('winStreak', streak);
        }
        else {
            localStorage.setItem('winStreak', 0);
        }
        document.getElementById('line_count')
        document.getElementById('dropdown_container').style.display = 'none';
        document.getElementById('submit_button').style.display = 'none';

        document.getElementById('line_count').textContent = 'Stats';
        document.getElementById('line').style.whiteSpace = 'pre-line';
        document.getElementById('line').textContent =
        `Score: ${score}/${lines.length}
        Your win streak: ${winStreak}
        Time until next Leavdle: <countdown here>`;
        // TODO: add countdown element
        // TODO: make submit button say something like "compare answers", and have a pop-up showing, the correct answers, user's answers, and the lines
    }
}


// TODO: The guesses are not being compared correctly, OR  score is not being updated correctly
async function submitGuess() {
    guesses.push(document.getElementById('sketch_select').value);
    console.log(guesses[currentIndex]);
    console.log(currentIndex);

    // TODO: Update dropdown to default value after submitting
    
    if (guesses[currentIndex] == lines[currentIndex].sketch_id) {
        score++;
        currentIndex++;
        showLine();
    }
    currentIndex++;

    localStorage.setItem('guessIndex', currentIndex);
    localStorage.setItem('guesses', JSON.stringify(guesses));
    localStorage.setItem('score', score);

    showLine();
}


async function init() {
    lines = await loadLines();

    today = await loadDate();
    if (gameDate !== today) {
        localStorage.setItem('gameDate', today);
        localStorage.setItem('guessIndex', 0);
        localStorage.setItem('guesses', []);
        localStorage.setItem('score', 0);
    }

    document.getElementById("form").addEventListener('submit', function(e) {
        e.preventDefault();
    });
    showLine();
    document.getElementById('submit_button').addEventListener('click', submitGuess);
}


document.addEventListener('DOMContentLoaded', init);