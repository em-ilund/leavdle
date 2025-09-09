let lines = [];
let currentIndex = parseInt(localStorage.getItem('guessIndex')) || 0;
let guesses = JSON.parse(localStorage.getItem('guesses')) || [];

async function load_lines() {
    try {
        const response = await fetch('/get_content');
        const lines = await response.json();
        return lines;
    }
    catch (err) {
        console.log('Error gettling lines', err);
        return [];
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
        // Display stats
    }
}


async function submitGuess() {
    guess = mySelect.selected();
    lines = await load_lines();
    // guess is a sketch id, compare it against the lines sketch id attribute
}

async function init() {
    lines = await load_lines();
    showLine();
    document.getElementById('submit_button').addEventListener('click', submitGuess);
}

document.addEventListener('DOMContentLoaded', init);