import { Direction } from './direction';
import { Board, EMPTY_VALUE, FRUIT_VALUE, GameState, Index, Piece } from './snake.types';

export class Snake {
    static readonly DEFAULT_HEAD_LOCATION: Index = [0, 0];
    static readonly DEFAULT_FRUIT_LOCATION: Index = [10, 5];

    private _gameState: GameState;

    constructor(private width: number, private height: number) {
        this._gameState = generateNewGameState(this.width, this.height);
    }

    public get gameState(): GameState {
        return this._gameState;
    }

    public doMove = (direction: Direction): void => {
        this._gameState = generateGameState(this.gameState, direction);
    }

    public reset = (): void => {
        this._gameState = generateNewGameState(this.width, this.height);
    }
}

const generateNewGameState = (width: number, height: number): GameState => {
    const board: Board = [];

    const [ headRowIndex, headCellIndex ] = Snake.DEFAULT_HEAD_LOCATION;
    const [ fruitRowIndex, fruitCellIndex ] = Snake.DEFAULT_FRUIT_LOCATION;

    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        const row: Piece[] = [];
        for (let cellIndex = 0; cellIndex < width; cellIndex++) {
            // TODO: randomly start snake?
            // TODO: Start snake with length of 3 instead of 1
            if (rowIndex === headRowIndex && cellIndex === headCellIndex) {
                row.push(1);
                // TODO: randomly place fruit?
            } else if (rowIndex === fruitRowIndex && cellIndex === fruitCellIndex) {
                row.push(FRUIT_VALUE);
            } else {
                row.push(0);
            }
        }
        board.push(row);
    }

    return {
        board,
        snakeLength: 1,
        headIndex: [headRowIndex, headCellIndex],
        gameOver: false,
    };
}

const addValuesAndWrap = (a: number, b: number, mod: number): number => {
    return (a + b + mod) % mod;
}

const moveHeadIndex = (index: Index, direction: Direction, width: number, height: number): Index => {
    switch (direction) {
        case Direction.up:
            return [addValuesAndWrap(index[0], -1, height), index[1]];
        case Direction.down:
            return [addValuesAndWrap(index[0], 1, height), index[1]];
        case Direction.left:
            return [index[0], addValuesAndWrap(index[1], -1, width)];
        case Direction.right:
            return [index[0], addValuesAndWrap(index[1], 11, width)];
    }
}

const generateGameState = (oldState: GameState, direction: Direction): GameState => {
    if (oldState.gameOver) {
        return oldState;
    }

    const { snakeLength, board: oldBoard, headIndex: oldHeadIndex } = oldState;

    const candidateHeadIndex = moveHeadIndex(oldHeadIndex, direction, oldBoard[0].length, oldBoard.length);
    const oldPieceAtNewIndex = oldBoard[candidateHeadIndex[0]][candidateHeadIndex[1]];

    const ateFruit = oldPieceAtNewIndex === FRUIT_VALUE;
    const gameOver = isBodyPiece(oldPieceAtNewIndex);

    const newSnakeLength = ateFruit ? snakeLength + 1 : snakeLength;
    const newHeadIndex = gameOver ? oldHeadIndex : candidateHeadIndex;

    let newFruitPosition: number | null = ateFruit
        ? randomIntFromInterval(0, (oldBoard.length * oldBoard[0].length) - newSnakeLength - 1)
        : null;

    let emptyPieces = 0;
    const newBoard: Board = [];
    for (let rowIndex = 0; rowIndex < oldBoard.length; rowIndex++) {
        const newRow: Piece[] = [];
        for (let cellIndex = 0; cellIndex < oldBoard[rowIndex].length; cellIndex++) {
            const oldPiece = oldBoard[rowIndex][cellIndex];
            let newPiece: Piece = EMPTY_VALUE;

            if (areIndexesEqual(newHeadIndex, [rowIndex, cellIndex])) {
                newPiece = newSnakeLength;
            } else if (!isBodyPiece(oldPiece) || ateFruit) {
                newPiece = oldPiece;
            } else {
                newPiece = oldPiece > 1 ? oldPiece - 1 : EMPTY_VALUE;
            }

            if (newFruitPosition !== null && newPiece === EMPTY_VALUE) {
                if (emptyPieces === newFruitPosition) {
                    newPiece = FRUIT_VALUE;
                    newFruitPosition = null;
                }

                emptyPieces++;
            }

            newRow.push(newPiece);
        }

        newBoard.push(newRow);
    }

    return {
        board: newBoard,
        headIndex: newHeadIndex,
        snakeLength: newSnakeLength,
        gameOver,
    }
}

const isBodyPiece = (piece: Piece): boolean => {
    return piece !== EMPTY_VALUE && piece !== FRUIT_VALUE;
}

const areIndexesEqual = (a: Index, b: Index): boolean => {
    return a[0] === b[0] && a[1] === b[1];
}

// TODO: allow seed so this can be tested more strictly
const randomIntFromInterval = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// moveSnake
// add new snake piece
// remove last snake piece

// const addPieceToBoard = (board: Board, rowIndex: number, cellIndex: number, piece: Piece): Board => {
//     const outputBoard: Board = [];
//     for (let r = 0; r < board.length; r++) {
//         outputBoard.push(Object.assign(board[r].slice(),
//             r === rowIndex
//                 ? { cellIndex: piece }
//                 : undefined
//         ));
//     }

//     return outputBoard;
// }