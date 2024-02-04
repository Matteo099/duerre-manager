import Konva from "konva";
import { IDieEditor } from "./idie-editor";
import { KonvaEditableText } from "./konva-editable-text";
import { ERASABLE } from "./constants";
import { KonvaUtils } from "./konva-utils";
import { Quad } from "./benzier-line";


export interface IExtendedShape<S extends Konva.Shape> {
    getPoints(): number[];
    setPoints(p: number[]): S;
    calculateLength(): number;
    calculateMiddlePoint(): Konva.Vector2d;
    calculatePointsGivenLength(length: number): number[];
    updateEndpoint(oldPoint: Konva.Vector2d, newValue: Konva.Vector2d): void;
    get shape(): S;
}

export abstract class ExtendedShape<S extends Konva.Shape> implements IExtendedShape<S> {
    protected readonly _shape: S;
    get shape(): S { return this._shape; }

    constructor(position: Konva.Vector2d) {
        this._shape = this.createShape(position);
    }
    abstract getPoints(): number[];
    abstract setPoints(p: number[]): S;
    abstract calculateLength(): number;
    abstract calculateMiddlePoint(): Konva.Vector2d;
    abstract calculatePointsGivenLength(length: number): number[];
    abstract updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d): void;

    protected abstract createShape(initialPosition: Konva.Vector2d): S;
}

export class LineExt extends ExtendedShape<Konva.Line> {

    protected override createShape(position: Konva.Vector2d): Konva.Line {
        const line = new Konva.Line({
            stroke: '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            hitStrokeWidth: 20,
            // add point twice, so we have some drawings even on a simple click
            points: [position.x, position.y, position.x, position.y],
        });
        return line;
    }

    getPoints(): number[] {
        return this._shape.points();
    }

    setPoints(p: number[]): Konva.Line {
        return this._shape.points(p);
    }

    calculateLength(): number {
        return KonvaUtils.calculateLength(this._shape);
    }

    calculateMiddlePoint(): Konva.Vector2d {
        return KonvaUtils.calculateMiddlePoint(this._shape);
    }

    calculatePointsGivenLength(length: number): number[] {
        const point = KonvaUtils.findPoint(this._shape, length);
        const oldPoints = this._shape.points();
        const newPoints = [...oldPoints];
        newPoints[newPoints.length - 2] = point.x;
        newPoints[newPoints.length - 1] = point.y;
        return newPoints;
    }

    updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d): void {
        const coords = KonvaUtils.lineToCoords(this._shape);
        if (oldPoint == 'start' || (typeof oldPoint === 'object' && coords.x1 == oldPoint.x && coords.y1 == oldPoint.y)) {
            this.setPoints([
                newValue.x, newValue.y, coords.x2, coords.y2
            ]);
        } else if (oldPoint == 'end' || (typeof oldPoint === 'object' && coords.x2 == oldPoint.x && coords.y2 == oldPoint.y)) {
            this.setPoints([
                coords.x1, coords.y1, newValue.x, newValue.y
            ]);
        }
    }
}

export class BezierLineExt extends ExtendedShape<Konva.Shape> {
    private quad!: Quad;
    private readonly numberOfPoints: number = 100;

    protected override createShape(position: Konva.Vector2d): Konva.Shape {
        this.quad = new Quad(position, { x: position.x, y: position.y + 10 }, position);

        const bezierLine = new Konva.Shape({
            stroke: '#df4b26',
            strokeWidth: 5,
            globalCompositeOperation: 'source-over',
            // round cap for smoother lines
            lineCap: 'round',
            lineJoin: 'round',
            hitStrokeWidth: 20,
            sceneFunc: (ctx, shape) => {
                ctx.beginPath();
                ctx.moveTo(this.quad.start.x, this.quad.start.y);
                ctx.quadraticCurveTo(
                    this.quad.control.x,
                    this.quad.control.y,
                    this.quad.end.x,
                    this.quad.end.y
                );
                ctx.fillStrokeShape(shape);
            }
        });
        return bezierLine;
    }

    getPoints(): number[] {
        const points: number[] = [];
        for (let t = 0; t <= 1; t += 1 / this.numberOfPoints) {
            const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
            const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;
            points.push(x, y);
        }
        return points;
    }

    setPoints(p: number[] | Quad): Konva.Shape {
        if (p instanceof Array && p.length % 2 === 0) {
            this.quad.start.x = p[0];
            this.quad.start.y = p[1];
            this.quad.control.x = p[2];
            this.quad.control.y = p[3];
            this.quad.end.x = p[4];
            this.quad.end.y = p[5];
        } else {
            this.quad = p as Quad;
        }
        return this._shape;
    }

    calculateLength(): number {
        let length = 0;

        for (let i = 0; i < this.numberOfPoints; i++) {
            const t1 = i / this.numberOfPoints;
            const t2 = (i + 1) / this.numberOfPoints;
            const midpoint = (t1 + t2) / 2;

            length += this.calculateLineLength(midpoint) * (t2 - t1);
        }

        return length;
    }

    private calculateLineLength(t: number) {
        const derivativeX = 2 * (1 - t) * (this.quad.control.x - this.quad.start.x) + 2 * t * (this.quad.end.x - this.quad.control.x);
        const derivativeY = 2 * (1 - t) * (this.quad.control.y - this.quad.start.y) + 2 * t * (this.quad.end.y - this.quad.control.y);
        return Math.sqrt(derivativeX ** 2 + derivativeY ** 2);
    }

    calculateMiddlePoint(): Konva.Vector2d {
        const t = 0.5; // middle point

        const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
        const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;

        return { x, y };
    }

    calculatePointsGivenLength(length: number): number[] {
        //const points: number[] = [];

        let totalLength = 0;
        let prevX = this.quad.start.x;
        let prevY = this.quad.start.y;

        for (let t = 0; t <= 1; t += 1 / this.numberOfPoints) {
            const x = Math.pow(1 - t, 2) * this.quad.start.x + 2 * (1 - t) * t * this.quad.control.x + t * t * this.quad.end.x;
            const y = Math.pow(1 - t, 2) * this.quad.start.y + 2 * (1 - t) * t * this.quad.control.y + t * t * this.quad.end.y;

            let segmentLength = 0;
            if (t > 0) {
                segmentLength = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
                totalLength += segmentLength;
            }

            if (length <= totalLength || t === 1) {
                // Calculate the adjusted t value to match the target length
                const adjustedT = t - (totalLength - length) / (length - (totalLength - segmentLength));

                const adjustedX =
                    Math.pow(1 - adjustedT, 2) * this.quad.start.x +
                    2 * (1 - adjustedT) * adjustedT * this.quad.control.x +
                    adjustedT * adjustedT * this.quad.end.x;

                const adjustedY =
                    Math.pow(1 - adjustedT, 2) * this.quad.start.y +
                    2 * (1 - adjustedT) * adjustedT * this.quad.control.y +
                    adjustedT * adjustedT * this.quad.end.y;

                // Update the quad points
                this.quad.end.x = adjustedX;
                this.quad.end.y = adjustedY;

                break;
            }

            //points.push(x, y);
            prevX = x;
            prevY = y;
        }

        return this.quad.toArray();//points;
    }

    updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d): void {
        if (oldPoint == 'start' || (typeof oldPoint === 'object' &&
            oldPoint.x === this.quad.start.x &&
            oldPoint.y === this.quad.start.y)
        ) {
            this.quad.start.x = newValue.x;
            this.quad.start.y = newValue.y;
        } else if (typeof oldPoint === 'object' &&
            oldPoint.x === this.quad.control.x &&
            oldPoint.y === this.quad.control.y
        ) {
            this.quad.control.x = newValue.x;
            this.quad.control.y = newValue.y;
        } else if (oldPoint == 'end' || (typeof oldPoint === 'object' &&
            oldPoint.x === this.quad.end.x &&
            oldPoint.y === this.quad.end.y
        )) {
            this.quad.end.x = newValue.x;
            this.quad.end.y = newValue.y;
        }

        // Update the shape based on the new quad points
        // this._shape.points(this.getPoints());
    }
}

export type LengthChangeFn = () => void;

export interface IMeasurableShape {
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

export class MeasurableShape<S extends ExtendedShape<any>> implements IMeasurableShape {
    private readonly editor: IDieEditor;
    public readonly group: Konva.Group;
    public readonly extShape: S;
    public readonly text: KonvaEditableText;

    public onLengthChange?: LengthChangeFn;

    constructor(editor: IDieEditor, position: Konva.Vector2d, shapeConstructor: new (initialPosition: Konva.Vector2d) => S) {
        this.editor = editor;
        this.extShape = this.createShape(position, shapeConstructor);
        this.text = this.createText(position);
        this.group = this.createGroup();
    }

    private createShape(position: Konva.Vector2d, shapeConstructor: new (initialPosition: Konva.Vector2d) => S): S {
        return new shapeConstructor(position);
    }

    private createText(position: Konva.Vector2d): KonvaEditableText {
        const text = new KonvaEditableText(this.editor, {
            x: position.x,
            y: position.y,
            text: "0 mm",
            fill: '#333',
            fontSize: 25,
            fontFamily: 'Arial',
            align: 'center'
        });
        text.text.setAttr("MEASUREMENT", true);
        text.onDeleteTextarea = (v: string) => this.onDeleteTextarea(v);
        text.beforeCreateTextarea = () => { this.text.text.text(this.extShape.calculateLength().toFixed(2).toString()); }
        return text;
    }

    private createGroup(): Konva.Group {
        const group = new Konva.Group();
        group.setAttr(ERASABLE, true);
        group.add(this.extShape.shape, this.text.text);
        return group;
    }

    public updatePoints(newPoints: number[]) {
        this.extShape.setPoints(newPoints);
        this.updateText();
    }

    public updateText() {
        const width = this.text.text.width() || 0;
        const height = this.text.text.height() || 0;
        const middlePoint = this.extShape.calculateMiddlePoint();
        const length = this.extShape.calculateLength().toFixed(2);
        this.text.text.x(middlePoint.x - width / 2);
        this.text.text.y(middlePoint.y - height / 2);
        this.text.text.text(length + " mm");
    }

    public getLength(): number {
        return this.extShape.calculateLength();
    }

    public destroy() {
        this.group.destroy();
    }

    private onDeleteTextarea(value: string) {
        console.log(value);
        try {
            const length = parseFloat(value);
            const newPoints = this.extShape.calculatePointsGivenLength(length);
            this.updatePoints(newPoints);
            // const point = KonvaUtils.findPoint(this.shape, length);
            // const oldPoints = this.shape.points();
            // const newPoints = [...oldPoints];
            // newPoints[newPoints.length - 2] = point.x;
            // newPoints[newPoints.length - 1] = point.y;
            // this.updatePoints(newPoints);
            // this.onLengthChange?.(KonvaUtils.pointsVector2d(oldPoints)[1], KonvaUtils.pointsVector2d(newPoints)[1]);

            // TODO update onLengthChange method
            // this.onLengthChange?.(length);
        } catch (error) { }
    }

    public updateEndpoint(oldPoint: Konva.Vector2d | ('start' | 'end'), newValue: Konva.Vector2d) {
        this.extShape.updateEndpoint(oldPoint, newValue);
        this.updateText();
        // const coords = KonvaUtils.lineToCoords(this.shape);
        // if (coords.x1 == oldPoint.x && coords.y1 == oldPoint.y) {
        //     this.updatePoints([
        //         newValue.x, newValue.y, coords.x2, coords.y2
        //     ]);
        // } else if (coords.x2 == oldPoint.x && coords.y2 == oldPoint.y) {
        //     this.updatePoints([
        //         coords.x1, coords.y1, newValue.x, newValue.y
        //     ]);
        // }
    }
}