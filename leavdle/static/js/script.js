let gameDate = localStorage.getItem('gameDate') || null;
let currentIndex = parseInt(localStorage.getItem('guessIndex', 10)) || 0;
let score = parseInt(localStorage.getItem('score', 10)) || 0;
let winStreak = parseInt(localStorage.getItem('winStreak', 10)) || 0;

function getJSON(key, defaultValue) {
    item = localStorage.getItem(key);
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
            boxes[i].style.backgroundColor = boxColors[i];
        }
        else {
            boxes[i].style.backgroundColor = 'grey';
        }
    }
}

let lines = null;
let today = null;
let streak = Number(winStreak);


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


async function getDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    return today;
}


// Countdown from Mark Nelson at https://codepen.io/marknelson/pen/XJBapX
function displayCountdown() {
    var today = new Date();

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0,0,0,0);

    var diffMs = (tomorrow - today); // milliseconds between now & Christmas
    var minutes = Math.floor((diffMs/1000)/60);

    countdown(minutes);


    //alert(diffDays + " days, " + diffHrs + " hours, " + diffMins + " minutes until Christmas 2015 =)");

    function countdown(minutes) {

        var target_date = new Date().getTime() + ((minutes * 60 ) * 1000); // set the countdown date
        var time_limit = ((minutes * 60 ) * 1000);
        //set actual timer
        /*setTimeout(
            function() 
            {
            alert( 'done' );
            }, time_limit );*/

        var days, hours, mins, seconds; // variables for time units

        var tiles = document.getElementById("tiles"); // get tag element

        getCountdown();

        setInterval(function () { getCountdown(); }, 1000);

        function getCountdown() {

            // find the amount of "seconds" between now and target
            var current_date = new Date().getTime();
            var seconds_left = (target_date - current_date) / 1000;

            if ( seconds_left >= 0 ) {
                if ( (seconds_left * 1000 ) < ( time_limit / 2 ) )  {
                $( '#tiles' ).removeClass('color-full');
                $( '#tiles' ).addClass('color-half');

                } 
                if ( (seconds_left * 1000 ) < ( time_limit / 4 ) )  {
                    $( '#tiles' ).removeClass('color-half');
                    $( '#tiles' ).addClass('color-empty');
                }

                days = pad( parseInt(seconds_left / 86400) );
                seconds_left = seconds_left % 86400;

                hours = pad( parseInt(seconds_left / 3600) );
                seconds_left = seconds_left % 3600;

                mins = pad( parseInt(seconds_left / 60) );
                seconds = pad( parseInt( seconds_left % 60 ) );

                // format countdown string + set tag value
                tiles.innerHTML = `<span>${hours}:</span><span>${mins}:</span><span>${seconds}</span>`; 
            }

        }

        function pad(n) {
            return (n < 10 ? '0' : '') + n;
        }
    }
}


function showLine() {
    if (!lines || lines.length === 0) {
        document.getElementById('line').textContent = 'Error: No quotes available :('
        return;
    }

    if (currentIndex < lines.length) {
        document.getElementById('line_count').textContent =
        `Quote ${currentIndex + 1}/${lines.length}`;
        document.getElementById('line').textContent =
        `${lines[currentIndex].line_text}`;

        document.getElementById('dropdown_container').style.display = '';
        document.getElementById('submit_button').style.display = '';
        document.getElementById('submit_button').disabled = false;
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
        document.getElementById('line_count')
        document.getElementById('dropdown_container').style.display = 'none';
        document.getElementById('submit_button').style.display = 'none';

        document.getElementById('line').style.fontStyle = 'normal';
        document.getElementById('line_count').textContent = 'Stats';
        document.getElementById('line').style.whiteSpace = 'pre-line';
        document.getElementById('line').textContent =
        `Score: ${score}/${lines.length} | Winning streak: ${winStreak}
        
        Time until next Leavdle:`;

        displayCountdown();

        let html = "";
        for (let i = 0; i < lines.length; i++) {
        html += `<strong>Quote ${i + 1}:<br></strong> "${lines[i].line_text}"<br><br>`;
        html += `<strong>Sketch:</strong> ${lines[i].sketch_name}<br><br><hr><br>`;
        }
        document.getElementById('stats').innerHTML = html;
    }
}


async function submitGuess() {
    const selected = document.getElementById('sketch_select');
    if (selected.value === 'placeholder') {
        alert("Please select a sketch!");
        return;
    }
    const button = document.getElementById('submit_button');
    button.disabled = true;

    const guessId = String(selected.value);
    guesses.push(guessId);

    const correctId = String(lines[currentIndex].sketch_id);

    let boxes = document.getElementsByClassName('box');

    if (guessId === correctId) {
        score++;
        boxes[currentIndex].style.backgroundColor = '#80eb80ff';
        boxColors.push('#80eb80ff');
    }
    else {
        boxes[currentIndex].style.backgroundColor = 'red';
        boxColors.push('red');
    }

    currentIndex++;

    localStorage.setItem('guessIndex', currentIndex);
    localStorage.setItem('guesses', JSON.stringify(guesses));
    localStorage.setItem('boxColors', JSON.stringify(boxColors));
    localStorage.setItem('score', score);

    if (currentIndex >= lines.length && score === lines.length) {
        document.getElementById('victory').play();
    }

    showLine();

    button.disabled = false;
}


async function init() {
    lines = await loadLines();
    today = await getDate();

    if (gameDate !== today) {
        gameDate = today;
        currentIndex = 0;
        guesses = [];
        boxColors = [];
        score = 0;

        const tiles = document.getElementById("tiles");
        if (tiles) tiles.innerHTML = '';
        document.getElementById('stats').style.display = 'none';

        localStorage.setItem('gameDate', today);
        localStorage.setItem('guessIndex', currentIndex);
        localStorage.setItem('guesses', JSON.stringify(guesses));
        localStorage.setItem('boxColors', JSON.stringify(boxColors));
        localStorage.setItem('score', score);
    }

    document.getElementById("form").addEventListener('submit', function(e) {
        e.preventDefault();
    });
    setBoxColors();
    showLine();
    document.getElementById('submit_button').addEventListener('click', submitGuess);
}


document.addEventListener('DOMContentLoaded', init);