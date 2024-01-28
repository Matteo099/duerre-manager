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

export class DieEditorManager implements IDieEditor {

    private _stage!: Konva.Stage;
    private _layer!: Konva.Layer;
    private _gridLayer!: Konva.Layer;
    private _konvaHelper!: KonvaHelper;
    private _selectedTool?: Tool;

    private selectHandler!: SelectToolHandler;
    private drawHandler!: DrawToolHandler;
    private eraserHandler!: EraserToolHandler;
    private moveHandler!: MoveToolHandler;

    get stage(): Konva.Stage { return this._stage; }
    get layer(): Konva.Layer { return this._layer; }
    get gridSize(): number { return 10; }
    get zoomStep(): number { return 1; }
    get selectedTool(): Tool | undefined { return this._selectedTool; }

    private currentScale = 6;
    private scales = [5, 4, 3, 2.5, 2, 1.5, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]

    constructor(stageContainer: ElementRef) {
        this.createCanvas(stageContainer);
        this.createTools();
        this.setupListeners();
        this.drawGrid();

        this.addCircles();

        this.stage.add(this._gridLayer);
        this.stage.add(this.layer);
    }

    addCircles() {
        const circleData = [
            { x: 10, y: 10, radius: 5 },
            { x: 50, y: 50, radius: 3 },
            { x: 50, y: 100, radius: 3 },
            { x: 20, y: 40, radius: 3 },
        ];

        const circles = circleData.map(data => new Konva.Circle({
            x: data.x,
            y: data.y,
            radius: data.radius,
            stroke: '#ff0000',
            strokeWidth: 1,
            //draggable: true,
        }));

        circles.forEach(circle => this.layer.add(circle));
    }

    private createCanvas(stageContainer: ElementRef) {
        this._stage = new Konva.Stage({
            container: stageContainer.nativeElement,
            width: stageContainer.nativeElement.offsetWidth,
            height: stageContainer.nativeElement.offsetHeight,
            draggable: false
        });

        this._layer = new Konva.Layer();
        this._gridLayer = new Konva.Layer({ x: 0, y: 0, draggable: false });
    }

    private createTools() {
        this._konvaHelper = new KonvaHelper(this);
        this.selectHandler = new SelectToolHandler(this);
        this.drawHandler = new DrawToolHandler(this);
        this.eraserHandler = new EraserToolHandler(this);
        this.moveHandler = new MoveToolHandler(this);
    }

    private drawGrid() {
        this._gridLayer.clear();
        this._gridLayer.destroyChildren();
        this._gridLayer.clipWidth(); // clear any clipping

        const width = this._stage.width();
        const height = this._stage.height();
        const stepSize = 40;

        const stageRect = {
            x1: 0,
            y1: 0,
            x2: this._stage.width(),
            y2: this._stage.height(),
            offset: {
                x: this._konvaHelper.unScale(this._stage.position().x),
                y: this._konvaHelper.unScale(this._stage.position().y),
            }
        };
        // make a rect to describe the viewport
        const viewRect = {
            x1: -stageRect.offset.x,
            y1: -stageRect.offset.y,
            x2: this._konvaHelper.unScale(width) - stageRect.offset.x,
            y2: this._konvaHelper.unScale(height) - stageRect.offset.y
        };

        const gridOffset = {
            x: Math.ceil(this._konvaHelper.unScale(this.stage.position().x) / stepSize) * stepSize,
            y: Math.ceil(this._konvaHelper.unScale(this.stage.position().y) / stepSize) * stepSize,
        };
        const gridRect = {
            x1: -gridOffset.x,
            y1: -gridOffset.y,
            x2: this._konvaHelper.unScale(width) - gridOffset.x + stepSize,
            y2: this._konvaHelper.unScale(height) - gridOffset.y + stepSize
        };
        const gridFullRect = {
            x1: Math.min(stageRect.x1, gridRect.x1),
            y1: Math.min(stageRect.y1, gridRect.y1),
            x2: Math.max(stageRect.x2, gridRect.x2),
            y2: Math.max(stageRect.y2, gridRect.y2)
        };



        // set clip function to stop leaking lines into non-viewable space.
        this._gridLayer.clip({
            x: viewRect.x1,
            y: viewRect.y1,
            width: viewRect.x2 - viewRect.x1,
            height: viewRect.y2 - viewRect.y1
        });

        const
            // find the x & y size of the grid
            xSize = (gridFullRect.x2 - gridFullRect.x1),
            ySize = (gridFullRect.y2 - gridFullRect.y1),

            // compute the number of steps required on each axis.
            xSteps = Math.round(xSize / stepSize),
            ySteps = Math.round(ySize / stepSize);

        // draw vertical lines
        for (let i = 0; i <= xSteps; i++) {
            this._gridLayer.add(
                new Konva.Line({
                    x: gridFullRect.x1 + i * stepSize,
                    y: gridFullRect.y1,
                    points: [0, 0, 0, ySize],
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 1,
                })
            );
        }
        //draw Horizontal lines
        for (let i = 0; i <= ySteps; i++) {
            this._gridLayer.add(
                new Konva.Line({
                    x: gridFullRect.x1,
                    y: gridFullRect.y1 + i * stepSize,
                    points: [0, 0, xSize, 0],
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 1,
                })
            );
        }

        // Draw a border around the viewport
        this._gridLayer.add(
            new Konva.Rect({
                x: viewRect.x1 + 2,
                y: viewRect.y1 + 2,
                width: viewRect.x2 - viewRect.x1 - 4,
                height: viewRect.y2 - viewRect.y1 - 4,
                strokeWidth: 4,
                stroke: 'red'
            }))

        this._gridLayer.batchDraw();
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
        this.drawGrid();
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

    public getSnappedToGridPointer(): Konva.Vector2d {
        return this._konvaHelper.snapToGrid(this.stage.getRelativePointerPosition()!);
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

        this.drawGrid();
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
            this.currentScale = this.currentScale < this.scales.length - 1 ? this.currentScale + 1 : this.currentScale;
        }

        const newScale = this.scales[this.currentScale];

        this._stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        this._stage.position(newPos);
        this._stage.draw();
        this.drawGrid();
    }
}