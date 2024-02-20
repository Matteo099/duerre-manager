import Konva from "konva";
import { Subscription } from "rxjs";
import { DieDataDao } from "../../models/dao/die-data-dao";
import { IMeasurableShape, LengthChanged } from "./shape-ext/imeasurable-shape";
import { DieDataShapeDao } from "../../models/dao/die-data-shape-dao";
import { MeasurableShape } from "./shape-ext/measurable-shape";

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
    public readonly subscriptions: Subscription[] = [];

    public canDrawNewLine(pos: Konva.Vector2d): boolean {
        if (this.lines.length > 0) {
            const endpoints = this.getEndPoints();
            const vertex = endpoints.find(v => v.x == pos.x && v.y == pos.y);
            if (!vertex) return false;
        }
        return true;
    }

    public addLine(shape: IMeasurableShape) {
        this.lines.push(shape);
        this.updatePolygon();
        const s = shape.onLengthChanged.subscribe((v: LengthChanged) => this.onLengthChange(shape, v.oldPoint, v.newPoint));
        this.subscriptions.push(s);
        //shape.onLengthChange = (oldPoint: Konva.Vector2d, newPoint: Konva.Vector2d) => this.onLengthChange(shape, oldPoint, newPoint);
    }

    public remove(node?: Konva.Shape | Konva.Stage | Konva.Node) {
        if (!node) return;

        const index = this.lines.findIndex(l => l.group._id == node._id || l.getId() == node._id || l.text.text._id == node._id);
        if (index >= 0) {
            this.lines[index].destroy();
            this.lines.splice(index, 1);
            this.updatePolygon();
        }
    }

    private updatePolygon() {
        this.polygon.points(this.lines.flatMap(l => (l.extShape instanceof Konva.Line ? l.extShape.points() : l.extShape.getPoints())));

        const endpoints = this.getEndPoints();
        if (endpoints.length == 0) {
            this.polygon.visible(true);
        }
    }

    private onLengthChange(shape: IMeasurableShape, oldPoints: Konva.Vector2d, newPoints: Konva.Vector2d) {
        const attachedLine = this.findShapesWithEndpoint(oldPoints).filter(s => s.getId() != shape.getId())[0];
        console.log("onLengthChange", shape, oldPoints, newPoints, attachedLine);
        attachedLine?.updateEndpoint(oldPoints, newPoints);
    }

    public getVertices(): Konva.Vector2d[] {
        return this.lines.flatMap(l => {
            const points = (l.extShape instanceof Konva.Line ? l.extShape.points() : l.extShape.getPoints());
            const vertices: Konva.Vector2d[] = [];
            for (let i = 0; i < points.length - 1; i += 2) {
                vertices.push({ x: points[i], y: points[i + 1] });
            }
            return vertices;
        });
    }

    public getEndPoints(): Konva.Vector2d[] {
        const vectors = this.lines.flatMap(l => l.getEndPoints());
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

    /*public findAttachedLines(line: Konva.Line): Konva.Line[] {
        const attachedLines: Konva.Line[] = [];
        const coords = KonvaUtils.lineToCoords(line);
        for (const mLine of this.lines) {
            if (!(mLine.extShape instanceof Konva.Line)) continue;
            const points = KonvaUtils.lineToCoords(mLine.extShape);
            if (points.x1 == coords.x1 && points.x2 == coords.x2 && points.y1 == coords.y1 && points.y2 == coords.y2) {
                attachedLines.push(mLine.extShape);
            }
        }
        return attachedLines;
    }*/

    public findShapesWithEndpoint(endpoint: Konva.Vector2d): IMeasurableShape[] {
        const attachedLines: IMeasurableShape[] = [];
        for (const mLine of this.lines) {
            const sEndpoints = mLine.getEndPoints();
            if ((sEndpoints[0].x == endpoint.x && sEndpoints[0].y == endpoint.y) || (sEndpoints[1].x == endpoint.x && sEndpoints[1].y == endpoint.y)) {
                attachedLines.push(mLine);
            }
        }
        return attachedLines;
    }

    public save(): DieDataShapeDao[] {

        debugger;
        
        const dieDataShapeDao: DieDataShapeDao[] = [];
        const orderedLines: IMeasurableShape[] = [];
        const allLinesCopy = [...this.lines]; // Create a copy to avoid modifying the original array
        let i = 0;

        // Order the lines so that it generates an array of contigous lines
        while (allLinesCopy.length > 0) {
            const currentLine = allLinesCopy[i];
            if (orderedLines.length === 0 || currentLine.hasCommonEndPointWith(orderedLines[orderedLines.length - 1])) {
                orderedLines.push(currentLine);
                allLinesCopy.splice(i, 1);
                i = 0;
            } else {
                i++;
            }
        }

        for (const line of orderedLines)
            dieDataShapeDao.push(line.extShape.toDieDataShape());

        return dieDataShapeDao;
    }

    public clear() {
        this.lines.forEach(element => {
            element.destroy();
        });
        this.lines.splice(0, this.lines.length);
    }

}