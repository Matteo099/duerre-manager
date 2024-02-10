import Konva from "konva";
import { IExtendedShape } from "./iextended-shape";
import { KonvaEditableText } from "./konva-editable-text";

export type LengthChangeFn = () => void;

export interface IMeasurableShape {
    getEndPoints(): Konva.Vector2d[];
    onLengthChange?: LengthChangeFn;
    group: Konva.Group;
    extShape: IExtendedShape<any> | Konva.Line;
    text: KonvaEditableText;

    updatePoints(newPoints: number[]): void;
    updateText(): void;
    getLength(): number;
    destroy(): void;
    updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d): void;
}