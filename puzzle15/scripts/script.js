const p15 = (function () {
    function countInversion(state) {
        let array = state.split("").map(key => parseInt(key, 16));
        let inversions = 0;
        for (let i = 0; i < array.length; ++i) {
            for (let j = i + 1; j < array.length; ++j) {
                if (array[i] && array[j] && array[i] > array[j])
                    ++inversions;
            }
        }
        return inversions;
    }
    function getZeroPosition(state) {
        state = removeSpaces(state);
        return 4 - Math.floor(state.indexOf("0") / 4);
    }
    function removeSpaces(state) {
        while (~state.indexOf(" "))
            state = state.replace(" ", "");
        return state;
    }
    function isSolvable(state) {
        return !!((countInversion(state) + getZeroPosition(state)) % 2);
    }
    function genRandom() {
        let array = "123456789ABCDEF0".split("");
        for (let i = array.length - 1; i > 0; --i) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        let state = array.join("");
        if (isSolvable(state))
            return state;
        return genRandom();
    }
    return { isSolvable, genRandom };
}());
const game = (function () {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    const elm = {
        body: document.body,
        listItems: [],
        movesElement: document.querySelector("#moves-value"),
        min: document.querySelector("#min"),
        sec: document.querySelector("#min"),
        bbul: document.querySelector("#bottom-bar ul"),
        buttons: {
            switch: document.querySelector("#switch"),
            undo: document.querySelector("#button-undo"),
            home: document.querySelector("#button-home"),
            shuffle: document.querySelector("#button-shuffle"),
            info: document.querySelector("#button-info")
        }
    };
    const game = {
        state: "123456789ABCDEF0",
        idealState: "1234 5678 9ABC DEF0",
        favState: "5A08 BF92 1CD7 463E",
        zeroPosition: { left: 3, top: 3 },
        states: [],
        isChecking: true,
        isCapturing: false,
        isStarted: false
    };
    const buttonActions = {
        undo: function () {
            if (!game.isCapturing)
                return;
            if (!game.states.length)
                return;
            writeState(game.states.pop());
            writeMoves();
        },
        home: function () {
            if (!game.isCapturing)
                return;
            game.isChecking = false;
            writeState(game.idealState);
            gameStoped();
        },
        shuffle: function () {
            gameStoped();
            elm.body.classList.toggle("slow", true);
            writeState(p15.genRandom());
            delay(400).then(() => elm.body.classList.toggle("slow", false));
            game.isCapturing = true;
            writeMoves();
            writeTime(0);
            toggle(true);
        },
        info: function () {
            let moves = (+window.localStorage.getItem("p15: moves")) || 0;
            let time = (+window.localStorage.getItem("p15: time")) || 0;
            if (moves && time) {
                alert(`Best moves: ${moves}
Best time: ${Math.floor(time / 60)}m ${time % 60}s`);
            }
            else {
                alert("Seems like you haven't completed any game yet. Try again after completing atleast one game.");
            }
        }
    };
    function drawGame() {
        elm.board = document.querySelector("#game");
        elm.ul = document.createElement("ul");
        elm.board.append(elm.ul);
        for (let i = 0; i < 15; ++i) {
            let li = createListItem(i);
            elm.ul.append(li);
            elm.listItems.push(li);
        }
        document.addEventListener("keydown", function (event) {
            let toMove = 0;
            switch (event.keyCode) {
                case 39:
                    toMove = -1;
                    break;
                case 40:
                    toMove = -4;
                    break;
                case 37:
                    toMove = +1;
                    break;
                case 38:
                    toMove = +4;
                    break;
            }
            const z = game.state.indexOf("0");
            if ((z % 4 == 0 && toMove === -1) || (z % 4 == 3 && toMove === +1))
                return;
            const n = z + toMove;
            if (!toMove || n < 0 || n > 15)
                return;
            clicked(parseInt(game.state.charAt(n), 16));
        });
        elm.buttons.undo.addEventListener("click", buttonActions.undo);
        elm.buttons.home.addEventListener("click", buttonActions.home);
        elm.buttons.shuffle.addEventListener("click", buttonActions.shuffle);
        elm.buttons.info.addEventListener("click", buttonActions.info);
        elm.buttons.switch.addEventListener("click", () => toggle(null));
        window.setTimeout(() => {
            elm.body.classList.toggle("slow", true);
            writeState(p15.genRandom());
            delay(400).then(() => elm.body.classList.toggle("slow", false));
            game.isCapturing = true;
        }, 2000);
    }
    function createListItem(pos) {
        const item = document.createElement("li");
        setPosition(item, pos);
        item.textContent = `${pos + 1}`;
        item.addEventListener("click", () => clicked(pos + 1));
        return item;
    }
    function isClickable(pos) {
        const li = elm.listItems[pos - 1];
        pos = Number(li.dataset.left) + 4 * Number(li.dataset.top);
        let diff = Math.abs(game.zeroPosition.left + 4 * game.zeroPosition.top - pos);
        return diff === 4 || diff === 1;
    }
    function clicked(pos) {
        toggle(true);
        if (!game.isCapturing || !isClickable(pos))
            return;
        if (!game.isStarted)
            gameStarted();
        let { state } = game;
        state = state.toUpperCase();
        const position = pos.toString(16).toUpperCase();
        const z = state.indexOf("0");
        const n = state.indexOf(position);
        const a = 0;
        const b = Math.min(z, n);
        const c = Math.max(z, n);
        const d = state.length;
        const x = z < n ? position : "0";
        const y = z > n ? position : "0";
        state = state.substring(a, b) + x + state.substring(b + 1, c) + y + state.substring(c + 1, d);
        writeState(state, true);
        if (game.states.length)
            writeMoves();
    }
    function calcPosition(pos) {
        return { left: pos % 4, top: Math.floor(pos / 4) % 4 };
    }
    function setPosition(item, pos) {
        const position = calcPosition(pos);
        item.setAttribute("data-left", `${position.left}`);
        item.setAttribute("data-top", `${position.top}`);
    }
    function writeState(state, callFromOutside) {
        let pos = 0;
        if (callFromOutside && game.state.length == 16)
            game.states.push(game.state);
        game.state = removeSpaces(state);
        state.split("").forEach((key) => {
            !~"0 ".indexOf(key) && setPosition(elm.listItems[parseInt(key, 16) - 1], pos++);
            key === "0" && (game.zeroPosition = calcPosition(pos++));
        });
        amazinglySolved();
    }
    function removeSpaces(state) {
        while (~state.indexOf(" "))
            state = state.replace(" ", "");
        return state;
    }
    function amazinglySolved() {
        if (game.isChecking && game.state === "123456789ABCDEF0") {
            let moves = (+window.localStorage.getItem("p15: moves")) || 0;
            let time = (+window.localStorage.getItem("p15: time")) || 0;
            window.localStorage.setItem("p15: moves", `${Math.min(moves, game.states.length - 1) || game.states.length - 1}`);
            window.localStorage.setItem("p15: time", `${Math.min(time, game.timer.read()) || game.timer.read()}`);
            gameStoped();
            delay(100).then(() => alert("SOLVED!!"));
        }
        game.isChecking = true;
    }
    function gameStarted() {
        if (!game.isStarted) {
            game.timer = createTimer(writeTime, 1000);
            game.timer.play();
            game.isStarted = true;
        }
    }
    function gameStoped() {
        game.isCapturing = false;
        game.isStarted = false;
        game.states = [];
        game.timer && game.timer.stop();
    }
    function writeTime(time) {
        document.querySelector("#min").textContent = `${Math.floor(time / 60)}`;
        document.querySelector("#sec").textContent = `${time % 60}`;
    }
    function toggle(arg) {
        if (arg === null)
            elm.bbul.classList.toggle("closed");
        else
            elm.bbul.classList.toggle("closed", arg);
    }
    function writeMoves() {
        elm.movesElement.textContent = `${game.states.length}`;
    }
    drawGame();
    return { game };
}());
function createTimer(callback, ms) {
    let times = 0;
    let id = 0;
    callback(0);
    return {
        play: function () {
            id = window.setInterval(() => callback(++times), ms);
        },
        pause: function () {
            window.clearInterval(id);
        },
        stop: function () {
            window.clearInterval(id);
            times = 0;
        },
        read: function () {
            return times;
        }
    };
}
