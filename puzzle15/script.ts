(function(){
    const delay = (ms: number) => new Promise( res => setTimeout( res, ms ) );

    const movesElement: HTMLSpanElement = document.querySelector( "#moves-value" );

    const game: {
        board?: Element,
        ul?: HTMLUListElement,
        listItems?: HTMLLIElement[],
        state: string,
        idealState: string,
        favState: string,
        zeroPosition: position,
        isChecking: boolean,
        moves: number,
        states: string[]
    } = {
        state: "123456789ABCDEF0",
        idealState: "1234 5678 9ABC DEF0",
        favState: "5A08 BF92 1CD7 463E",
        zeroPosition: { left: 3, top: 3 },
        isChecking: true,
        moves: 0,
        states: []
    };

    function drawGame(): void {
        const board: Element = document.querySelector( "#game" );
        const ul: HTMLUListElement = document.createElement( "ul" );
        board.append( ul );

        game.board = board;
        game.ul = ul;
        game.listItems = [];

        for ( let i = 0; i < 15; ++ i ) {
            let li = createListItem( i );
            ul.append( li );
            game.listItems.push( li );
        }

        document.addEventListener( "keydown", function( event ) {
            let toMove = 0;
            switch ( event.keyCode ) {
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
            const z = game.state.indexOf( "0" );
            if ( ( z % 4 == 0 && toMove === -1 ) || ( z % 4 == 3 && toMove === +1 ) ) return;
            const n = z + toMove;
            if ( !toMove || n < 0 || n > 15 ) return;
            clicked( parseInt( game.state.charAt( n ), 16 ) );
        } );

        document.querySelector( "#button-undo" ).addEventListener( "click", undo );
        document.querySelector( "#button-home" ).addEventListener( "click", solve );
        document.querySelector( "#button-shuffle" ).addEventListener( "click", () => {
            game.moves = 0;
            game.states = [];
            movesElement.textContent = `${ game.moves }`;
            writeState( game.favState );
        } );
        document.querySelector( "#button-help" ).addEventListener( "click", () => alert( "Why the fuck are you asking me? Just Google it man!" ) );
    }

    function createListItem( pos: number ): HTMLLIElement {
        const item = document.createElement( "li" );
        setPosition( item, pos );
        item.textContent = `${ pos + 1 }`;
        item.addEventListener( "click", () => clicked( pos + 1 ) );
        return item;
    }

    function isClickable( pos: number ): boolean {
        const elm: HTMLLIElement = game.listItems[ pos - 1 ];
        pos = Number( elm.dataset.left ) + 4 * Number( elm.dataset.top );
        let diff = Math.abs( game.zeroPosition.left + 4 * game.zeroPosition.top - pos );
        return diff === 4 || diff === 1;
    }

    function clicked( pos: number ): void {
        if ( !isClickable( pos ) ) return;
        let { state } = game;
        state = state.toUpperCase();
        const position = pos.toString( 16 ).toUpperCase();
        const z = state.indexOf( "0" );
        const n = state.indexOf( position );
        const a = 0;
        const b = Math.min( z, n );
        const c = Math.max( z, n );
        const d = state.length;
        const x = z < n ? position : "0";
        const y = z > n ? position : "0";
        state = state.substring( a, b ) + x + state.substring( b + 1, c ) + y + state.substring( c + 1, d );
        writeState( state, true );
        movesElement.textContent = `${ ++ game.moves }`;
    }

    function calcPosition( pos: number ): position {
        return { left: pos % 4, top: Math.floor(pos / 4) % 4 };
    }

    function setPosition( item: HTMLLIElement, pos: number ): void {
        const position: position = calcPosition( pos );
        item.setAttribute( "data-left", `${ position.left }` );
        item.setAttribute( "data-top", `${ position.top }` );
    }

    function writeState( state: string, callFromOutside?: boolean ): void {
        let pos = 0;
        if ( callFromOutside && game.state.length == 16 ) game.states.push( game.state );
        game.state = removeSpaces( state );
        state.split( "" ).forEach( key => {
            !~"0 ".indexOf( key ) && setPosition( game.listItems[ parseInt( key, 16 ) - 1 ], pos ++ );
            key === "0" && ( game.zeroPosition = calcPosition( pos ++ ) );
        } );
        amazinglySolved();
    }

    function removeSpaces( state: string ): string {
        while ( ~state.indexOf( " " ) ) state = state.replace( " ", "" );
        return state;
    }

    function amazinglySolved() {
        if ( game.isChecking && game.state === "123456789ABCDEF0" ) {
            alert( "SOLVED!!!" );
        }
        game.isChecking = true;
    }

    function undo() {
        if ( !game.states.length ) return;
        writeState( game.states.pop() );
        movesElement.textContent = `${ -- game.moves }`;
    }

    drawGame();
    setTimeout( () => writeState( game.favState ), 2000 );

    function solve() {
        game.isChecking = false;
        writeState( game.idealState );
    }
}());
