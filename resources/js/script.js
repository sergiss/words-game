var data, set;

var currentWord;
var currentIndex;
var gameOver;

const words = [];

const loadTextFile = async (src, callback)=> {
    const response = await fetch(src);
    const text = await response.text();
    callback(text);    
}

loadTextFile("resources/data/data-es.txt", (text) => {
    data = text.split(/\r?\n/); // Split words array
    set = new Set(data);

    // Initialize inputs
    for(let i = 0; i < 5; ++i) {
        const word = document.querySelector(`#w${i}`);
        const tmp = word.querySelectorAll("input"); 
        for(let j = 0; j < 5; ++j) {
            tmp[j].addEventListener("keyup", ()=> {
                if(tmp[j].value.trim().length > 0) {
                    tmp[(j + 1) % 5].focus();
                }                
            })
        }
        words.push(tmp);
    }

    // Check button
    const checkBtn = document.querySelector("#check-btn");
    checkBtn.addEventListener("click", (e)=> {
        if(gameOver) {
            newGame();
        } else {

            hideMessage();

            // Check dictionary
            const word = getTry(currentIndex);
            if(word.trim().length === 0 || !set.has(word)) {
                const text = "The word is not in the dictionary"
                showMessage(text, true);
                setTimeout(()=> {
                    if(document.querySelector("#info").innerText === text.toUpperCase()) {
                        hideMessage();
                    }
                }, 2500);                
                return;
            } 

            const state = checkWord(currentIndex);
            if(state) { // Correct Word (WIN)
                showMessage("You win!");
                gameOver = true;
                checkBtn.value = "New Game";
            } else if(currentIndex == 4) { // Game Over
                showMessage(`Game Over! (${currentWord})`, true);
                gameOver = true;
                checkBtn.value = "New Game";
            } else {
                setCurrentIndex(currentIndex + 1);
            }  
        }     
    });

    newGame();
});

const getTry = (index) => {
    let result = "";
    for(let i = 0; i < 5; ++i) {
        result += words[index][i].value;
    }
    return result.toUpperCase();
}

const showMessage = (text, nok = false)=> {
    const info = document.querySelector("#info");
    info.innerText = text;
    info.className = "info";
    info.classList.add(nok ? "nok" : "ok");
}

const hideMessage = ()=> {
    const info = document.querySelector("#info");
    info.innerText = info.className = "";
    info.classList.add("hide");
}

const indicesOf = (value, tgt)=> {
    const result = [];
    for(let i = 0; i < value.length; ++i) {
        if(value[i] === tgt) {
            result.push(i);
        }
    }
    return result;
}

const checkWord = (index) => {
    const flags = [];
    const word = words[index];
    var correct = true;
    for(let i = 0; i < 5; i++) { // Iterate word
       if(currentWord.charAt(i) === word[i].value.toUpperCase()) { // Correct letter
         word[i].style.background = "#8dc287";
         flags[i] = true;
       }
    }
    outter : for(let indices, i = 0; i < 5; i++) {
        if(!flags[i]) {
            correct = false;
            indices = indicesOf(currentWord, word[i].value.toUpperCase());
            for(let j = 0; j < indices.length; ++j) {
                let idx = indices[j];
                if(!flags[idx]) {                        
                    word[i].style.background = "#ffc40d";
                    flags[index] = true;
                    continue outter;
                }
            }
            // Incorrect word
            word[i].style.background = "#ff6c70";
        }
    }
    return correct;
}

const newGame = ()=> {
    // Clear all
    clear();
    // Generate new word
    currentWord = getRandomWord(data);
    gameOver = false;
    // console.log(currentWord);
}

/* Attempts to find the word */
const setCurrentIndex = (index) => {
    currentIndex = index;
    for(let i = 0; i < 5; ++i) {
        for(let j = 0; j < 5; ++j) {
            words[i][j].disabled = ((i !== index) ? true : false);     
        }
    }
    words[index][0].focus();
}

/* Clear board */
const clear = () => {  
    document.querySelector("#check-btn").value = "Check";  
    hideMessage();
    for(let i = 0; i < 5; ++i) {
        for(let j = 0; j < 5; ++j) {
            words[i][j].value = "";
            words[i][j].style.background = "#fff";
        }
    }
    setCurrentIndex(0);
}

/* Return random word */
const getRandomWord = (data)=> {
    return data[Math.floor(data.length * Math.random())];
}