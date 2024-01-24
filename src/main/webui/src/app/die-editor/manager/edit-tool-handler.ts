import { fabric } from 'fabric';
import { IDieEditor } from "./idie-editor";
import { ToolHandler } from "./tool-handler";

export class EditToolHandler extends ToolHandler {

    selectedObject?: fabric.Object & { points: { x: number, y: number }[] };
    vertex: fabric.Circle[] = [];

    constructor(editor: IDieEditor) {
        super(editor);
    }

    override onToolSelected(): void {
        /*const poly: (fabric.Object & { points: { x: number, y: number }[] }) | undefined = this.editor.fabricCanvas.getObjects().find(o => 'points' in o) as any;
        if (!poly) return;
        this.editor.fabricCanvas.setActiveObject(poly);

        var lastControl = poly.points.length - 1;
        poly.cornerStyle = 'circle';
        poly.cornerColor = 'rgba(0,0,255,0.5)';
        poly.controls = poly.points.reduce((acc: any, point: any, index: any) => {
            acc['p' + index] = new fabric.Control({
                positionHandler: this.polygonPositionHandler,
                actionHandler: this.anchorWrapper(index > 0 ? index - 1 : lastControl, this.actionHandler),
                actionName: 'modifyPolygon',
                pointIndex: index
            });
            return acc;
        }, {});
        poly.hasBorders = false;
        this.editor.fabricCanvas.requestRenderAll();
        */
    }

    override onToolDeselected(): void {
        //this.editor.fabricCanvas.selection = false;
    }

    override onMouseDown(event: fabric.IEvent<Event>): void {
    }

    override onMouseMove(event: fabric.IEvent<Event>): void {

    }

    override onMouseUp(event: fabric.IEvent<Event>): void {

    }

    override onObjectMove(event: fabric.IEvent<Event>): void {

    }


    private polygonPositionHandler(
        dim: { x: number; y: number },
        finalMatrix: any,
        fabricObject: Object,
        currentControl: fabric.Control) {

        const obj = fabricObject as any;
        const control = currentControl as any;

        const x = (obj.points[control.pointIndex].x - obj.pathOffset.x),
            y = (obj.points[control.pointIndex].y - obj.pathOffset.y);
        return fabric.util.transformPoint(new fabric.Point(x, y),
            fabric.util.multiplyTransformMatrices(
                obj.canvas.viewportTransform,
                obj.calcTransformMatrix()
            )
        );
    }


    /*
        // define a function that can locate the controls.
        // this function will be used both for drawing and for interaction.
        polygonPositionHandler(dim:any, finalMatrix:any, fabricObject:any) {
            var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
                y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
            return fabric.util.transformPoint(
                { x: x, y: y },
                fabric.util.multiplyTransformMatrices(
                    fabricObject.canvas.viewportTransform,
                    fabricObject.calcTransformMatrix()
                )
            );
        }
    
        getObjectSizeWithStroke(object:any) {
            var stroke = new fabric.Point(
                object.strokeUniform ? 1 / object.scaleX : 1,
                object.strokeUniform ? 1 / object.scaleY : 1
            ).multiply(object.strokeWidth);
            return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
        }
    
        // define a function that will define what the control does
        // this function will be called on every mouse move after a control has been
        // clicked and is being dragged.
        // The function receive as argument the mouse event, the current trasnform object
        // and the current position in canvas coordinate
        // transform.target is a reference to the current object being transformed,
        actionHandler(eventData:any, transform:any, x:any, y:any) {
            var polygon = transform.target,
                currentControl = polygon.controls[polygon.__corner],
                mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
                polygonBaseSize = getObjectSizeWithStroke(polygon),
                size = polygon._getTransformedDimensions(0, 0),
                finalPointPosition = {
                    x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
                    y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
                };
            polygon.points[currentControl.pointIndex] = finalPointPosition;
            return true;
        }
    
        // define a function that can keep the polygon in the same position when we change its
        // width/height/top/left.
        anchorWrapper(anchorIndex:any, fn:any) {
            return function (eventData, transform, x, y) {
                var fabricObject = transform.target,
                    absolutePoint = fabric.util.transformPoint({
                        x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                        y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                    }, fabricObject.calcTransformMatrix()),
                    actionPerformed = fn(eventData, transform, x, y),
                    newDim = fabricObject._setPositionDimensions({}),
                    polygonBaseSize = getObjectSizeWithStroke(fabricObject),
                    newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
                    newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
                fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
                return actionPerformed;
            }
        }
    
        edit() {
            // clone what are you copying since you
            // may want copy and paste on different moment.
            // and you do not want the changes happened
            // later to reflect on the copy.
            var poly = canvas.getObjects()[0];
            canvas.setActiveObject(poly);
            poly.edit = !poly.edit;
            if (poly.edit) {
                var lastControl = poly.points.length - 1;
                poly.cornerStyle = 'circle';
                poly.cornerColor = 'rgba(0,0,255,0.5)';
                poly.controls = poly.points.reduce(function (acc, point, index) {
                    acc['p' + index] = new fabric.Control({
                        positionHandler: polygonPositionHandler,
                        actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                        actionName: 'modifyPolygon',
                        pointIndex: index
                    });
                    return acc;
                }, {});
            } else {
                poly.cornerColor = 'blue';
                poly.cornerStyle = 'rect';
                poly.controls = fabric.Object.prototype.controls;
            }
            poly.hasBorders = !poly.edit;
            canvas.requestRenderAll();
        }
        */

}
