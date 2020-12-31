export type Piece = number;
export const FRUIT_VALUE = -1;
export const EMPTY_VALUE = 0;

/**
 * [
 *     [ cell, cell, cell], // Row
 *     [ cell, cell, cell], // Row
 * ]
 */
export type Board = Piece[][];

export type Index = [rowIndex: number, cellIndex: number];

export interface GameState {
    headIndex: Index;
    board: Board;
    snakeLength: number;
    gameOver: boolean;
}