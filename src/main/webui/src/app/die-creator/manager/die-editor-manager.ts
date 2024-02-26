import { ElementRef } from "@angular/core";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { DieDataDao } from "../../models/dao/die-data-dao";
import { DieDataShapeDao } from "../../models/dao/die-data-shape-dao";
import { GRID_ELEMENT } from "./constants";
import { DieState } from "./die-state";
import { IDieEditor } from "./idie-editor";
import { KonvaHelper } from "./konva-helper";
import { KonvaUtils } from "./konva-utils";
import { GridManager } from "./managers/grid-manager";
import { GuidelinesManager } from "./managers/guidelines-manager";
import { UnscaleManager } from "./managers/unscale-manager";
import { ZoomManager } from "./managers/zoom-manager";
import { BezierLineExt } from "./shape-ext/bezier-line-ext";
import { ExtendedShape } from "./shape-ext/extended-shape";
import { LineExt } from "./shape-ext/line-ext";
import { MeasurableShape } from "./shape-ext/measurable-shape";
import { DrawToolHandler } from "./tools/draw-tool-handler";
import { EditToolHandler } from "./tools/edit-tool-handler";
import { EraserToolHandler } from "./tools/eraser-tool-handler";
import { MoveToolHandler } from "./tools/move-tool-handler";
import { Tool } from "./tools/tool";
import { ToolHandler } from "./tools/tool-handler";

export interface ExtVector2d extends Konva.Vector2d {
    source: 'grid' | 'vertex';
}
export const DefaultExtVector2d: ExtVector2d = { x: 0, y: 0, source: 'grid' };
export interface SnapConfig {
    useEndpoints: boolean;
}

export class DieEditorManager implements IDieEditor {

    private _stage!: Konva.Stage;
    private _layer!: Konva.Layer;
    private _konvaHelper!: KonvaHelper;
    private _selectedTool?: Tool;
    private _state!: DieState;
    private _selectedToolHandler?: ToolHandler;

    private editHandler!: EditToolHandler;
    private drawHandler!: DrawToolHandler;
    private eraserHandler!: EraserToolHandler;
    private moveHandler!: MoveToolHandler;
    private zoomManager!: ZoomManager;
    private gridManager!: GridManager;
    private unscaleManager!: UnscaleManager;
    private guidlinesManager!: GuidelinesManager;


    public get stage(): Konva.Stage { return this._stage; }
    public get layer(): Konva.Layer { return this._layer; }
    public get gridSize(): number { return 10; }
    public get zoomStep(): number { return 1; }
    public get selectedTool(): Tool | undefined { return this._selectedTool; }
    public get state(): DieState { return this._state; }
    public get helper(): KonvaHelper { return this._konvaHelper; }


    constructor(stageContainer: ElementRef) {
        this.createCanvas(stageContainer);
        this.createState();
        this.createTools();
        this.setupListeners();
        this.createManagers();

        this._state = new DieState();
        this.stage.add(this.layer);
    }

    private createCanvas(stageContainer: ElementRef) {
        this._stage = new Konva.Stage({
            container: stageContainer.nativeElement,
            width: stageContainer.nativeElement.offsetWidth,
            height: stageContainer.nativeElement.offsetHeight,
            draggable: false
        });

        this._layer = new Konva.Layer();
    }

    private createState() {
        this._state = new DieState();
        // this._layer.add(this._state.polygon);
    }

    private createTools() {
        this._konvaHelper = new KonvaHelper(this);
        this.editHandler = new EditToolHandler(this);
        this.drawHandler = new DrawToolHandler(this);
        this.eraserHandler = new EraserToolHandler(this);
        this.moveHandler = new MoveToolHandler(this);
    }

    private createManagers() {
        this.guidlinesManager = new GuidelinesManager(this);
        this.zoomManager = new ZoomManager(this);
        this.unscaleManager = new UnscaleManager(this, this.zoomManager);
        this.gridManager = new GridManager(this);
        this.gridManager.draw();
    }

    private setupListeners() {
        this._stage.on('wheel', (event) => this.handleWheel(event));
        this._stage.on('dragend', (event) => this.handleDragend(event));
        this._stage.on('mousedown touchstart', (event) => this.handleMouseDown(event));
        this._stage.on('mouseup touchend', (event) => this.handleMouseUp(event));
        this._stage.on('mousemove touchmove', (event) => this.handleMouseMove(event));
    }

    private handleWheel(event: KonvaEventObject<WheelEvent>) {
        this.zoom({ event });
    }

    private handleDragend(event: KonvaEventObject<DragEvent>) {
        this.gridManager.draw();
    }

    private handleMouseDown(event: KonvaEventObject<any>) {
        this._selectedToolHandler?.onMouseDown(event);
        this.guidlinesManager.onMouseDown(event);
    }

    private handleMouseMove(event: KonvaEventObject<any>) {
        this._selectedToolHandler?.onMouseMove(event);
        this.guidlinesManager.onMouseMove(event);
    }

    private handleMouseUp(event: KonvaEventObject<any>) {
        this._selectedToolHandler?.onMouseUp(event);
        this.guidlinesManager.onMouseUp(event);
    }

    public getSnapToNearest(config?: SnapConfig): ExtVector2d {
        // get the mouse position
        const pointer = this.stage.getRelativePointerPosition();
        if (!pointer) return DefaultExtVector2d;

        const points: ExtVector2d[] = [];

        // find nearest grid point => push to points array
        const gridPoint: ExtVector2d = { ...this.gridManager.snapToGrid(pointer), source: 'grid' };
        points.push(gridPoint);

        if (config?.useEndpoints) {
            // get the shape endpoints => push to points array
            const endpoints: ExtVector2d[] = this.state.getEndPoints().map(v => { return { ...v, source: 'vertex' } });
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
        const vertexExceptEndpoints = this.state.getVerticesExceptEndpoints();
        for (let i = 0; i < tmpPoints.length; i++) {
            const vertex = tmpPoints[i];
            if (!vertexExceptEndpoints.find(v => KonvaUtils.v2Equals(v, vertex))) {
                points.push(vertex);
            }
        }

        // find the nearest point (in the points array) to the pointer
        return this.findNearestPoint(pointer, points);
    }

    private findNearestPoint(pointer: Konva.Vector2d, points: ExtVector2d[]): ExtVector2d {
        if (points.length == 0) return DefaultExtVector2d;
        return points.reduce((nearest: Konva.Vector2d & { source: 'grid' | 'vertex' }, current: Konva.Vector2d & { source: 'grid' | 'vertex' }) => {
            const distanceToCurrent = KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: current.x, y2: current.y });
            const distanceToNearest = nearest ? KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: nearest.x, y2: nearest.y }) : Infinity;

            if (distanceToCurrent == distanceToNearest)
                return current.source == 'vertex' ? current : nearest;
            return distanceToCurrent < distanceToNearest ? current : nearest;
        });
    }

    private getVHPoints(pointer: Konva.Vector2d): (ExtVector2d & { orientation: 'H' | 'V' | 'HV' })[] {
        const points: (ExtVector2d & { orientation: 'H' | 'V' | 'HV' })[] = [];
        const vertex = this.state.getVertices();
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

    public useTool(tool: Tool) {
        this._selectedTool = tool;

        this._selectedToolHandler?.onToolDeselected();
        switch (tool) {
            case Tool.EDIT:
                this._selectedToolHandler = this.editHandler;
                break;
            case Tool.DRAW_LINE:
            case Tool.DRAW_CURVE:
                this._selectedToolHandler = this.drawHandler;
                break;
            case Tool.ERASER:
                this._selectedToolHandler = this.eraserHandler;
                break;
            case Tool.MOVE:
                this._selectedToolHandler = this.moveHandler;
                break;
            default:
                this._selectedToolHandler = undefined;
                break;
        }
        this._selectedToolHandler?.onToolSelected();
    }

    public resize(stageContainer: ElementRef) {
        // Set canvas size to match the outer div size
        const fullWidth = stageContainer.nativeElement.offsetWidth;
        const fullHeight = stageContainer.nativeElement.offsetHeight;

        this._stage.width(fullWidth);
        this._stage.height(fullHeight);

        this.gridManager.draw();
    }

    public zoomIn() {
        this.zoom({ direction: 1 });
    }

    public zoomOut() {
        this.zoom({ direction: -1 });
    }

    private zoom(opts: { direction?: number, event?: KonvaEventObject<any> }) {
        this.zoomManager.zoom(opts);
        this.gridManager.draw();
        this.unscaleManager.update();

        // this.getAllChildren().filter(c => c.getAttr(UNSCALE_OBJECT)).forEach(c => {
        //     if (c.getAttr(DEFAULT_STROKE) != undefined) {
        //         const defaultStrokeWidth = c.getAttr(DEFAULT_STROKE);
        //         (c as any).strokeWidth(defaultStrokeWidth / this.zoomManager.currentScale)
        //     }
        //     if (c.getAttr(DEFAULT_RADIUS) != undefined) {
        //         const defaultRadius = c.getAttr(DEFAULT_RADIUS);
        //         (c as any).radius(defaultRadius / this.zoomManager.currentScale)
        //     }
        //     if (c.getAttr(DEFAULT_FONTSIZE) != undefined) {
        //         const defaultFontSize = c.getAttr(DEFAULT_FONTSIZE);
        //         (c as any).fontSize(defaultFontSize / this.zoomManager.currentScale)
        //     }
        // });
    }

    public clear() {
        this.state.clear();
        this.editHandler.clear();
        this.drawHandler.clear();
        this.eraserHandler.clear();

        this.unscaleManager.unregisterObjectsIf(o => !o.getAttr(GRID_ELEMENT));
    }

    public setData(data: DieDataDao) {
        this.clear();
        data.state.forEach(s => {
            const drawingLine = new MeasurableShape<any>(this, { x: 0, y: 0 }, s.type == 'line' ? LineExt : BezierLineExt);
            drawingLine.updatePoints(s.points);
            this.layer.add(drawingLine.group);
            this.state.addLine(drawingLine);
        });
    }

    public getData(): DieDataDao | undefined {
        const state = this.state.save();
        const valid = this.state.isPolygonCreated();
        return { state, valid }
    }

    public destroy(): void {
        this.editHandler.destroy();
        this.drawHandler.destroy();
        this.eraserHandler.destroy();
        this.moveHandler.destroy();
        this.gridManager.destroy();
        this.layer.destroy();
        this.stage.destroy();
    }

    public exportImage(width: number = 300, height: number = 300, border: number = 10): string {
        const container = document.createElement("div");
        container.style.display = "none";
        const crpStage = new Konva.Stage({
            container,
            width,
            height
        });
        const crpLayer = new Konva.Layer();
        crpStage.add(crpLayer);

        const dieState: DieDataShapeDao[] = this.state.save();
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        const shapes: MeasurableShape<ExtendedShape<any>>[] = [];
        dieState.forEach(s => {
            const drawingLine = new MeasurableShape<ExtendedShape<any>>(this, { x: 0, y: 0 }, s.type == 'line' ? LineExt : BezierLineExt);
            drawingLine.updatePoints(s.points);
            shapes.push(drawingLine);
            const shape: Konva.Shape = drawingLine.extShape.shape;
            crpLayer.add(shape);

            const rect = drawingLine.extShape.calculateClientRect();
            console.log(rect);
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        });

        // Shift all shapes to the top-left side and scale to fit the canvas
        const scaleX = (width - border) / (maxX - minX);
        const scaleY = (height - border) / (maxY - minY);
        const scaleFactor = Math.min(scaleX, scaleY);
        const tempMinX = minX;
        const tempMinY = minY;
        minX = Infinity;
        minY = Infinity;
        maxX = -Infinity;
        maxY = -Infinity;
        shapes.forEach(s => {
            console.log(s.extShape.getPoints());
            let i = 0;
            const points = s.extShape.getPoints().map(e => {
                if (i++ % 2 == 0) return (e - tempMinX) * scaleFactor;
                return (e - tempMinY) * scaleFactor;
            });
            s.extShape.setPoints(points);
            console.log(points);

            const rect = s.extShape.calculateClientRect();
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        });

        // Center in the canvas
        const translateX = (width - (maxX - minX)) / 2;
        const translateY = (height - (maxY - minY)) / 2;
        crpLayer.children.forEach(shape => {
            shape.x(shape.x() + translateX);
            shape.y(shape.y() + translateY);
        });

        const dataURL = crpStage.toDataURL();
        container.remove();
        return dataURL;
    }

    public getAllChildren(): Konva.Node[] {
        const recursiveSearch = function (node: Konva.Node): Konva.Node[] {
            const nodeChildren: Konva.Node[] = [];
            if (node.hasChildren()) {
                const nestedChildren: Konva.Node[] = (node as any).children;
                for (const nestedNode of nestedChildren) {
                    nodeChildren.push(...recursiveSearch(nestedNode));
                }
            } else {
                nodeChildren.push(node);
            }
            return nodeChildren;
        }
        const children: Konva.Node[] = [];
        this._stage.children.forEach(layer => {
            layer.children.forEach(o => children.push(...recursiveSearch(o)));
        });
        return children;
    }
}