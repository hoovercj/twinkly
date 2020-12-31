import './LightMatrix.css';

export type RGB = { r: number, g: number, b: number };

export interface LightMatrixProps {
    lights: RGB[][];
}

export const LightMatrix = (props: LightMatrixProps): JSX.Element => {
    return (
        <div className='matrix'>
            {props.lights?.map((row, rowIndex) =>
                <div key={rowIndex} className='row'>
                    {row.map((cell, cellIndex) =>
                        <div key={cellIndex} className='cell' style={{ backgroundColor: `rgb(${cell.r},${cell.g},${cell.b})`}} />
                    )}
                </div>
            )}
        </div>
    );
}