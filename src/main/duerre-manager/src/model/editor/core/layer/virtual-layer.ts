import type Konva from "konva";

export const V_LAYER_ID = "V_LAYER_ID";
export class VirtualLayer {

    private static lastId = 2;
    public readonly id: number = VirtualLayer.lastId++;
    public readonly children: Konva.Node[] = [];

    constructor(
        private readonly layer: Konva.Layer,
        public readonly name?: string
    ) { }

    public moveToTop(): boolean {
        let res = true;
        this.children.forEach(n => res &&= n.moveToTop());
        return res;
    }

    public add(...nodes: (Konva.Group | Konva.Shape | undefined)[]) {
        nodes.forEach(node => {
            if(!node) return;
            node.setAttr(V_LAYER_ID, this.id);
            this.layer.add(node);
            this.children.push(node);
        })
    }

    public visible(active: boolean) {
        this.children.forEach(n => n.visible(active));
    }

    public destroy() {
        this.destroyChildren();
    }

    public destroyChildren() {
        this.children.forEach(n => n.destroy());
        this.children.length = 0;
    }

    public removeChildren() {
        this.children.forEach(n => n.remove());
    }
}