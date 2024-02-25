import Konva from "konva";
import { GetSet } from "konva/lib/types";
import { IDieEditor } from "../idie-editor";
import { ZoomManager } from "./zoom-manager";
import { Expansion } from "@angular/compiler";
import { UPDATE_UNSCALE } from "../constants";

export type UnscaleFnc<T extends Konva.Shape> = () => UnscaleFunction<T, any>;

// export abstract class UnscaleFunction<T extends Konva.Shape> {
//     protected properties: Map<string, number> = new Map();
//     public abstract apply(obj: T, scale: number): void;
//     public abstract defaultProperties(obj: T): void;

//     public static unscaleFontsize() { return new UnscaleFontSizeFunction() }
// }

// export class UnscaleFontSizeFunction extends UnscaleFunction<Konva.Shape & { fontSize: GetSet<number, any> }>{

//     public override defaultProperties(obj: Konva.Shape & { fontSize: GetSet<number, any> }): void {
//         this.properties.set('fontsize', obj.fontSize());
//     }

//     public override apply(obj: Konva.Shape & { fontSize: GetSet<number, any> }, scale: number): void {
//         obj.fontSize((this.properties.get('fontsize') || 1) * scale);
//     }
// }

// export class UnscaleStrokeWidthFunction extends UnscaleFunction<Konva.Shape & { strokeWidth: GetSet<number, any> }>{

//     public override defaultProperties(obj: Konva.Shape & { strokeWidth: number }): void {
//         this.properties.set('strokeWidth', obj.strokeWidth());
//     }

//     public override apply(obj: Konva.Shape & { strokeWidth: number }, scale: number): void {
//         obj.strokeWidth((this.properties.get('strokeWidth') || 1) * scale);
//     }
// }


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


export class UnscaleManager {

    private editor: IDieEditor;
    private zoomManager: ZoomManager;
    private registeredObjects: Map<Konva.Shape, UnscaleFunction<Konva.Shape, any>[]> = new Map();

    public static instance?: UnscaleManager;

    constructor(editor: IDieEditor, zoomManager: ZoomManager) {
        this.editor = editor;
        this.zoomManager = zoomManager;
        UnscaleManager.instance = this;
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

    public unregisterLayer(layer?: Konva.Layer) {
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
}