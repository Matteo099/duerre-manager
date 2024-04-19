import type Konva from "konva";
import type { IExtendedShape } from "./iextended-shape";
import type { Point } from "../../math/point";
import type { LiteEvent } from "../../event/lite-event";
import type { EditableText } from "../editable-text";

export type LengthChangeFn = (oldPoint: Point, newPoint: Konva.Vector2d) => void;
export type LengthChanged = {oldPoint: Point, newPoint: Konva.Vector2d};

export interface IMeasurableShape {
    //onLengthChange?: LengthChangeFn;
    onLengthChanged: LiteEvent<LengthChanged>;
    group: Konva.Group;
    extShape: IExtendedShape<any>;
    text: EditableText;
    
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