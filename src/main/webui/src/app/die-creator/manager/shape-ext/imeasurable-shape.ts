import Konva from "konva";
import { IExtendedShape } from "./iextended-shape";
import { KonvaEditableText } from "./konva-editable-text";
import { EventEmitter } from "@angular/core";

export type LengthChangeFn = (oldPoint: Konva.Vector2d, newPoint: Konva.Vector2d) => void;
export type LengthChanged = {oldPoint: Konva.Vector2d, newPoint: Konva.Vector2d};

export interface IMeasurableShape {
    //onLengthChange?: LengthChangeFn;
    onLengthChanged: EventEmitter<LengthChanged>;
    group: Konva.Group;
    extShape: IExtendedShape<any>;
    text: KonvaEditableText;
    
    hasCommonEndPointWith(shape: IMeasurableShape): boolean;
    updatePoints(newPoints: number[]): void;
    updateText(): void;
    getLength(): number;
    destroy(): void;
    updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d): void;
    getId(): number;
    getEndPoints(): Konva.Vector2d[];
    getAnchorPoints(): Konva.Vector2d[]
}