import { fabric } from 'fabric';

export interface IDieEditor {
    get fabricCanvas(): fabric.Canvas;
    get gridSize(): number;
    get zoomStep(): number;
}