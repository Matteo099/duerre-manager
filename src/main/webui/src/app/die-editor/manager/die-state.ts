import Konva from "konva";
import { LineMeasurement } from "./line-measurement";
import { KonvaUtils } from "./konva-utils";
import { IMeasurableShape } from "./measurable-shape";

export class DieState {

    // controlla la generazione del poligono, 
    // controlla l'aggiunta/rimuozione/modifica dei lati del poligono
    // contiene i metodi per verificare quale lato è adiacente a quale altro lato
    // permette di ottenere gli endpoints

    public readonly lines: IMeasurableShape[] = [];
    public readonly polygon: Konva.Line = new Konva.Line({
        points: [],
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 5,
        closed: true,
        visible: false
    });

    public canDrawNewLine(pos: Konva.Vector2d): boolean {
        if (this.lines.length > 0) {
            const endpoints = this.getEndPoints();
            const vertex = endpoints.find(v => v.x == pos.x && v.y == pos.y);
            if (!vertex) return false;
        }
        return true;
    }

    public addLine(lineMeasure: IMeasurableShape) {
        this.lines.push(lineMeasure);
        this.updatePolygon();

        lineMeasure.onLengthChange = () => { console.log("TODOODODODODO"); };
        // (oldPoints: Konva.Vector2d, newPoints: Konva.Vector2d) => this.onLengthChange(lineMeasure, oldPoints, newPoints);
    }

    public remove(node?: Konva.Shape | Konva.Stage | Konva.Node) {
        if (!node) return;

        this.lines.find(l => l.group._id == node._id || l.extShape._id == node._id || l.text.text._id == node._id)?.destroy();
        this.updatePolygon();
    }

    private updatePolygon() {
        this.polygon.points(this.lines.flatMap(l => l.extShape.points()));

        const endpoints = this.getEndPoints();
        if (endpoints.length == 0) {
            this.polygon.visible(true);
        }
    }

    private onLengthChange(lineMeasure: LineMeasurement, oldPoints: Konva.Vector2d, newPoints: Konva.Vector2d) {
        const line = lineMeasure.line;
        const attachedLine = this.findLinesWithEndpoint(oldPoints).filter(l => l.extShape._id != line._id)[0];
        attachedLine?.updateEndpoint(oldPoints, newPoints);
    }

    public getVertices(): Konva.Vector2d[] {
        return this.lines.flatMap(l => {
            const points = l.extShape.points();
            const vertices: Konva.Vector2d[] = [];
            for (let i = 0; i < points.length - 1; i += 2) {
                vertices.push({ x: points[i], y: points[i + 1] });
            }
            return vertices;
        });
    }

    public getEndPoints(): Konva.Vector2d[] {
        const vectors = this.getVertices();
        const vectorCountMap: Record<string, number> = {};

        // Count the occurrences of each vector
        for (const vector of vectors) {
            const key = `${vector.x}-${vector.y}`;
            vectorCountMap[key] = (vectorCountMap[key] || 0) + 1;
        }

        // Filter out vectors that occur only once
        const uniqueVectors = vectors.filter(vector => {
            const key = `${vector.x}-${vector.y}`;
            return vectorCountMap[key] === 1;
        });

        return uniqueVectors;
    }

    public findAttachedLines(line: Konva.Line): Konva.Line[] {
        const attachedLines: Konva.Line[] = [];
        const coords = KonvaUtils.lineToCoords(line);
        for (const mLine of this.lines) {
            const points = KonvaUtils.lineToCoords(mLine.extShape);
            if (points.x1 == coords.x1 && points.x2 == coords.x2 && points.y1 == coords.y1 && points.y2 == coords.y2) {
                attachedLines.push(mLine.extShape);
            }
        }
        return attachedLines;
    }

    public findLinesWithEndpoint(endpoint: Konva.Vector2d): IMeasurableShape[] {
        const attachedLines: IMeasurableShape[] = [];
        for (const mLine of this.lines) {
            const points = KonvaUtils.lineToCoords(mLine.extShape);
            if ((points.x1 == endpoint.x && points.y1 == endpoint.y) || (points.x2 == endpoint.x && points.y2 == endpoint.y)) {
                attachedLines.push(mLine);
            }
        }
        return attachedLines;
    }
}