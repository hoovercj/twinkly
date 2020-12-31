import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDirectionKeys } from '../hooks/useDirectionKeys';
import { Direction } from '../lib/direction';
import { Snake as SnakeGame } from '../lib/snake';
import { EMPTY_VALUE, FRUIT_VALUE, GameState, Piece } from '../lib/snake.types';
import { LightMatrix, LightMatrixProps, RGB } from './LightMatrix';

export interface SnakeProps {
    onLightsChanged: (lights: RGB[][]) => void;
}

export function Snake(props: SnakeProps): JSX.Element {
    const timeout = useRef<number>(0);

    const direction = useRef<Direction>(Direction.right);
    const game = useRef<SnakeGame>(new SnakeGame(10, 21));

    const initialLightMatrixProps = getLightMatrixPropsForGameState(game.current.gameState);

    const [lightMatrixProps, setLightMatrixProps] = useState(initialLightMatrixProps);

    const doMove = useCallback(() => {
        game.current.doMove(direction.current);
        const newLightMatrixProps = getLightMatrixPropsForGameState(game.current.gameState);
        setLightMatrixProps(newLightMatrixProps);
    }, []);

    const startTimer = useCallback(() => {
        timeout.current = window.setTimeout(() => {
            doMove();
            startTimer();
        }, 500);

        return () => {
            clearTimeout(timeout.current);
        }
    }, [doMove]);

    useEffect(() => {
        startTimer();
    }, [startTimer]);

    useDirectionKeys((newDirection: Direction) => {
        if (!validateDirection(direction.current, newDirection)) {
            return;
        }

        window.clearTimeout(timeout.current);
        direction.current = newDirection;
        doMove();
        startTimer();
    }, [doMove, startTimer]);

    const onRestartClick = useCallback(() => {
        window.clearTimeout(timeout.current);
        game.current.reset()
        direction.current = Direction.right;
        startTimer();
    }, [startTimer]);

    useEffect(() => {
        props.onLightsChanged(lightMatrixProps?.lights);
    }, [props, lightMatrixProps]);

    return (
        <>
            <LightMatrix {...lightMatrixProps} />
            <button onClick={onRestartClick}>Restart game</button>
        </>
    );
}

const validateDirection = (oldDirection: Direction, newDirection: Direction): boolean => {
    switch (oldDirection) {
        case Direction.up:
            return newDirection !== Direction.down;
        case Direction.down:
            return newDirection !== Direction.up;
        case Direction.left:
            return newDirection !== Direction.right;
        case Direction.right:
            return newDirection !== Direction.left;
    }
}

const getLightMatrixPropsForGameState = (gameState: GameState): LightMatrixProps => {
    const lights: RGB[][] = gameState.board.reduce<RGB[][]>((output: RGB[][], row: Piece[]) => {
        output.push(row.map((piece): RGB => {
            switch (piece) {
                case EMPTY_VALUE:
                    return {
                        r: 255,
                        g: 255,
                        b: 255,
                    };
                case FRUIT_VALUE:
                    return {
                        r: 0,
                        g: 255,
                        b: 0,
                    };
                default:
                    if (piece === gameState.snakeLength && gameState.gameOver) {
                        return {
                            r: 255,
                            g: 0,
                            b: 0,
                        };
                    } else {
                        return {
                            r: 0,
                            g: 0,
                            b: 255,
                        };
                    }
            }
        }));

        return output;
    }, [] as RGB[][]);

    return {
        lights,
    };
}