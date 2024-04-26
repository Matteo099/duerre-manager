import Konva from "konva";
import type { EditorOrchestrator } from "../../editor-orchestrator";
import { UnscaleManager } from "../../managers/unscale-manager";
import { LiteEvent } from "../event/lite-event";
import type { ILiteEvent } from "../event/ilite-event";
import { EDITABLE_TEXT } from "../constants";

export class EditableText {

    private static _editing: boolean = false;
    private static onEdit: LiteEvent<boolean> = new LiteEvent<boolean>();
    
    public static get Edit() : ILiteEvent<boolean> { return this.onEdit.expose(); }
    public static get editing(): boolean { return this._editing; }
    static {
        this.onEdit.next(false);
        this.onEdit.subscribe((v) => { EditableText._editing = v; });
    }
    
    protected readonly editor: EditorOrchestrator;
    protected readonly unscaleManager: UnscaleManager | undefined;
    public readonly text: Konva.Text;
    private textarea?: HTMLTextAreaElement;
    public onDeleteTextarea?: Function;
    public beforeCreateTextarea?: Function;

    constructor(editor: EditorOrchestrator, opts: Konva.TextConfig = {
        x: 0,
        y: 0,
        text: "0 mm",
        fill: '#333',
        fontSize: 25,
        fontFamily: 'Arial',
        align: 'center'
    }) {
        this.editor = editor;
        this.unscaleManager = this.editor.getManager(UnscaleManager)
        this.text = new Konva.Text(opts);
        this.text.setAttr(EDITABLE_TEXT, true);
        this.unscaleManager?.registerShape(this.text);    
        this.text.on('dblclick dbltap', event => this.handleDoubleTap(event));
    }

    private handleDoubleTap(event: Konva.KonvaEventObject<any>) {
        console.log("handle dbl tap", this.textarea);

        EditableText.onEdit.next(true);

        // hide text node and transformer:
        this.text.hide();
        this.textarea = this.createTextarea();

        this.textarea.addEventListener('keydown', (e) => {
            // hide on enter
            // but don't hide on shift + enter
            if (e.key === "Enter" && !e.shiftKey) {
                this.removeTextarea(true);
            }
            // on esc do not set value back to node
            if (e.key === "Escape") {
                this.removeTextarea(false);
            }
        });

        this.textarea.addEventListener('keydown', (e) => {
            const scale = this.text.getAbsoluteScale().x;
            if (!this.textarea) return;

            this.setTextareaWidth(this.text.width() * scale);
            this.textarea.style.height = 'auto';
            this.textarea.style.height = this.textarea.scrollHeight + this.text.fontSize() + 'px';
        });

        setTimeout(() => {
            window.addEventListener('click', this.handleOutsideClick);
        });
    }

    private handleOutsideClick = (e: any) => {
        if (e.target !== this.textarea) {
            this.removeTextarea(true);
        }
    }

    private removeTextarea(save: boolean) {
        if (save) this.onDeleteTextarea?.(this.textarea?.value);

        EditableText.onEdit.next(false);
        this.textarea?.parentNode?.removeChild(this.textarea);
        this.textarea = undefined;
        window.removeEventListener('click', this.handleOutsideClick);
        this.text.show();
    }

    private setTextareaWidth(newWidth: number) {
        if (!this.textarea) return;

        if (!newWidth) {
            // set width for placeholder
            newWidth = this.text.width();//textNode.placeholder.length * textNode.fontSize();
        }
        // some extra fixes on different browsers
        var isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
        );
        var isFirefox =
            navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isSafari || isFirefox) {
            newWidth = Math.ceil(newWidth);
        }

        // @ts-ignore
        const isEdge = document.documentMode || /Edge/.test(navigator.userAgent);
        if (isEdge) {
            newWidth += 1;
        }
        this.textarea.style.width = newWidth + 'px';
    }

    private createTextarea(): HTMLTextAreaElement {
        this.beforeCreateTextarea?.();

        const textPosition = this.text.absolutePosition();
        const areaPosition = {
            x: this.editor.stage.container().offsetLeft + textPosition.x,
            y: this.editor.stage.container().offsetTop + textPosition.y,
        };

        // create textarea and style it
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        textarea.value = this.text.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = this.text.width() - this.text.padding() * 2 + 'px';
        textarea.style.height = this.text.height() - this.text.padding() * 2 + 5 + 'px';
        textarea.style.fontSize = this.text.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = this.text.lineHeight().toString();
        textarea.style.fontFamily = this.text.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = this.text.align();
        textarea.style.color = this.text.fill();
        let rotation = this.text.rotation();
        let transform = '';
        if (rotation) {
            transform += 'rotateZ(' + rotation + 'deg)';
        }

        let px = 0;
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
        let isFirefox =
            navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
            px += 2 + Math.round(this.text.fontSize() / 20);
        }
        transform += 'translateY(-' + px + 'px)';

        textarea.style.transform = transform;

        // reset height
        textarea.style.height = 'auto';
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 3 + 'px';

        textarea.focus();
        return textarea;
    }
}
