import Konva from "konva";
import type { EditorOrchestrator } from "../editor-orchestrator";
import type { Vec2D } from "../core/math/vec2d";
import { SnapManager } from "../managers/snap-manager";
import { UnscaleManager } from "../managers/unscale-manager";
import type { VirtualLayer } from "../core/layer/virtual-layer";
import type { ELifecycle } from "../e-lifecycle";
import { GuidelinesManager } from "../managers/guidelines-manager";
import { StateManager } from "../managers/state-manager";
import type { EventSubscription } from "../core/event/lite-event";

export type LayerFn = (layer?: VirtualLayer) => boolean | void;

export abstract class GenericToolHandler implements ELifecycle {

    protected readonly editor: EditorOrchestrator;
    protected readonly mainLayer: Konva.Layer;
    protected readonly layers: VirtualLayer[] = [];
    protected subscriptions: EventSubscription[] = [];
    protected enableGuidelines: boolean;

    protected stateManager?: StateManager;
    protected snapManager?: SnapManager;
    protected unscaleManager?: UnscaleManager;
    protected guidelinesManager?: GuidelinesManager;

    constructor(editor: EditorOrchestrator, enableGuidelines: boolean) {
        this.editor = editor;
        this.mainLayer = editor.layer;
        this.enableGuidelines = enableGuidelines;
    }

    public setup() {
        this.createLayers();
        
        this.stateManager = this.editor.getManager(StateManager);
        this.snapManager = this.editor.getManager(SnapManager);
        this.unscaleManager = this.editor.getManager(UnscaleManager);
        this.guidelinesManager = this.editor.getManager(GuidelinesManager);
    }

    protected createLayers(): void {
    }

    protected getLayer(selector: number | LayerFn): VirtualLayer | undefined {
        return this.layers.find(l => l.id == selector || (selector instanceof Function ? selector(l) : false));
    }

    protected getSnappingPoint(): Vec2D {
        return this.snapManager!.getSnapToNearest({ useEndpoints: true });
    }

    canBeUsed(): { value: boolean, message?: string } {
        return { value: true };
    }

    onToolSelected() {
        this.layers.forEach(l => l.visible(true));
    }

    onToolDeselected(): void {
        this.layers.forEach(l => l.visible(false));
    }

    destroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.layers.forEach(l => l.destroy());
    }

    clear() {
        this.layers.forEach(l => {
            this.unscaleManager?.unregisterLayer(l);
            l.removeChildren()
        });
    }

    public onMouseDown(event: Konva.KonvaEventObject<any>): void {
        if (this.enableGuidelines) this.guidelinesManager?.activate();
    }
    public onMouseMove(event: Konva.KonvaEventObject<any>): void {
        if (this.enableGuidelines) this.guidelinesManager?.update();
    }
    public onMouseUp(event: Konva.KonvaEventObject<any>): void {
        if (this.enableGuidelines) this.guidelinesManager?.deactivate();
    }
} 