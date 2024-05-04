import Konva from "konva";
import { vec2DDistance, vec2DEquals } from "../math/vec2d";
import type { IMeasurableShape } from "./wrappers/imeasurable-shape";
import type { CutLine } from "./cut-line";
import type { Point } from "../math/point";

export type NearestVertex = { point?: Konva.Vector2d, shape?: IMeasurableShape };
export type RemoveOperation = IMeasurableShape | CutLine | undefined;

export class DieShape {

    public readonly lines: IMeasurableShape[] = [];
    public readonly cuts: CutLine[] = [];

    hasLines(): boolean {
        return this.lines.length > 0;
    }

    /**
     * @returns the array of all the vertices of the die shape 
     */
    getVertices(): Point[] {
        return this.lines.flatMap(l => l.getEndPoints()).reduce((a: Point[], b: Point) => {
            if (!a.find(p => p.equalsById(b))) a.push(b);
            return a;
        }, []);
    }

    /**
     * @returns the array of all the vertices of the die shape minus the enpoints (meaning all the points connected with 2 lines)
     */
    getVerticesExceptEndpoints(): Point[] {
        const allPoints = this.lines.flatMap(l => l.getEndPoints());
        // Count the occurrences of each point
        const pointCounts: Map<number, number> = new Map();
        allPoints.forEach(point => pointCounts.set(point.id, (pointCounts.get(point.id) || 0) + 1));
        // Filter out points that only appear once
        return allPoints.filter(point => (pointCounts.get(point.id) || 0) > 1);
    }

    /**
     * @returns an array of endpoints, meaning the points that are not connected with 2 lines 
     */
    getAvailableEndpoints(): Point[] {
        return this.lines.flatMap(l => l.getEndPoints()).reduce((a: Point[], b: Point) => {
            let index = a.findIndex(p => p.equalsById(b));
            if (index == -1) a.push(b);
            else a.splice(index, 1)
            return a;
        }, []);
    }

    add(line: IMeasurableShape) {
        this.lines.push(line);
    }

    addCut(line: CutLine) {
        line.calculatePointsPercentage();
        this.cuts.push(line);
    }

    remove(node?: Konva.Shape | Konva.Stage | Konva.Node): RemoveOperation {
        if (!node) return;

        let index = this.lines.findIndex(l => l.group._id == node._id || l.getId() == node._id || l.text.text._id == node._id);
        if (index >= 0) {
            const node = this.lines[index];
            node.destroy();
            this.lines.splice(index, 1);
            return node;
        } else if ((index = this.cuts.findIndex(l => l.getId() == node._id)) >= 0) {
            const node = this.cuts[index]
            node.shape.destroy();
            this.cuts.splice(index, 1);
            return node;
        }
    }

    public findNearestVertex(pointer: Konva.Vector2d, distanceTreshold?: number): NearestVertex | undefined {
        let nearestPointAndShape: NearestVertex = {};
        for (const line of this.lines) {
            // TODO: must cache result!!!
            const currentNearestPont = line.extShape.getNearestPoint(pointer);
            if (!currentNearestPont) continue;

            const distanceToCurrent = vec2DDistance(pointer, currentNearestPont);
            const distanceToNearest = nearestPointAndShape.point ? vec2DDistance(pointer, nearestPointAndShape.point) : Infinity;

            if (distanceToCurrent < distanceToNearest) {
                nearestPointAndShape.point = currentNearestPont;
                nearestPointAndShape.shape = line;
            }
        }

        if (nearestPointAndShape.point && distanceTreshold !== undefined) {
            if (vec2DDistance(pointer, nearestPointAndShape.point) > distanceTreshold) return;
        }
        return nearestPointAndShape;
    }

    public findNeighbors/*findShapesWithEndpoint*/(vertex: Konva.Vector2d | Point): IMeasurableShape[] {
        const attachedLines: IMeasurableShape[] = [];
        for (const mLine of this.lines) {
            const sEndpoints = mLine.getEndPoints();
            if (vec2DEquals(vertex, sEndpoints[0]) || vec2DEquals(vertex, sEndpoints[1]))
                attachedLines.push(mLine);
        }
        return attachedLines;
    }

    public findCutsConnectedTo(shape: Konva.Shape | Konva.Stage | Konva.Node): CutLine[] | undefined {
        const checkChildren = (node: Konva.Node): CutLine[] | undefined => {
            // Check if current node matches the condition
            const cut = this.cuts.filter(c => c.getStartPointShape()?.getId() === node._id || c.getEndPointShape()?.getId() === node._id);
            if (cut && cut.length > 0) return cut;

            // If current node has children, recursively check them
            if (node.hasChildren()) {
                const children = (node as any).children;
                for (const child of children) {
                    const result = checkChildren(child);
                    if (result) return result; // If a cut is found in children, return it
                }
            }


            // If no matching cut is found in this node or its children, return undefined
            return undefined;
        };

        // Start the search from the provided shape
        return checkChildren(shape);
    }

    public clear() {
        this.lines.forEach(element => {
            element.destroy();
        });
        this.lines.splice(0, this.lines.length);

        this.cuts.forEach(element => {
            element.shape.destroy();
        });
        this.cuts.splice(0, this.cuts.length);
    }






    // public canDrawNewLine(pos: Konva.Vector2d): boolean {
    //     if (this.lines.length > 0) {
    //         const endpoints = this.getEndPoints();
    //         const vertex = endpoints.find(v => v.x == pos.x && v.y == pos.y);
    //         if (!vertex) return false;
    //     }
    //     return true;
    // }

    // public getDrawingPoint(pos: Konva.Vector2d): { vertex?: Point, canDraw: boolean } {
    //     if (this.lines.length > 0) {
    //         const endpoints = this.getPolygonEndPoints();
    //         const vertex = endpoints.find(v => v.x == pos.x && v.y == pos.y);
    //         return { vertex, canDraw: !!vertex }
    //     }
    //     return { canDraw: true }
    // }

    // public isPolygonCreated(): boolean {
    //     return this.lines.length > 0 && this.getPolygonEndPoints().length == 0;
    // }

    // public addLine(shape: IMeasurableShape) {
    //     this.lines.push(shape);
    //     // this.updatePolygon();
    //     const s = shape.onLengthChanged.subscribe((v: LengthChanged) => this.onLengthChange(shape, v.oldPoint, v.newPoint));
    //     this.subscriptions.push(s);
    //     this.computePointsRequired = true;
    //     //shape.onLengthChange = (oldPoint: Konva.Vector2d, newPoint: Konva.Vector2d) => this.onLengthChange(shape, oldPoint, newPoint);
    // }

    // public addCutLine(cutLine: CutLine) {
    //     cutLine.calculatePointsPercentage();
    //     this.cuts.push(cutLine);
    // }

    // public remove(node?: Konva.Shape | Konva.Stage | Konva.Node) {
    //     if (!node) return;

    //     const index = this.lines.findIndex(l => l.group._id == node._id || l.getId() == node._id || l.text.text._id == node._id);
    //     if (index >= 0) {
    //         this.lines[index].destroy();
    //         this.lines.splice(index, 1);
    //         this.computePointsRequired = true;
    //         // this.updatePolygon();
    //     } else {
    //         const index = this.cuts.findIndex(l => l.getId() == node._id);
    //         if (index >= 0) {
    //             this.cuts[index].shape.destroy();
    //             this.cuts.splice(index, 1);
    //         }
    //     }
    // }

    // private updatePolygon() {
    //     this.polygon.points(this.lines.flatMap(l => (l.extShape instanceof Konva.Line ? l.extShape.points() : l.extShape.getPoints())));

    //     const endpoints = this.getEndPoints();
    //     if (endpoints.length == 0) {
    //         this.polygon.visible(true);
    //     }
    // }

    // private onLengthChange(shape: IMeasurableShape, oldPoints: Point, newPoints: Konva.Vector2d) {
    //     const attachedLine = this.findShapesWithEndpoint(oldPoints).filter(s => s.getId() != shape.getId())[0];
    //     console.log("onLengthChange", shape, oldPoints, newPoints, attachedLine);
    //     attachedLine?.updateEndpoint(oldPoints, newPoints);
    // }

    // public getVertices(): Konva.Vector2d[] {
    //     return this.lines.flatMap(l => {
    //         const points = l.extShape.getPoints();
    //         const vertices: Konva.Vector2d[] = [];
    //         for (let i = 0; i < points.length - 1; i += 2) {
    //             vertices.push({ x: points[i], y: points[i + 1] });
    //         }
    //         return vertices;
    //     });
    // }

    // public getVerticesExceptEndpoints() {
    //     const endpoints = this.getEndPoints();
    //     return this.lines.flatMap(l => {
    //         const points = l.extShape.getPoints();
    //         const vertices: Konva.Vector2d[] = [];
    //         for (let i = 0; i < points.length - 1; i += 2) {
    //             const v = { x: points[i], y: points[i + 1] };
    //             if (!endpoints.find(e => e.x == v.x && e.y == v.y))
    //                 vertices.push(v);
    //         }
    //         return vertices;
    //     });
    // }

    // /**
    //  * @returns all the endpoints of the shapes
    //  */
    // public getEndPoints(): Point[] {
    //     return this.lines.flatMap(l => l.getEndPoints()).reduce((a: Point[], b: Point) => {
    //         if (!a.find(p => p.equalsById(b))) a.push(b);
    //         return a;
    //     }, []);

    //     // const vectorCountMap: Record<string, number> = {};

    //     // // Count the occurrences of each vector
    //     // for (const vector of vectors) {
    //     //     const key = `${vector.x}-${vector.y}`;
    //     //     vectorCountMap[key] = (vectorCountMap[key] || 0) + 1;
    //     // }

    //     // // Filter out vectors that occur only once
    //     // const uniqueVectors = vectors.filter(vector => {
    //     //     const key = `${vector.x}-${vector.y}`;
    //     //     return vectorCountMap[key] === 1;
    //     // });

    //     // return uniqueVectors;
    // }

    // /**
    //  * @returns points that are not connected with other lines/curves 
    //  */
    // public getPolygonEndPoints(): Point[] {
    //     const availablePoints: Point[] = [];
    //     this.lines.flatMap(l => l.getEndPoints()).forEach(point => {
    //         const index = availablePoints.findIndex(p => p.equalsById(point))
    //         if (index == -1) {
    //             availablePoints.push(point);
    //         } else {
    //             availablePoints.splice(index, 1);
    //         }
    //     })
    //     return availablePoints;
    // }

    // public getNearestPolygonPointOld(pointer: Konva.Vector2d, distanceTreshold?: number): Konva.Vector2d | undefined {
    //     this.computePoints();

    //     const point = this.computedPoints.reduce((nearest: Konva.Vector2d, current: Konva.Vector2d) => {
    //         const distanceToCurrent = KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: current.x, y2: current.y });
    //         const distanceToNearest = nearest ? KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: nearest.x, y2: nearest.y }) : Infinity;

    //         return distanceToCurrent < distanceToNearest ? current : nearest;
    //     });

    //     if (point && distanceTreshold != undefined) {
    //         if (KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: point.x, y2: point.y }) > distanceTreshold) return undefined;
    //     }
    //     return point;
    // }

    // public getNearestPolygonPoint(pointer: Konva.Vector2d, distanceTreshold?: number): { point?: Konva.Vector2d, shape?: IMeasurableShape } {
    //     let nearestPointAndShape: { point?: Konva.Vector2d, shape?: IMeasurableShape } = {};
    //     for (const line of this.lines) {
    //         // TODO: must cache result!!!
    //         const currentNearestPont = line.extShape.getNearestPoint(pointer);
    //         if (!currentNearestPont) continue;

    //         const distanceToCurrent = KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: currentNearestPont.x, y2: currentNearestPont.y });
    //         const distanceToNearest = nearestPointAndShape.point ? KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: nearestPointAndShape.point.x, y2: nearestPointAndShape.point.y }) : Infinity;

    //         if (distanceToCurrent < distanceToNearest) {
    //             nearestPointAndShape.point = currentNearestPont;
    //             nearestPointAndShape.shape = line;
    //         }
    //     }

    //     if (nearestPointAndShape.point && distanceTreshold != undefined) {
    //         if (KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: nearestPointAndShape.point.x, y2: nearestPointAndShape.point.y }) > distanceTreshold) return {};
    //     }
    //     return nearestPointAndShape;
    // }

    // private computePoints() {
    //     if (this.computePointsRequired) {
    //         this.computedPoints = this.lines.flatMap(l => l.extShape.computeCurvePoints<Vector2d>());
    //         this.computePointsRequired = false;
    //     }
    // }

    // /*public findAttachedLines(line: Konva.Line): Konva.Line[] {
    //     const attachedLines: Konva.Line[] = [];
    //     const coords = KonvaUtils.lineToCoords(line);
    //     for (const mLine of this.lines) {
    //         if (!(mLine.extShape instanceof Konva.Line)) continue;
    //         const points = KonvaUtils.lineToCoords(mLine.extShape);
    //         if (points.x1 == coords.x1 && points.x2 == coords.x2 && points.y1 == coords.y1 && points.y2 == coords.y2) {
    //             attachedLines.push(mLine.extShape);
    //         }
    //     }
    //     return attachedLines;
    // }*/

    // public findShapesWithEndpoint(endpoint: Konva.Vector2d): IMeasurableShape[] {
    //     const attachedLines: IMeasurableShape[] = [];
    //     for (const mLine of this.lines) {
    //         const sEndpoints = mLine.getEndPoints();
    //         if ((sEndpoints[0].x == endpoint.x && sEndpoints[0].y == endpoint.y) || (sEndpoints[1].x == endpoint.x && sEndpoints[1].y == endpoint.y)) {
    //             attachedLines.push(mLine);
    //         }
    //     }
    //     return attachedLines;
    // }

    // public save(): IDieDataShapeDao[] {

    //     const dieDataShapeDao: IDieDataShapeDao[] = [];
    //     const orderedLines: IMeasurableShape[] = [];
    //     const allLinesCopy = [...this.lines]; // Create a copy to avoid modifying the original array
    //     const allCutsCopy = [...this.cuts]; // Create a copy to avoid modifying the original array
    //     let i = 0;

    //     // Order the lines so that it generates an array of contigous lines
    //     while (allLinesCopy.length > 0) {
    //         const currentLine = allLinesCopy[i];
    //         if (orderedLines.length === 0 || currentLine.hasCommonEndPointWith(orderedLines[orderedLines.length - 1])) {
    //             orderedLines.push(currentLine);
    //             allLinesCopy.splice(i, 1);
    //             i = 0;
    //         } else {
    //             i++;
    //         }
    //     }

    //     for (const line of orderedLines)
    //         dieDataShapeDao.push(line.extShape.toDieDataShape());
    //     for (const cut of allCutsCopy)
    //         dieDataShapeDao.push(cut.toDieDataShape());

    //     return dieDataShapeDao;
    // }

    // public clear() {
    //     this.lines.forEach(element => {
    //         element.destroy();
    //     });
    //     this.lines.splice(0, this.lines.length);

    //     this.cuts.forEach(element => {
    //         element.shape.destroy();
    //     });
    //     this.cuts.splice(0, this.cuts.length);
    // }

}