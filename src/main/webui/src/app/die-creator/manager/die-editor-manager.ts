import { ElementRef } from "@angular/core";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { DieDataDao } from "../../models/dao/die-data-dao";
import { DieDataShapeDao } from "../../models/dao/die-data-shape-dao";
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
import { GRID_ELEMENT } from "./constants";
import { KonvaEditableText } from "./shape-ext/konva-editable-text";

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
    }

    private handleMouseMove(event: KonvaEventObject<any>) {
        this._selectedToolHandler?.onMouseMove(event);
    }

    private handleMouseUp(event: KonvaEventObject<any>) {
        this._selectedToolHandler?.onMouseUp(event);
        this.guidlinesManager.onDragEnd(event);
    }


    public getSnappedToNearObject(points?: Konva.Vector2d[]): { v: Konva.Vector2d, obj: "grid" | "vertex" } {
        const pointer = this.stage.getRelativePointerPosition()!;

        // find nearest grid point
        const gridPoint = this.gridManager.snapToGrid(pointer);
        let nearestPoint = gridPoint;

        if (points) {
            // find nearest point
            points.push(gridPoint)
            nearestPoint = points.reduce((nearest: Konva.Vector2d, current: Konva.Vector2d) => {
                const distanceToCurrent = KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: current.x, y2: current.y });
                const distanceToNearest = nearest ? KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: nearest.x, y2: nearest.y }) : Infinity;

                return distanceToCurrent < distanceToNearest ? current : nearest;
            });
        }

        return {
            v: nearestPoint,
            obj: nearestPoint == gridPoint ? "grid" : "vertex"
        };
    }

    /*
    public getSnappedToNearObject(useEndpoint?: boolean | any): { v: Konva.Vector2d, obj: "grid" | "vertex" } {
        const pointer = this.stage.getRelativePointerPosition()!;

        let pointFrom: 'grid' | 'vertex' = 'grid';
        // find nearest grid point
        const gridPoint = this.gridManager.snapToGrid(pointer);
        let nearestPoint = gridPoint;

        const endpoints: (Konva.Vector2d & { source: 'grid' | 'vertex' })[] = this.state.getEndPoints().map(v => { return { ...v, source: 'vertex' } });
        const points: (Konva.Vector2d & { source: 'grid' | 'vertex' })[] = [
            { ...gridPoint, source: 'grid' },
            ...endpoints
        ];
        const vertex = this.state.getVertices();
        if (vertex) {
            let nearX = Infinity;
            let nearY = Infinity;
            let vX = 0;
            let vY = 0;
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

            points.push({ x: vX, y: pointer.y, source: 'grid' });
            points.push({ x: pointer.x, y: vY, source: 'grid' });
            if (vertex.find(v => v.x == vX && v.y == vY) == undefined) {
                points.push({ x: vX, y: vY, source: 'grid' });
            }
        }

        if (useEndpoint) {
            nearestPoint = points.reduce((nearest: Konva.Vector2d & { source: 'grid' | 'vertex' }, current: Konva.Vector2d & { source: 'grid' | 'vertex' }) => {
                const distanceToCurrent = KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: current.x, y2: current.y });
                const distanceToNearest = nearest ? KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: nearest.x, y2: nearest.y }) : Infinity;

                return distanceToCurrent < distanceToNearest ? current : nearest;
            });
            if (nearestPoint.x != gridPoint.x && nearestPoint.y != gridPoint.y) pointFrom = 'vertex';
        }

        // if (nearHPoint && nearVPoint) {
        //     let nestedNearestPoint = { x: nearestPoint.x, y: nearestPoint.y };

        //     const distanceToH = KonvaUtils.calculateDistance({ x1: nearHPoint.x, y1: pointer.y, x2: nearestPoint.x, y2: nearestPoint.y });
        //     const distanceToV = KonvaUtils.calculateDistance({ x1: pointer.x, y1: nearVPoint.y, x2: nearestPoint.x, y2: nearestPoint.y });
        //     const distanceToHV = nearHVPoint ? KonvaUtils.calculateDistance({ x1: nearHVPoint.x, y1: nearHVPoint.y, x2: nearestPoint.x, y2: nearestPoint.y }) : Infinity;
        //     const distanceToNear = KonvaUtils.calculateDistance({ x1: pointer.x, y1: pointer.y, x2: nearestPoint.x, y2: nearestPoint.y });

        //     let minDistance = distanceToH;

        //     if (distanceToV < minDistance) {
        //         minDistance = distanceToV;
        //     }

        //     if (distanceToHV < minDistance) {
        //         minDistance = distanceToHV;
        //     }

        //     if (distanceToNear < minDistance) {
        //         minDistance = distanceToNear;
        //     }

        //     if (minDistance === distanceToH) {
        //         nestedNearestPoint = { x: nearHPoint.x, y: nearestPoint.y };
        //     } else if (minDistance === distanceToV) {
        //         nestedNearestPoint = { x: nearestPoint.x, y: nearVPoint.y };
        //     } else if (nearHVPoint != undefined && minDistance === distanceToHV) {
        //         nestedNearestPoint = { x: nearHVPoint.x, y: nearHVPoint.y };
        //     }

        //     if (nestedNearestPoint.x != nearestPoint.x && nestedNearestPoint.y != nearestPoint.y) pointFrom = 'grid';
        //     nearestPoint = nestedNearestPoint;
        // }

        console.log(pointFrom);

        return {
            v: nearestPoint,
            obj: pointFrom
        };
    }*/

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