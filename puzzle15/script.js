const solve = (function () {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    const game = {
        state: "123456789ABCDEF0",
        idealState: "1234 5678 9ABC DEF0",
        favState: "5A08 BF92 1CD7 463E",
        zeroPosition: { left: 3, top: 3 },
        isChecking: true
    };
    function drawGame() {
        const board = document.querySelector("#game");
        const ul = document.createElement("ul");
        board.append(ul);
        game.board = board;
        game.ul = ul;
        game.listItems = [];
        for (let i = 0; i < 15; ++i) {
            let li = createListItem(i);
            ul.append(li);
            game.listItems.push(li);
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
    }
    function createListItem(pos) {
        const item = document.createElement("li");
        setPosition(item, pos);
        item.textContent = `${pos + 1}`;
        item.addEventListener("click", () => clicked(pos + 1));
        return item;
    }
    function isClickable(pos) {
        const elm = game.listItems[pos - 1];
        pos = Number(elm.dataset.left) + 4 * Number(elm.dataset.top);
        let diff = Math.abs(game.zeroPosition.left + 4 * game.zeroPosition.top - pos);
        return diff === 4 || diff === 1;
    }
    function clicked(pos) {
        if (!isClickable(pos))
            return;
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
        writeState(state);
    }
    function calcPosition(pos) {
        return { left: pos % 4, top: Math.floor(pos / 4) % 4 };
    }
    function setPosition(item, pos) {
        const position = calcPosition(pos);
        item.setAttribute("data-left", `${position.left}`);
        item.setAttribute("data-top", `${position.top}`);
    }
    function writeState(state) {
        let pos = 0;
        game.state = removeSpaces(state);
        state.split("").forEach(key => {
            !~"0 ".indexOf(key) && setPosition(game.listItems[parseInt(key, 16) - 1], pos++);
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
            alert("SOLVED!!!");
        }
        game.isChecking = true;
    }
    drawGame();
    setTimeout(() => writeState(game.favState), 2000);
    return function () {
        game.isChecking = false;
        writeState(game.idealState);
    };
}());
