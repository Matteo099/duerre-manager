import Konva from 'konva';

export interface IDieEditor {
    get stage(): Konva.Stage;
    get layer(): Konva.Layer;
    get gridSize(): number;
    get zoomStep(): number;
    
    getSnappedToGridPointer(): Konva.Vector2d;
}