
var API = "https://quizapi.io/api/v1/questions?apiKey=oHAWciIhngorBE8VXujlQpTipWGswCQHKXwhZJRd&limit=3";
var APIs = [];
var curIndex = 0;
var quizData;
var currentQuiz; 
var questionIds = []; 
var categories = ['linux', 'uncategorized', 'docker', 'sql', 'cms', 'code', 'devops'];

var container = document.getElementById("quiz-container");
var answerContain = document.getElementById("answer-container");
var score = document.getElementById("score");
var currentScore = 0;
var currentLives = 3;
var highestScore = 0;
var timerSet;
var timerPaused = false; // Indicates if the timer is paused
var pauseAllowed = true; // Indicates if pausing is allowed
var remainTime = 30; // Remaining time for the quiz
var scoreMulti; // Score multiplier based on difficulty


// Sets the initial message in the quiz container
document.getElementById("rule").textContent = `<The rule of the Quizzical>`;
document.getElementById("rule").innerHTML += `</br></br>1. Check your today's categories, and then, select the difficulty.</br>2. When you select the difficulty, the quiz starts right away.
</br>3.Help, Ask the host, Pause - you can only use these options only once per game.</br></br>Help: The half of the wrong answers would be removed for a question</br>
Ask the host: The host will let you know the answer. But, nobody knows it is true or not!</br>
Pause: You can pause the timer for a minute.
</br></br>`
document.getElementById("rule2").textContent ="Are you ready? Good Luck🤞🏻🍀"


// Selects random categories for the quiz
function selectCategories() {
    var getRandom = function(min, max) {
        return parseInt(Math.random()*(max - min) + min);
    };

    var randomNumb = [];
    for(let i=0; i<4; i++){
        var newNum = getRandom(0,categories.length);
        if (randomNumb.includes(newNum)){
            i--;
        } else {
            randomNumb.push(newNum);
        }
    }
    
    document.getElementById("categories").innerHTML += `</br></br></br>Today's your quiz catagories are...</br>`;
    for (let i = 0; i<randomNumb.length; i++){
        document.getElementById("categories").innerHTML+= `${categories[randomNumb[i]]}</br>`;
        if(`${categories[randomNumb[i]]}`==='uncategorized'){
            APIs.push(API);
        } else {
            APIs.push(API+"&category="+`${categories[randomNumb[i]]}`);
        }   
    }
    console.log(randomNumb);
    console.log(APIs);
    document.getElementById("select").disabled = true;
}

// Fetches quiz questions based on selected categories and difficulty
var makeQuiz = async function(difficulty) {
    for(let x in APIs){
        APIs[x] = APIs[x]+"&difficulty="+difficulty;
    }
    console.log(APIs);

    Promise.all(APIs.map(Url => 
        fetch(Url).then(response => response.json())
    ))
    .then(allQuizzes => {
        let quizzes = [].concat(...allQuizzes);
        quizData = quizzes.filter(q => !questionIds.includes(q.id));
        
        if (quizData.length === 0) {
            alert("All questions have been displayed.");
            return;
        }

        quizData = quizData.sort(() => Math.random() - 0.5);

        displayQuiz();
        document.getElementById("next-question").disabled = false;
        
        quizData.forEach(q => questionIds.push(q.id));
    })
    .catch(err => {
        console.error("Could not get a quiz", err);
    });
};

// Pauses the timer
function pauseTimer() {
    if (pauseAllowed) {
        timerPaused = true;
        pauseAllowed = false;
        clearInterval(timerSet);

        let pauseTime = 60;
        timerSet = setInterval(function() {
            let min = parseInt(pauseTime / 60);
            let sec = pauseTime % 60;
            document.getElementById("timer").innerHTML = `Pause!  ${min} : ${sec}`;
            pauseTime--;

            if (pauseTime < 0) {
                clearInterval(timerSet);
                timerPaused = false;
                timer();
            }
        }, 1000);
    }
    document.getElementById("pause").disabled = true;
}

// Starts or resumes the timer
function timer() {
    document.getElementById("timer").style.display = 'block';
    var time = remainTime;
    console.log(time);
    
    timerSet = setInterval(function() {
        if (!timerPaused) {
            min = parseInt(time / 60);
            sec = time % 60;
            
            document.getElementById("timer").innerHTML = min + " : " + sec ;
            time--;
            remainTime = time;

            if (time < 0) {
                clearInterval(timerSet);
                document.getElementById("timer").innerHTML = "Time over";
                timeOver();
            }
        }
    }, 1000);
}

// Handles the event when the time is over
function timeOver() {
    var log = document.getElementById("log");
    var correctAnswersText = getCorrect();

    document.querySelectorAll(".answers").forEach(input => input.disabled = true);
    currentLives--;

    log.textContent = `Time over! The correct answers were ${correctAnswersText}.`;
    scoreAndLives();

    if(currentLives <= 0){
        gameOver();
    }

    document.getElementById("submit").style.display = 'none';
}

// Retrieves the correct answers
function getCorrect() {
    var correctAnswers = [];
    Object.keys(currentQuiz.correct_answers).forEach(key => {
        if(currentQuiz.correct_answers[key] === "true") {
            let answerKey = key.replace("_correct", "");
            correctAnswers.push(currentQuiz.answers[answerKey]);
        }
    });
    return `"${correctAnswers.join(', ')}"`;
}

// Updates the score and lives display
function scoreAndLives() {
    score.innerHTML = "Current Score: " + currentScore + "</br>" + "Current Lives: " + currentLives;
    document.getElementById("highestScore").innerHTML = "Highest Score: " + highestScore;
}

// Event listeners for difficulty buttons
document.querySelectorAll(".difficulty").forEach(function(button) {
    button.addEventListener('click', function() {
        if(document.getElementById('select').disabled === false){
            alert("Please check today's categories!");
            return;
        }

        var difficulty = button.value;
        makeQuiz(difficulty);
        document.querySelectorAll(".difficulty").forEach(function(button) {
            button.style.display = 'none';
        });
        document.getElementById("selectedDifficulty").innerHTML += "This quiz's level is "+button.value+"</br>";
        document.getElementById("submit").style.display = 'block';
        document.getElementById("help").style.display = 'block';
        document.getElementById("next-question").style.display = 'block';
        document.getElementById("stopQuiz").style.display = 'block';
        document.getElementById("select").style.display = 'none';
        document.getElementById("rule").style.display = 'none';
        document.getElementById("rule2").style.display = 'none';
        document.getElementById("pause").style.display = 'block';
        document.getElementById("ask").style.display = 'block';
        document.getElementById("pause").disabled = false;
        document.getElementById("timer").disabled = false;
    
    
        switch(button.value) {
            case "easy":
                scoreMulti = 100;
                break;
            case "medium":
                scoreMulti = 200;
                break;
            case "hard":
                scoreMulti = 300;
                break;
        }
    });
});

// Updates the highest score if the current score is greater
function updateScore(currentScore) {
    if (currentScore > highestScore) {
        highestScore = currentScore;
    }
    document.getElementById("highestScore").innerText = `Highest Score: ${highestScore}`;
}

// Checks the selected answers against the correct ones
var checkTheAnswer = function() {
    var selectedCheck = document.querySelectorAll('input[type=checkbox]:checked');
    var selectedRadio = document.querySelector('input[type=radio]:checked');
    var log = document.getElementById("log");
    console.log(selectedCheck);
    clearInterval(timerSet);
    

    var correctAnswers = [];
    Object.keys(currentQuiz.correct_answers).forEach(key => {
        if(currentQuiz.correct_answers[key] === "true") {
            let answerKey = key.replace("_correct", "");
            correctAnswers.push(currentQuiz.answers[answerKey]);
        }
    });

    if(currentQuiz.multiple_correct_answers==="true"){
        if(selectedCheck.length === 0){
            alert("Please select answers!");
            return;
        } else {
            var selectedCorrect = 0;
            selectedCheck.forEach(function(checkbox) {
                if(checkbox.value === "true") selectedCorrect++;
            });

            if(selectedCorrect === correctAnswers.length && selectedCheck.length === selectedCorrect) {
                log.innerHTML = "The answers are correct!";
                currentScore += scoreMulti;
            } else {
                log.textContent = `The answers are incorrect! The correct answers were "${correctAnswers.join(', ')}".`;
                currentLives--;
            }
        }
    } else {
        if(selectedRadio === null){
            alert("Please select the answer!");
            return;
        } else {
            if(selectedRadio.value === "true"){
                log.innerHTML = "The answer is correct!";
                currentScore += scoreMulti;
            } else {
                log.textContent = `The answer is incorrect! The correct answer was "${correctAnswers[0]}"`;
                currentLives--;
            }
        }
    }
    updateScore(currentScore);
    document.getElementById("submit").style.display = 'none';    
    score.innerHTML = "Current Score: "+ currentScore + "</br>" + "Current Lives: "+ currentLives;
    scoreAndLives();
    console.log(currentScore, currentLives);
    document.querySelectorAll(".answers").forEach(function(input) {
        input.disabled = true;
    });

    if(currentLives === 0){
        gameOver();
    }    
};

// Displays the next quiz question
var displayQuiz = function() {
    remainTime = 30;
    timer();
    container.innerHTML = "";
    answerContain.innerHTML = "";

    scoreAndLives();
    document.getElementById("categories").style.display = 'none'; 

    currentQuiz = quizData[curIndex];

    var questionText = document.createTextNode(currentQuiz.question);
    container.appendChild(questionText);
    container.appendChild(document.createElement("br"));

    console.log(currentQuiz);
    console.log(currentQuiz.category);

    for (let j = 0; j < 6; j++) {
        var key = String.fromCharCode('a'.charCodeAt(0) + j);
        var answerKey = "answer_" + key;

        if (currentQuiz.answers[answerKey]) {
            var label = document.createElement("label");
            var input = document.createElement("input");
            input.className = "answers";
            input.id = answerKey;
            input.name = "question" + curIndex;
            input.value = currentQuiz.correct_answers[answerKey + "_correct"];

            if (currentQuiz.multiple_correct_answers === "true") {
                input.type = "checkbox";
            } else {
                input.type = "radio";
            }

            label.appendChild(input);

            var answerText = document.createTextNode(currentQuiz.answers[answerKey]);
            label.appendChild(answerText);

            answerContain.appendChild(label);
            answerContain.appendChild(document.createElement("br"));
        }
    }
};

// Handles the game over state
function gameOver() {
    document.getElementById("quiz-container").innerHTML = "Game Over! 🙀";
    clearInterval(timerSet);
    answerContain.innerHTML = "";
    score.innerHTML = "Your Score: "+ currentScore;
    document.getElementById("restart").style.display = 'block';
    document.getElementById("timer").style.display = 'none';
    document.getElementById("submit").style.display = 'none';
    document.getElementById("help").style.display = 'none';
    document.getElementById("next-question").style.display = 'none';
    document.getElementById("stopQuiz").style.display = 'none';
    document.getElementById("select").style.display = 'none';
    document.getElementById("ask").style.display = 'none';
    document.getElementById("log").innerHTML = "";
    document.getElementById("pause").style.display = 'none';
    
};

// Listener for the next-question button
document.getElementById("next-question").addEventListener('click', function() {
    if(document.getElementById("log").innerHTML === ""){
        alert("Please submit the answer!");
        return;
    }

    document.getElementById("log").innerHTML = "";

    if (quizData && curIndex < quizData.length - 1) {
        curIndex++;
        displayQuiz();
        document.getElementById("submit").style.display = 'block';
    } else {
        document.getElementById("quiz-container").innerHTML = "The quiz is finished! 🥸 ";
        answerContain.innerHTML = "";
        score.innerHTML = "Your Score: " + currentScore + "</br>" + "Your lives : " + currentLives;
        document.getElementById("restart").style.display = 'block';
    }
});

// Listener for the restart button
document.getElementById("restart").addEventListener('click', function() {
    clearInterval(timerSet);
    document.getElementById("timer").style.display = 'none';
    document.getElementById("timer").innerHTML = "";

    curIndex = 0;
    currentScore = 0;
    currentLives = 3;
    questionIds = [];
    APIs = [];
    document.getElementById("help").disabled = false;
    document.getElementById("ask").disabled = false;
    document.getElementById("pause").disabled = true;

    document.getElementById("quiz-container").innerHTML = "Start your quizzzzzz!";
    document.getElementById("log").innerHTML = "";
    document.getElementById("score").innerHTML = "";
    document.getElementById("selectedDifficulty").innerHTML = "";
    document.getElementById("categories").innerHTML = "";
    document.getElementById("categories").style.display = 'block';
    document.getElementById("select").disabled = false;
    document.getElementById("select").style.display = 'inline-block';

    document.querySelectorAll(".difficulty").forEach(function(button) {
        button.style.display = 'inline-block';
    });

    document.getElementById("restart").style.display = 'none';
    document.getElementById("submit").style.display = 'none';
    document.getElementById("next-question").style.display = 'none';
    document.getElementById("stopQuiz").style.display = 'none';
    document.getElementById("pause").style.display = 'none';
    document.getElementById("ask").style.display = 'none';
    document.getElementById("rule").style.display = 'block';
    document.getElementById("rule2").style.display = 'block';
});

// Provides a hint by disabling some wrong answers
function help() {
    var wrongAnswers = [];
    var queryAllAnswers = document.querySelectorAll(".answers");

    queryAllAnswers.forEach(function(input) {
        if(input.value === "false" && !input.disabled) {
            wrongAnswers.push(input);
        }
    });

    var numToDelete = Math.floor(wrongAnswers.length / 2);

    for(let i = 0; i < numToDelete; i++) {
        var randomIndex = Math.floor(Math.random() * wrongAnswers.length);
        wrongAnswers[randomIndex].disabled = true;
        wrongAnswers.splice(randomIndex, 1);
    }

    document.getElementById("help").disabled = true; 
}

// Simulates asking the host for a hint
function askTheHost() {
    var inputVal = [];
    document.querySelectorAll(".answers").forEach(function(input) {
        inputVal.push(input.value === "true");
    });

    var trueAnswers = inputVal
        .map((val, index) => val ? index : -1)
        .filter(index => index !== -1);

    var falseAnswers = inputVal
        .map((val, index) => !val ? index : -1)
        .filter(index => index !== -1);

    var probability;

    var APIstring = APIs.toString();

    if(APIstring.includes("easy")){
        probability = 0.9;
    } else if (APIstring.includes("medium")){
        probability = 0.7;
    } else {
        probability = 0.5; 
    }

    const destiny = Math.random()
    
    if(destiny < probability) {
        var trueAnswers2 = trueAnswers.map((x) => "answer_" + String.fromCharCode('a'.charCodeAt(0) + x) );
        var Text = trueAnswers2.toString();
        console.log(Text);
    } else {
        var falseAnswers2 = falseAnswers.map((x) => "answer_" + String.fromCharCode('a'.charCodeAt(0) + x));
        var Text = falseAnswers2[0];
        console.log(Text);
    }
    console.log(destiny);
    console.log(probability);
    
    alert(`The host: "The answer might be... "${Text}"!!!"`);
    document.getElementById("ask").disabled = true;
    return;    
}
