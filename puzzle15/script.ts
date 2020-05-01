type position = { left: number, top: number };
type timer = { play: () => void, pause: () => void, stop: () => void, read: () => number, isPaused: () => boolean };

const p15 = (function(){
    function countInversion( state: string ): number {
        let array: number[] = state.split( "" ).map( key => parseInt( key, 16 ) );
        let inversions: number = 0;
        for ( let i: number = 0; i < array.length; ++ i ) {
            for ( let j: number = i + 1; j < array.length; ++ j ) {
                if ( array[ i ] && array[ j ] && array[ i ] > array[ j ] ) ++ inversions;
            }
        }
        return inversions;
    }

    function getZeroPosition( state: string ): number {
        state = removeSpaces( state );
        return 4 - Math.floor( state.indexOf( "0" ) / 4 );
    }

    function removeSpaces( state: string ): string {
        while ( ~state.indexOf( " " ) ) state = state.replace( " ", "" );
        return state;
    }

    function isSolvable( state: string ): boolean {
        return !!( ( countInversion( state ) + getZeroPosition( state ) ) % 2 );
    }

    function genRandom(): string {
        let array: string[] = "123456789ABCDEF0".split( "" );
        for ( let i: number = array.length - 1; i > 0; -- i ) {
            let j: number = Math.floor( Math.random() * ( i + 1 ) );
            [ array[ i ], array[ j ] ] = [ array[ j ], array[ i ] ];
        }
        let state: string = array.join( "" );
        if ( isSolvable( state ) ) return state;
        return genRandom();
    }

    return { isSolvable, genRandom };
}());

const game = (function(){
    const delay = (ms: number) => new Promise( res => setTimeout( res, ms ) );

    const elm: {
        body: Element,
        board?: Element,
        ul?: HTMLUListElement,
        listItems: HTMLLIElement[],
        movesElement: HTMLSpanElement,
        min: HTMLSpanElement,
        sec: HTMLSpanElement,
        bbul: Element,
        buttons: {
            switch: HTMLSpanElement,
            undo: HTMLSpanElement,
            home: HTMLSpanElement,
            shuffle: HTMLSpanElement,
            info: HTMLSpanElement
        }
    } = {
        body: document.body,
        listItems: [],
        movesElement: document.querySelector( "#moves-value" ),
        min: document.querySelector( "#min" ),
        sec: document.querySelector( "#min" ),
        bbul: document.querySelector( "#bottom-bar ul" ),
        buttons: {
            switch: document.querySelector( "#switch" ),
            undo: document.querySelector( "#button-undo" ),
            home: document.querySelector( "#button-home" ),
            shuffle: document.querySelector( "#button-shuffle" ),
            info: document.querySelector( "#button-info" )
        }
    };

    const game: {
        state: string,
        idealState: string,
        favState: string,
        zeroPosition: position,
        states: string[],
        timer?: timer,
        isChecking: boolean,
        isCapturing: boolean,
        isStarted: boolean
    } = {
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
        undo: function() {
            if ( !game.isCapturing ) return;
            if ( !game.states.length ) return;
            writeState( game.states.pop() );
            writeMoves();
        },
        home: function() {
            if ( !game.isCapturing ) return;
            game.isChecking = false;
            writeState( game.idealState );
            gameStoped();
        },
        shuffle: function() {
            gameStoped();
            elm.body.classList.toggle( "slow", true );
            writeState( p15.genRandom() );
            delay( 400 ).then( () => elm.body.classList.toggle( "slow", false ) );
            game.isCapturing = true;
            writeMoves();
            writeTime( 0 );
            toggle( true );
        },
        info: function() {
            let moves: number = ( + window.localStorage.getItem("p15: moves") ) || 0;
            let time: number = ( + window.localStorage.getItem("p15: time") ) || 0;
            if ( moves && time ) {
                alert( `Best moves: ${ moves }
Best time: ${ Math.floor( time / 60 ) }m ${ time % 60 }s` );
            } else {
                alert( "Seems like you haven't completed any game yet. Try again after completing atleast one game." );
            }
        }
    };

    function drawGame(): void {

        elm.board = document.querySelector( "#game" );
        elm.ul = document.createElement( "ul" );
        elm.board.append( elm.ul );

        for ( let i: number = 0; i < 15; ++ i ) {
            let li: HTMLLIElement = createListItem( i );
            elm.ul.append( li );
            elm.listItems.push( li );
        }

        document.addEventListener( "keydown", function( event ) {
            let toMove: number = 0;
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
            const z: number = game.state.indexOf( "0" );
            if ( ( z % 4 == 0 && toMove === -1 ) || ( z % 4 == 3 && toMove === +1 ) ) return;
            const n: number = z + toMove;
            if ( !toMove || n < 0 || n > 15 ) return;
            clicked( parseInt( game.state.charAt( n ), 16 ) );
        } );

        elm.buttons.undo.addEventListener( "click", buttonActions.undo );
        elm.buttons.home.addEventListener( "click", buttonActions.home );
        elm.buttons.shuffle.addEventListener( "click", buttonActions.shuffle );
        elm.buttons.info.addEventListener( "click", buttonActions.info );
        elm.buttons.switch.addEventListener( "click", () => toggle( null ) );
        
        window.setTimeout( () => {
            elm.body.classList.toggle( "slow", true );
            writeState( p15.genRandom() );
            delay( 400 ).then( () => elm.body.classList.toggle( "slow", false ) );
            game.isCapturing = true;
        }, 2000 );
    }

    function createListItem( pos: number ): HTMLLIElement {
        const item = document.createElement( "li" );
        setPosition( item, pos );
        item.textContent = `${ pos + 1 }`;
        item.addEventListener( "click", () => clicked( pos + 1 ) );
        return item;
    }

    function isClickable( pos: number ): boolean {
        const li: HTMLLIElement = elm.listItems[ pos - 1 ];
        pos = Number( li.dataset.left ) + 4 * Number( li.dataset.top );
        let diff: number = Math.abs( game.zeroPosition.left + 4 * game.zeroPosition.top - pos );
        return diff === 4 || diff === 1;
    }

    function clicked( pos: number ): void {
        toggle( true );
        if ( !game.isCapturing || !isClickable( pos ) ) return;
        if ( !game.isStarted ) gameStarted();
        let { state }: { state: string } = game;
        state = state.toUpperCase();
        const position: string = pos.toString( 16 ).toUpperCase();
        const z: number = state.indexOf( "0" );
        const n: number = state.indexOf( position );
        const a: number = 0;
        const b: number = Math.min( z, n );
        const c: number = Math.max( z, n );
        const d: number = state.length;
        const x: string = z < n ? position : "0";
        const y: string = z > n ? position : "0";
        state = state.substring( a, b ) + x + state.substring( b + 1, c ) + y + state.substring( c + 1, d );
        writeState( state, true );
        if ( game.states.length ) writeMoves();
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
        state.split( "" ).forEach( ( key: string ): void => {
            !~"0 ".indexOf( key ) && setPosition( elm.listItems[ parseInt( key, 16 ) - 1 ], pos ++ );
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
            let moves: number = ( + window.localStorage.getItem("p15: moves") ) || 0;
            let time: number = ( + window.localStorage.getItem("p15: time") ) || 0;
            window.localStorage.setItem("p15: moves", `${ Math.min( moves, game.states.length - 1 ) || game.states.length - 1 }`);
            window.localStorage.setItem("p15: time", `${ Math.min( time, game.timer.read() ) || game.timer.read() }`);
            gameStoped();
            delay( 100 ).then( () => alert( "SOLVED!!" ) );
        }
        game.isChecking = true;
    }

    function gameStarted() {
        if ( !game.isStarted ) {
            game.timer = createTimer( writeTime, 1000 );
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

    function writeTime( time: number ): void {
        document.querySelector( "#min" ).textContent = `${ Math.floor(time / 60) }`;
        document.querySelector( "#sec" ).textContent = `${ time % 60 }`;
    }

    function toggle( arg: boolean ): void {
        if ( arg === null )
            elm.bbul.classList.toggle( "closed" );
        else
            elm.bbul.classList.toggle( "closed", arg );
    }

    function writeMoves(): void {
        elm.movesElement.textContent = `${ game.states.length }`;
    }

    drawGame();
    return { game };
}());

const createTimer = (function(){
    const timers: [ timer, boolean ][] = [];
    window.addEventListener( "blur", function() {
        timers.forEach( ( arg ) => {
            if ( arg[ 0 ].isPaused() ) {
                arg[ 1 ] = false;
            } else {
                arg[ 0 ].pause();
                arg[ 1 ] = true;
            }
        } );
    } );
    window.addEventListener( "focus", function() {
        timers.forEach( ( arg ) => {
            if ( arg[ 1 ] ) {
                arg[ 0 ].play();
                arg[ 1 ] = false;
            }
        } );

    } );
    return function( callback: (arg: number) => void, ms: number ): timer {
            let times = 0;
            let id = 0;
            let isPaused = false;
            callback( 0 );
            const timer: timer = {
                play: function() {
                    id = window.setInterval( () => callback( ++ times ), ms );
                    isPaused = false;
                },
                pause: function() {
                    window.clearInterval( id );
                    isPaused = true;
                },
                stop: function() {
                    window.clearInterval( id );
                    times = 0;
                    isPaused = true;
                },
                read: function() {
                    return times;
                },
                isPaused: function() {
                    return isPaused;
                }
            };
            timers.push( [ timer, false ] );
            return timer;
        };
}());
