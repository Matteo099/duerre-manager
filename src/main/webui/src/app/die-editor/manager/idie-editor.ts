import Konva from 'konva';
import { DieState } from './die-state';
import { KonvaHelper } from './konva-helper';

export interface IDieEditor {
    get stage(): Konva.Stage;
    get layer(): Konva.Layer;
    get gridSize(): number;
    get zoomStep(): number;
    get state(): DieState;
    get helper(): KonvaHelper;


    getSnappedToNearObject(points?: Konva.Vector2d[]): { v: Konva.Vector2d, obj: "grid" | "vertex" };
}