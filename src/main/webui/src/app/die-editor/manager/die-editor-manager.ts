import { ElementRef } from "@angular/core";
import { DrawToolHandler } from "./draw-tool-handler";
import { EraserToolHandler } from "./eraser-tool-handler";
import { IDieEditor } from "./idie-editor";
import { MoveToolHandler } from "./move-tool-handler";
import { SelectToolHandler } from "./select-tool-handler";
import { Tool } from "./tool";
import { ToolHandler } from "./tool-handler";
import Konva from "konva";
import { KonvaHelper } from "./konva-helper";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { KonvaUtils } from "./konva-utils";
import { DieState } from "./die-state";
import { GridManager } from "./grid-manager";

export class DieEditorManager implements IDieEditor {

    public static readonly SCALES = [5, 4, 3, 2.5, 2, 1.5, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]

    private _stage!: Konva.Stage;
    private _layer!: Konva.Layer;
    private _konvaHelper!: KonvaHelper;
    private _selectedTool?: Tool;
    private _state!: DieState;

    private selectHandler!: SelectToolHandler;
    private drawHandler!: DrawToolHandler;
    private eraserHandler!: EraserToolHandler;
    private moveHandler!: MoveToolHandler;
    private gridManager!: GridManager;

    private currentScale = 6;

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
        this.createGrid();

        this._state = new DieState();
        this.stage.add(this.layer);
    }

    // addCircles() {
    //     const circleData = [
    //         { x: 10, y: 10, radius: 5 },
    //         { x: 50, y: 50, radius: 3 },
    //         { x: 50, y: 100, radius: 3 },
    //         { x: 20, y: 40, radius: 3 },
    //     ];

    //     const circles = circleData.map(data => new Konva.Circle({
    //         x: data.x,
    //         y: data.y,
    //         radius: data.radius,
    //         stroke: '#ff0000',
    //         strokeWidth: 1,
    //         //draggable: true,
    //     }));

    //     circles.forEach(circle => this.layer.add(circle));
    // }

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
        this._layer.add(this._state.polygon);
    }

    private createTools() {
        this._konvaHelper = new KonvaHelper(this);
        this.selectHandler = new SelectToolHandler(this);
        this.drawHandler = new DrawToolHandler(this);
        this.eraserHandler = new EraserToolHandler(this);
        this.moveHandler = new MoveToolHandler(this);
    }

    private createGrid() {
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
        this.getToolHandler()?.onMouseDown(event);
    }

    private handleMouseMove(event: KonvaEventObject<any>) {
        this.getToolHandler()?.onMouseMove(event);
    }

    private handleMouseUp(event: KonvaEventObject<any>) {
        this.getToolHandler()?.onMouseUp(event);
    }

    private getToolHandler(): ToolHandler | undefined {
        switch (this._selectedTool) {
            case Tool.SELECT:
                return this.selectHandler;
            case Tool.DRAW:
                return this.drawHandler;
            case Tool.ERASER:
                return this.eraserHandler;
            case Tool.MOVE:
                return this.moveHandler;
            default:
                return undefined;
        }
    }

    public getSnappedToNearObject(points?: Konva.Vector2d[]): { v: Konva.Vector2d, obj: "grid" | "vertex" } {
        const pointer = this.stage.getRelativePointerPosition()!;

        // find nearest grid point
        const gridPoint = KonvaUtils.snapToGrid(pointer);
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

    public useTool(tool: Tool) {
        this.getToolHandler()?.onToolDeselected();
        this._selectedTool = tool;
        this.getToolHandler()?.onToolSelected();
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
        // stop default scrolling
        opts.event?.evt.preventDefault();

        const oldScale = this._stage.scaleX();
        const pointer = this._stage.getPointerPosition()!;

        const mousePointTo = {
            x: (pointer.x - this._stage.x()) / oldScale,
            y: (pointer.y - this._stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = opts.direction === undefined ? (opts.event?.evt.deltaY > 0 ? 1 : -1) : opts.direction;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (opts.event?.evt.ctrlKey) {
            direction = -direction;
        }

        if (direction > 0) {
            this.currentScale = this.currentScale > 0 ? this.currentScale - 1 : this.currentScale;
        }
        else {
            this.currentScale = this.currentScale < DieEditorManager.SCALES.length - 1 ? this.currentScale + 1 : this.currentScale;
        }

        const newScale = DieEditorManager.SCALES[this.currentScale];

        this._stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        this._stage.position(newPos);
        this._stage.draw();
        this.gridManager.draw();
    }
}