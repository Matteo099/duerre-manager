import type Konva from "konva";
import type { IExtendedShape } from "./iextended-shape";
import type { KonvaEditableText } from "./konva-editable-text";
import { Subject } from "rxjs";
import type { Point } from "./point";

export type LengthChangeFn = (oldPoint: Point, newPoint: Konva.Vector2d) => void;
export type LengthChanged = {oldPoint: Point, newPoint: Konva.Vector2d};

export interface IMeasurableShape {
    //onLengthChange?: LengthChangeFn;
    onLengthChanged: Subject<LengthChanged>;
    group: Konva.Group;
    extShape: IExtendedShape<any>;
    text: KonvaEditableText;
    
    hasCommonEndPointWith(shape: IMeasurableShape): boolean;
    updatePoints(newPoints: number[]): void;
    updateText(): void;
    getLength(): number;
    destroy(): void;
    updateEndpoint(oldPoint: Point | ('start' | 'end'), newValue: Konva.Vector2d): void;
    getId(): number;
    getEndPoints(): Point[];
    getAnchorPoints(): Point[]
}