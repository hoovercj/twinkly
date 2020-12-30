import { useEffect } from 'react';
import { Direction } from '../lib/direction';

export function useDirectionKeys(callback: (direction: Direction) => void, deps: any[], ref?: HTMLElement): void {
    useEffect(() => {
        const element = ref ?? document.body;
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "Down":
                case "ArrowDown":
                    callback(Direction.down);
                    break;
                case "Up":
                case "ArrowUp":
                    callback(Direction.up);
                    break;
                case "Left":
                case "ArrowLeft":
                    callback(Direction.left);
                    break;
                case "Right":
                case "ArrowRight":
                    callback(Direction.right);
                    break;
            }
        };

        element?.addEventListener('keydown', onKeyDown);

        return () => {
            element?.removeEventListener('keydown', onKeyDown);
        };
    }, [callback, ref, ...deps]);
}