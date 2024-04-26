import Konva from "konva";
import type { GetSet } from "konva/lib/types";
import type { EditorOrchestrator } from "../editor-orchestrator";
import { EManager } from "./emanager";
import { GenericManager } from "./generic-manager";
import { ZoomManager } from "./zoom-manager";
import { UPDATE, UPDATE_UNSCALE } from "@/model/editor/core/constants";
import type { VirtualLayer } from "../core/layer/virtual-layer";
import { GRID_ELEMENT } from "../core/constants";

export type UnscaleFnc<T extends Konva.Shape> = () => UnscaleFunction<T, any>;

export abstract class UnscaleFunction<T extends Konva.Shape, P extends keyof T = keyof T> {
    protected properties: Map<P, number | number[]> = new Map();

    public abstract defaultProperties(obj: T): void;
    public abstract apply(obj: T, scale: number): void;

    public static unscaleFontsize<T extends Konva.Shape & { fontSize: GetSet<number, any> }>(): UnscaleFunction<T, 'fontSize'> {
        return new UnscaleFunctionImpl<T, 'fontSize'>('fontSize');
    }

    public static unscaleStrokeWidth<T extends Konva.Shape & { strokeWidth: GetSet<number, any> }>(): UnscaleFunction<T, 'strokeWidth'> {
        return new UnscaleFunctionImpl<T, 'strokeWidth'>('strokeWidth');
    }

    public static unscaleRadius<T extends Konva.Shape & { radius: GetSet<number, any> }>(): UnscaleFunction<T, 'radius'> {
        return new UnscaleFunctionImpl<T, 'radius'>('radius');
    }

    public static unscaleDash<T extends Konva.Shape & { dash: GetSet<number[], any> }>(): UnscaleFunction<T, 'dash'> {
        return new UnscaleFunctionImpl<T, 'dash'>('dash');
    }
}

class UnscaleFunctionImpl<T extends Konva.Shape, P extends keyof T> extends UnscaleFunction<T, P> {
    constructor(private property: P) {
        super();
    }

    public defaultProperties(obj: T): void {
        this.properties.set(this.property, (obj[this.property] as any)());
    }

    public apply(obj: T, scale: number): void {
        const prop = this.property as keyof T;
        const propObj = this.properties.get(prop as any);
        if (propObj instanceof Array) {
            (obj[prop] as any)(propObj.map(o => (o || 1) / scale));
        } else {
            (obj[prop] as any)((propObj || 1) / scale);
        }
    }
}

export class UnscaleManager extends GenericManager {
    private zoomManager?: ZoomManager;
    private registeredObjects: Map<Konva.Shape, UnscaleFunction<Konva.Shape, any>[]> = new Map();
    private flags: Map<string, boolean> = new Map([
        [UPDATE, true]
    ]);

    constructor(editor: EditorOrchestrator) {
        super(editor, EManager.UNSCALE);
    }

    public setup(): void {
        this.zoomManager = this.editor.getManager(ZoomManager);
    }

    public clear(): void {
        this.unregisterObjectsIf(o => !o.getAttr(GRID_ELEMENT));
    }

    public destroy(): void {
    }


    public registerShape<S extends Konva.Shape | Konva.Line | Konva.Rect | Konva.Circle | Konva.Text>(object: S, ...attionalFncs: UnscaleFnc<S>[]) {
        if (object instanceof Konva.Line) {
            this.registerObject(object, UnscaleFunction.unscaleStrokeWidth, ...attionalFncs);
        } else if (object instanceof Konva.Rect) {
            this.registerObject(object, UnscaleFunction.unscaleStrokeWidth, ...attionalFncs);
        } else if (object instanceof Konva.Circle) {
            this.registerObject(object, UnscaleFunction.unscaleStrokeWidth, UnscaleFunction.unscaleRadius, ...attionalFncs);
        } else if (object instanceof Konva.Text) {
            this.registerObject(object, UnscaleFunction.unscaleFontsize, ...attionalFncs);
        } else if (object instanceof Konva.Shape) {
            this.registerObject(object, UnscaleFunction.unscaleStrokeWidth, ...attionalFncs);
        } else {
            throw new Error("Object not registered! Unknow type " + typeof object);
        }
    }

    public registerObject<S extends Konva.Shape>(object: S, ...fncs: UnscaleFnc<S>[]) {
        const functions: UnscaleFunction<S>[] = [];
        fncs.forEach(fnc => {
            const func = fnc();
            functions.push(func);
            func.defaultProperties(object)
        });
        this.registeredObjects.set(object, functions);
        this.update(object);
    }

    public unregisterLayer(layer?: Konva.Layer | VirtualLayer) {
        if (!layer) return;
        this.unregisterObjectsIf(o => !!layer.children.find(e => e._id == o._id));
    }

    public unregisterObject(object: Konva.Shape) {
        this.registeredObjects.delete(object);
    }

    public unregisterAll() {
        this.registeredObjects.clear();
    }

    public unregisterObjectsIf(predicate: (object: Konva.Shape) => boolean) {
        const toRemove: Konva.Shape[] = [];
        for (let key of this.registeredObjects.keys()) {
            if (predicate(key)) {
                toRemove.push(key);
            }
        }

        for (const obj of toRemove) {
            this.registeredObjects.delete(obj);
        }
    }

    public update(object?: Konva.Shape) {
        if (!this.zoomManager) return;
        if (this.flags.get(UPDATE) == false) return;

        const scale = this.zoomManager.currentScale;

        if (object) {
            this.registeredObjects.get(object)?.forEach(fnc => {
                fnc.apply(object, scale);
            });
            object.getAttr(UPDATE_UNSCALE)?.(scale);
            return;
        }

        for (let [key, value] of this.registeredObjects) {
            value.forEach(fnc => {
                fnc.apply(key, scale);
            });
            key.getAttr(UPDATE_UNSCALE)?.(scale);
        }

        console.log("Updated " + this.registeredObjects.size);
    }

    setFlag(flag: string, value: boolean) {
        this.flags.set(flag, value)
    }

    getFlag(flag: string): boolean | undefined {
        return this.flags.get(flag)
    }
}