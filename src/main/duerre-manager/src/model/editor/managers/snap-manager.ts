import type Konva from "konva";
import { Vec2DZero, vec2DDistance, vec2DEquals, type Vec2D } from "../core/math/vec2d";
import { GenericManager } from "./generic-manager";
import { GridManager } from "./grid-manager";
import { EManager } from "./emanager";
import type { EditorOrchestrator } from "../editor-orchestrator";
import { StateManager } from "./state-manager";

export interface SnapConfig {
    useEndpoints: boolean;
    pointer?: Konva.Vector2d;
}

export class SnapManager extends GenericManager {
    
    private lastPointerPosition: Vec2D = Vec2DZero;
    private stage!: Konva.Stage;

    private gridManager!: GridManager;
    private stateManager!: StateManager;

    constructor(editor: EditorOrchestrator) {
        super(editor, EManager.SNAP);
    }

    public setup(): void {
        this.stage = this.editor.stage
        this.gridManager = this.editor.getManager(GridManager)!;
        this.stateManager = this.editor.getManager(StateManager)!;
    }

    public clear(): void {
    }
    
    public destroy(): void {
    }

    public getSnapToNearest(config?: SnapConfig): Vec2D {
        // get the mouse position
        const pointer = config?.pointer ?? this.stage.getRelativePointerPosition();
        if (!pointer) return this.lastPointerPosition;

        const points: Vec2D[] = [];

        // find nearest grid point => push to points array
        const gridPoint: Vec2D = { ...this.gridManager.snapToGrid(pointer), source: 'grid' };
        points.push(gridPoint);

        if (config?.useEndpoints) {
            // get the shape endpoints => push to points array
            const endpoints: Vec2D[] = this.stateManager.getEndpoints().map(v => { return { ...v, source: 'vertex' } });
            points.push(...endpoints);
        }

        // find the nearest point (grid & endpoints)
        let nearestPoint = this.findNearestPoint(pointer, points);

        // find nearest Horizontal, Vertical and VH points
        const vhPoints = this.getVHPoints(pointer);
        vhPoints.forEach(v => {
            if (v.orientation == 'H') v.y = nearestPoint.y;
            else if (v.orientation == 'V') v.x = nearestPoint.x;
        });

        // remove all points that are vertex excluding the endpoints => push to points array
        points.splice(0, points.length);
        const tmpPoints = [nearestPoint, ...vhPoints];
        const vertexExceptEndpoints = this.stateManager.getVerticesExceptEndpoints();
        for (let i = 0; i < tmpPoints.length; i++) {
            const vertex = tmpPoints[i];
            if (!vertexExceptEndpoints.find(v => vec2DEquals(v, vertex))) {
                points.push(vertex);
            }
        }

        // find the nearest point (in the points array) to the pointer
        this.lastPointerPosition = this.findNearestPoint(pointer, points);
        return this.lastPointerPosition;
    }

    private findNearestPoint(pointer: Konva.Vector2d, points: Vec2D[]): Vec2D {
        if (points.length == 0) return this.lastPointerPosition;
        return points.reduce((nearest: Konva.Vector2d & { source: 'grid' | 'vertex' }, current: Konva.Vector2d & { source: 'grid' | 'vertex' }) => {
            const distanceToCurrent = vec2DDistance(pointer, current);
            const distanceToNearest = nearest ? vec2DDistance(pointer, nearest) : Infinity;

            if (distanceToCurrent == distanceToNearest)
                return current.source == 'vertex' ? current : nearest;
            return distanceToCurrent < distanceToNearest ? current : nearest;
        });
    }

    private getVHPoints(pointer: Konva.Vector2d): (Vec2D & { orientation: 'H' | 'V' | 'HV' })[] {
        const points: (Vec2D & { orientation: 'H' | 'V' | 'HV' })[] = [];
        const vertex = this.stateManager.getVertices();
        let nearX = Infinity,
            nearY = Infinity,
            vX = 0,
            vY = 0;
        vertex.forEach(v => {
            if (Math.abs(v.x - pointer.x) < nearX) {
                nearX = Math.abs(v.x - pointer.x);
                vX = v.x;
            }
            if (Math.abs(v.y - pointer.y) < nearY) {
                nearY = Math.abs(v.y - pointer.y);
                vY = v.y;
            }
        });
        points.push({ x: vX, y: pointer.y, source: 'grid', orientation: 'H' });
        points.push({ x: pointer.x, y: vY, source: 'grid', orientation: 'V' });
        points.push({ x: vX, y: vY, source: 'grid', orientation: 'HV' });
        return points;
    }
}