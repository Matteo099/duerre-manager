import Konva from "konva";
import type { Ref } from "vue";
import { EManager } from "./managers/emanager";
import { EventManager } from "./managers/event-manager";
import type { GenericManager } from "./managers/generic-manager";
import { GridManager } from "./managers/grid-manager";
import type { GenericToolHandler } from "./tools/generic-tool-handler";
import { UndoRedoManager } from "./managers/undo-redo-manager";
import { UnscaleManager } from "./managers/unscale-manager";
import { ZoomManager } from "./managers/zoom-manager";
import { GuidelinesManager } from "./managers/guidelines-manager";
import { LiteEvent } from "./core/event/lite-event";
import type { ILiteEvent } from "./core/event/ilite-event";
import { Tool } from "./tools/tool";
import { EditToolHandler } from "./tools/edit-tool-handler";
import { DrawToolHandler } from "./tools/draw-tool-handler";
import { EraserToolHandler } from "./tools/eraser-tool-handler";
import { MoveToolHandler } from "./tools/move-tool-handler";
import { CutToolHandler } from "./tools/cut-tool-handler";
import { StateManager } from "./managers/state-manager";
import { SnapManager } from "./managers/snap-manager";

export class EditorOrchestrator {

    private static _instance: EditorOrchestrator;
    public static get instance(): EditorOrchestrator { return this._instance; }

    private _stage!: Konva.Stage;
    private _layer!: Konva.Layer;
    private _selectedTool?: Tool;
    private readonly onBeforeSwitchTool = new LiteEvent<void>();
    private readonly onAfterSwitchTool = new LiteEvent<void>();

    private tools: Map<Tool, GenericToolHandler> = new Map();
    private managers: GenericManager[] = [];

    public get BeforeSwitchTool(): ILiteEvent<void> {
        return this.onBeforeSwitchTool.expose();
    }
    public get AfterSwitchTool(): ILiteEvent<void> {
        return this.onAfterSwitchTool.expose();
    }
    public get stage(): Konva.Stage { return this._stage; }
    public get layer(): Konva.Layer { return this._layer; }
    public get selectedTool(): Tool | undefined { return this._selectedTool; }

    constructor(stageContainer: Ref<HTMLDivElement>) {
        EditorOrchestrator._instance = this;
        this.createCanvas(stageContainer);
        this.createTools();
        this.createManagers();

        this.setup();
    }

    private createCanvas(stageContainer: Ref<HTMLDivElement>) {
        this._stage = new Konva.Stage({
            container: stageContainer.value,
            width: stageContainer.value.offsetWidth,
            height: stageContainer.value.offsetHeight,
            draggable: false
        });

        this._layer = new Konva.Layer();
        this.stage.add(this.layer);
    }

    private createTools() {
        this.tools.set(Tool.EDIT, new EditToolHandler(this))
        this.tools.set(Tool.DRAW_LINE, new DrawToolHandler(this))
        this.tools.set(Tool.DRAW_CURVE, this.tools.get(Tool.DRAW_LINE)!)
        this.tools.set(Tool.ERASER, new EraserToolHandler(this))
        this.tools.set(Tool.MOVE, new MoveToolHandler(this))
        this.tools.set(Tool.CUT, new CutToolHandler(this))
    }

    private createManagers() {
        this.managers.push(new GuidelinesManager(this))
        this.managers.push(new ZoomManager(this))
        this.managers.push(new UnscaleManager(this))
        this.managers.push(new UndoRedoManager(this))
        this.managers.push(new GridManager(this))
        this.managers.push(new EventManager(this))
        this.managers.push(new StateManager(this))
        this.managers.push(new SnapManager(this))
    }

    private setup() {
        this.managers.forEach(m => m.setup());
        this.tools.forEach((v, _) => v.setup());

        this.getManager(ZoomManager)?.resetZoom();
    }

    public useTool(tool?: Tool): { value: boolean, message?: string } {
        if (tool == undefined) {
            // deselect
            this.onBeforeSwitchTool.next();
            this.getSelectedToolHandler()?.onToolDeselected();
            this._selectedTool = tool;
            this.onAfterSwitchTool.next();

            return { value: true };
        } else {
            // select
            const canUse = this.canUseTool(tool);
            if (!canUse.value) return canUse;

            this.onBeforeSwitchTool.next();
            this.getSelectedToolHandler()?.onToolDeselected();
            this._selectedTool = tool;
            this.getSelectedToolHandler()?.onToolSelected();
            this.onAfterSwitchTool.next();
            return { value: true };
        }
    }

    public canUseTool(tool?: Tool): { value: boolean, message?: string } {
        if (tool == undefined) return { value: false };

        return this.getToolHandler(tool)?.canBeUsed() ?? { value: false };
    }

    public getSelectedToolHandler(): GenericToolHandler | undefined {
        return this.getToolHandler(this._selectedTool);
    }

    public getToolHandler(tool?: Tool): GenericToolHandler | undefined {
        return tool != undefined ? this.tools.get(tool) : undefined;
    }

    public getManager<M extends GenericManager>(emanager: EManager | (new (e: any) => M)): M | undefined {
        for (const manager of this.managers) {
            if (manager.emanager === emanager || manager.constructor === emanager) {
                return manager as M;
            }
        }
        return undefined;
    }

    public resize(stageContainer: Ref<HTMLDivElement>) {
        // Set canvas size to match the outer div size
        const fullWidth = stageContainer.value.offsetWidth;
        const fullHeight = stageContainer.value.offsetHeight;

        this._stage.width(fullWidth);
        this._stage.height(fullHeight);

        this.getManager(GridManager)?.draw();
    }

    public clear() {
        this.managers.forEach(m => m.clear());
        this.tools.forEach(m => m.clear());
    }

    public destroy(): void {
        this.tools.forEach(m => m.destroy());
        this.managers.forEach(m => m.destroy());
        this.onBeforeSwitchTool.unsubscribeAll();
        this.onAfterSwitchTool.unsubscribeAll();
        this.layer.destroy();
        this.stage.destroy();
    }
}