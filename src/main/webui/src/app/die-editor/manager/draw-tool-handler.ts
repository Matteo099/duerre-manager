import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { IDieEditor } from "./idie-editor";
import { LineMeasurement } from "./line-measurement";
import { ToolHandler } from "./tool-handler";
import { EDITABLE_TEXT } from "./constants";

export class DrawToolHandler extends ToolHandler {

    private isDrawing: boolean = false;
    private startingPoint?: Konva.Vector2d;
    private lineMeasure?: LineMeasurement;
    private lines: LineMeasurement[] = [];
    private readonly polygon: Konva.Line = new Konva.Line({
        points: [],
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 5,
        closed: true,
        visible: false
    });

    private unit: string = "mm";

    constructor(editor: IDieEditor) {
        super(editor);

        this.editor.layer.add(this.polygon);
    }

    override onMouseDown(event: KonvaEventObject<any>): void {
        if (event.target.getAttr(EDITABLE_TEXT)) return;
        const pos = this.startingPoint = this.editor.getSnappedToGridPointer();
        if (this.lines.length > 0) {
            const vertex = this.getEndPoints().find(v => v.x == pos.x && v.y == pos.y);
            if (!vertex) return;
        }

        this.isDrawing = true;
        this.lineMeasure = new LineMeasurement(this, pos);
        this.lineMeasure.addToLayer();
    }

    override onMouseMove(event: KonvaEventObject<any>): void {
        if (!this.isDrawing) {
            return;
        }

        // prevent scrolling on touch devices
        event.evt.preventDefault();
        const pos = this.editor.getSnappedToGridPointer();
        const newPoints = [this.startingPoint!.x, this.startingPoint!.y, pos.x, pos.y];
        this.lineMeasure!.updatePoints(newPoints); // update points and text
    }

    override onMouseUp(event: KonvaEventObject<any>): void {
        this.isDrawing = false;

        if (!this.lineMeasure) return;

        const pos = this.editor.getSnappedToGridPointer();
        const newPoints = [this.startingPoint!.x, this.startingPoint!.y, pos.x, pos.y];
        this.lineMeasure.updatePoints(newPoints);

        if (this.lineMeasure.getLength() > 0) {
            // add to lines array
            this.lines.push(this.lineMeasure);
            this.polygon.points(this.lines.flatMap(l => l.line.points()));
        } else {
            this.lineMeasure.destroy();
        }

        this.lineMeasure = undefined;
    }

    private getVertices(): Konva.Vector2d[] {
        return this.lines.flatMap(l => {
            const points = l.line.points();
            const vertices: Konva.Vector2d[] = [];
            for (let i = 0; i < points.length - 1; i += 2) {
                vertices.push({ x: points[i], y: points[i + 1] });
            }
            return vertices;
        });
    }

    private getEndPoints(): Konva.Vector2d[] {
        const vectors = this.getVertices();
        const vectorCountMap: Record<string, number> = {};

        // Count the occurrences of each vector
        for (const vector of vectors) {
            const key = `${vector.x}-${vector.y}`;
            vectorCountMap[key] = (vectorCountMap[key] || 0) + 1;
        }

        // Filter out vectors that occur only once
        const uniqueVectors = vectors.filter(vector => {
            const key = `${vector.x}-${vector.y}`;
            return vectorCountMap[key] === 1;
        });

        return uniqueVectors;
    }

    private findAttachedLines(line: Konva.Line): Konva.Line[] {
        const attachedLines: Konva.Line[] = [];
        const coords = this.helper.lineToCoords(line);
        for (const mLine of this.lines) {
            const points = this.helper.lineToCoords(mLine.line);
            if (points.x1 == coords.x1 && points.x2 == coords.x2 && points.y1 == coords.y1 && points.y2 == coords.y2) {
                attachedLines.push(mLine.line);
            }
        }
        return attachedLines;
    }

    public findLinesWithEndpoint(endpoint: Konva.Vector2d): LineMeasurement[] {
        const attachedLines: LineMeasurement[] = [];
        for (const mLine of this.lines) {
            const points = this.helper.lineToCoords(mLine.line);
            if ((points.x1 == endpoint.x && points.y1 == endpoint.y) || (points.x2 == endpoint.x && points.y2 == endpoint.y)) {
                attachedLines.push(mLine);
            }
        }
        return attachedLines;
    }

    /*private createEditableText(line: Konva.Line, pos: Konva.Vector2d) {
        const textNode = this.currentText = new Konva.Text({
            x: pos.x,
            y: pos.y,
            text: "0 mm",
            fill: '#333',
            fontSize: 25,
            fontFamily: 'Arial',
            align: 'center'
        });
        textNode.setAttr("MEASUREMENT", true);
        const stage = this.editor.stage;
        textNode.on('dblclick dbltap', () => {
            // hide text node and transformer:
            textNode.hide();

            // create textarea over canvas with absolute position
            // first we need to find position for textarea
            // how to find it?

            // at first lets find position of text node relative to the stage:
            var textPosition = textNode.absolutePosition();

            // so position of textarea will be the sum of positions above:
            var areaPosition = {
                x: stage.container().offsetLeft + textPosition.x,
                y: stage.container().offsetTop + textPosition.y,
            };

            // create textarea and style it
            var textarea = document.createElement('textarea');
            document.body.appendChild(textarea);

            // apply many styles to match text on canvas as close as possible
            // remember that text rendering on canvas and on the textarea can be different
            // and sometimes it is hard to make it 100% the same. But we will try...
            textarea.value = this.helper.calculateLength(line).toFixed(2).toString();
            textarea.style.position = 'absolute';
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
            textarea.style.height =
                textNode.height() - textNode.padding() * 2 + 5 + 'px';
            textarea.style.fontSize = textNode.fontSize() + 'px';
            textarea.style.border = 'none';
            textarea.style.padding = '0px';
            textarea.style.margin = '0px';
            textarea.style.overflow = 'hidden';
            textarea.style.background = 'none';
            textarea.style.outline = 'none';
            textarea.style.resize = 'none';
            textarea.style.lineHeight = textNode.lineHeight().toString();
            textarea.style.fontFamily = textNode.fontFamily();
            textarea.style.transformOrigin = 'left top';
            textarea.style.textAlign = textNode.align();
            textarea.style.color = textNode.fill();
            let rotation = textNode.rotation();
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
                px += 2 + Math.round(textNode.fontSize() / 20);
            }
            transform += 'translateY(-' + px + 'px)';

            textarea.style.transform = transform;

            // reset height
            textarea.style.height = 'auto';
            // after browsers resized it we can set actual value
            textarea.style.height = textarea.scrollHeight + 3 + 'px';

            textarea.focus();

            function removeTextarea() {
                textarea.parentNode?.removeChild(textarea);
                window.removeEventListener('click', handleOutsideClick);
                textNode.show();
                //   tr.show();
                //   tr.forceUpdate();
            }

            function setTextareaWidth(newWidth: number) {
                if (!newWidth) {
                    // set width for placeholder
                    newWidth = textNode.width();//textNode.placeholder.length * textNode.fontSize();
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
                textarea.style.width = newWidth + 'px';
            }

            textarea.addEventListener('keydown', (e) => {
                // hide on enter
                // but don't hide on shift + enter
                if (e.keyCode === 13 && !e.shiftKey) {
                    updateTextAndLine();
                }
                // on esc do not set value back to node
                if (e.keyCode === 27) {
                    removeTextarea();
                }
            });

            textarea.addEventListener('keydown', function (e) {
                let scale = textNode.getAbsoluteScale().x;
                setTextareaWidth(textNode.width() * scale);
                textarea.style.height = 'auto';
                textarea.style.height =
                    textarea.scrollHeight + textNode.fontSize() + 'px';
            });

            function handleOutsideClick(e: any) {
                if (e.target !== textarea) {
                    textNode.text(textarea.value);
                    updateTextAndLine();
                }
            }

            const _this = this;
            function updateTextAndLine() {
                const length = parseFloat(textarea.value);
                //textNode.text(length.toFixed(2) + " mm");
                const point = _this.helper.findPoint(line, length);
                const points = line.points();
                points[points.length - 2] = point.x;
                points[points.length - 1] = point.y;
                line.points(points);
                removeTextarea();
                _this.updateText(textNode, line);
            }
            setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            });
        });
    }*/
}