import Konva from "konva";
import type { Ref } from "vue";
import { GRID_ELEMENT } from "./constants";
import { DieState } from "./die-state";
import { DefaultExtVector2d, type ExtVector2d, type IDieEditor, type SnapConfig } from "./idie-editor";
import { KonvaHelper } from "./konva-helper";
import { KonvaUtils } from "./konva-utils";
import { GridManager } from "./managers/grid-manager";
import { GuidelinesManager } from "./managers/guidelines-manager";
import { UnscaleManager } from "./managers/unscale-manager";
import { ZoomManager } from "./managers/zoom-manager";
import type { IDieDataDao } from "./models/idie-data-dao";
import type { IDieDataShapeDao } from "./models/idie-data-shape-dao";
import { BezierLineExt } from "./shape-ext/bezier-line-ext";
import { ExtendedShape } from "./shape-ext/extended-shape";
import { LineExt } from "./shape-ext/line-ext";
import { MeasurableShape } from "./shape-ext/measurable-shape";
import { CutToolHandler } from "./tools/cut-tool-handler";
import { DrawToolHandler } from "./tools/draw-tool-handler";
import { EditToolHandler } from "./tools/edit-tool-handler";
import { EraserToolHandler } from "./tools/eraser-tool-handler";
import { MoveToolHandler } from "./tools/move-tool-handler";
import { Tool } from "./tools/tool";
import { ToolHandler } from "./tools/tool-handler";

export class DieEditorManager implements IDieEditor {

    private _stage!: Konva.Stage;
    private _layer!: Konva.Layer;
    private _konvaHelper!: KonvaHelper;
    private _selectedTool?: Tool;
    private _state!: DieState;
    private _selectedToolHandler?: ToolHandler;

    private editHandler!: EditToolHandler;
    private drawHandler!: DrawToolHandler;
    private cutHandler!: CutToolHandler;
    private eraserHandler!: EraserToolHandler;
    private moveHandler!: MoveToolHandler;
    private _zoomManager!: ZoomManager;
    private gridManager!: GridManager;
    private unscaleManager!: UnscaleManager;
    private _guidlinesManager!: GuidelinesManager;
    private useToolCbk?: () => void;


    public get stage(): Konva.Stage { return this._stage; }
    public get layer(): Konva.Layer { return this._layer; }
    public get selectedTool(): Tool | undefined { return this._selectedTool; }
    public get state(): DieState { return this._state; }
    public get helper(): KonvaHelper { return this._konvaHelper; }
    public get guidelinesManager(): GuidelinesManager { return this._guidlinesManager; }
    public get zoomManager(): ZoomManager { return this._zoomManager; }


    constructor(stageContainer: Ref<HTMLDivElement>) {
        this.createCanvas(stageContainer);
        this.createState();
        this.createTools();
        this.setupListeners();
        this.createManagers();

        this._state = new DieState();
        this.stage.add(this.layer);
        this.zoom({});
    }

    public onUseTool(useToolCbk: () => void) {
        this.useToolCbk = useToolCbk;
    }

    private createCanvas(stageContainer: Ref<HTMLDivElement>) {
        this._stage = new Konva.Stage({
            container: stageContainer.value,
            width: stageContainer.value.offsetWidth,
            height: stageContainer.value.offsetHeight,
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
        this.cutHandler = new CutToolHandler(this);
        this.eraserHandler = new EraserToolHandler(this);
        this.moveHandler = new MoveToolHandler(this);
    }

    private createManagers() {
        this._guidlinesManager = new GuidelinesManager(this);
        this._zoomManager = new ZoomManager(this);
        this.unscaleManager = UnscaleManager.getInstance();
        this.unscaleManager.registerEditor(this, this._zoomManager);
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

    private handleWheel(event: Konva.KonvaEventObject<WheelEvent>) {
        this.zoom({ event });
    }

    private handleDragend(event: Konva.KonvaEventObject<DragEvent>) {
        this.gridManager.draw();
    }

    private handleMouseDown(event: Konva.KonvaEventObject<any>) {
        this._selectedToolHandler?.onMouseDown(event);
    }

    private handleMouseMove(event: Konva.KonvaEventObject<any>) {
        this._selectedToolHandler?.onMouseMove(event);
    }

    private handleMouseUp(event: Konva.KonvaEventObject<any>) {
        this._selectedToolHandler?.onMouseUp(event);
    }

    private lastPointerPosition: ExtVector2d = DefaultExtVector2d;
    public getSnapToNearest(config?: SnapConfig): ExtVector2d {
        // get the mouse position
        const pointer = config?.pointer ?? this.stage.getRelativePointerPosition();
        if (!pointer) return this.lastPointerPosition;

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
        this.lastPointerPosition = this.findNearestPoint(pointer, points);
        return this.lastPointerPosition;
    }

    private findNearestPoint(pointer: Konva.Vector2d, points: ExtVector2d[]): ExtVector2d {
        if (points.length == 0) return this.lastPointerPosition;
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

    public useTool(tool?: Tool): { value: boolean, message?: string } {
        const canUse = this.canUseTool(tool);
        if(!canUse.value) return canUse;

        this._selectedTool = tool;
        this.useToolCbk?.();

        this._selectedToolHandler?.onToolDeselected();
        this._selectedToolHandler = this.getToolHandler(tool);

        // if the tool cannot be selected deselect the tool
        if (this._selectedToolHandler?.onToolSelected() == true) {
            return { value: true };
        } else {
            this.useTool();
            return { value: false };
        }
    }

    public canUseTool(tool?: Tool): { value: boolean, message?: string } {
        if (tool == undefined) return { value: false };

        return this.getToolHandler(tool)?.selectionConditionsSatisfied() ?? { value: false };
    }

    private getToolHandler(tool?: Tool): ToolHandler | undefined {
        switch (tool) {
            case Tool.EDIT:
                return this.editHandler;
            case Tool.DRAW_LINE:
            case Tool.DRAW_CURVE:
                return this.drawHandler;
            case Tool.ERASER:
                return this.eraserHandler;
            case Tool.MOVE:
                return this.moveHandler;
            case Tool.CUT:
                return this.cutHandler;
            default:
                return undefined;
        }
    }

    public resize(stageContainer: Ref<HTMLDivElement>) {
        // Set canvas size to match the outer div size
        const fullWidth = stageContainer.value.offsetWidth;
        const fullHeight = stageContainer.value.offsetHeight;

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

    private zoom(opts: { direction?: number, event?: Konva.KonvaEventObject<any> }) {
        this._zoomManager.zoom(opts);
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

    public setData(data: IDieDataDao) {
        this.clear();
        data.state.forEach(s => {
            const drawingLine = new MeasurableShape<any>(this, { x: 0, y: 0 }, s.type == 'line' ? LineExt : BezierLineExt);
            drawingLine.updatePoints(s.points);
            this.layer.add(drawingLine.group);
            this.state.addLine(drawingLine);
        });
    }

    public getData(): IDieDataDao | undefined {
        const state = this.state.save();
        if (state.length == 0) {
            return undefined;
        }

        const valid = this.state.isPolygonCreated();
        return { state, valid }
    }

    public destroy(): void {
        this.editHandler.destroy();
        this.drawHandler.destroy();
        this.eraserHandler.destroy();
        this.moveHandler.destroy();
        this.gridManager.destroy();
        this.unscaleManager.unregisterEditor();
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

        const dieState: IDieDataShapeDao[] = this.state.save();
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