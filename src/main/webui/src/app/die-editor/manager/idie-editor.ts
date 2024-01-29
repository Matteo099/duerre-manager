import Konva from 'konva';

export interface IDieEditor {
    get stage(): Konva.Stage;
    get layer(): Konva.Layer;
    get gridSize(): number;
    get zoomStep(): number;
    
    getSnappedToNearObject(points?: Konva.Vector2d[]): Konva.Vector2d;
}