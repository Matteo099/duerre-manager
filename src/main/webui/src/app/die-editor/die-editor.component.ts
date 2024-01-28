import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DieEditorManager } from './manager/die-editor-manager';
import { Tool } from './manager/tool';

@Component({
  selector: 'app-die-editor',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './die-editor.component.html',
  styleUrl: './die-editor.component.scss'
})
export class DieEditorComponent implements AfterViewInit {

  @ViewChild('stageContainer', { static: false }) stageContainer?: ElementRef;

  Tool = Tool;


  // stage!: Konva.Stage;
  // layer!: Konva.Layer;
  // circles: Konva.Circle[] = [];
  // polygon!: Konva.Line;
  // GUIDELINE_OFFSET = 5;

  editor?: DieEditorManager;


  ngAfterViewInit() {
    this.editor = new DieEditorManager(this.stageContainer!);
    setTimeout(() => this.editor!.useTool(Tool.DRAW), 100);
  }


  // addPolygon() {
  //   const points = this.circles.map(circle => [circle.x(), circle.y()]).flat();

  //   this.polygon = new Konva.Line({
  //     points: points,
  //     fill: '#ff000088',
  //     stroke: '#ff0000',
  //     strokeWidth: 1,
  //     draggable: false,
  //     closed: true,
  //     dash: [],
  //   });

  //   this.layer.add(this.polygon);
  // }

  // addEventListeners() {
  //   this.circles.forEach(circle => this.addEventToCircle(circle));

  //   this.polygon.on('click', (e) => {
  //     this.handlePolygonClick();
  //   });

  //   this.layer.draw();
  // }

  // addEventToCircle(circle: Konva.Circle) {
  //   circle.on('dragmove', (e) => {
  //     console.log(e);
  //     this.handleCircleDragMove(circle);
  //   });

  //   circle.on('mouseover', (e) => {
  //     circle.radius(10);
  //     this.layer.draw();
  //   });

  //   circle.on('mouseout', (e) => {
  //     circle.radius(5);
  //     this.layer.draw();
  //   });
  // }

  // handleCircleDragMove(circle: Konva.Circle) {
  //   const coords = this.snapToGrid({ x: circle.x(), y: circle.y() });
  //   circle.x(coords.x);
  //   circle.y(coords.y);
  //   this.polygon.points(this.circles.map(c => [c.x(), c.y()]).flat());
  //   this.layer.batchDraw();
  // }

  // handlePolygonClick() {
  //   const mousePos = this.snapToGrid(this.stage.getPointerPosition()!);
  //   const x = mousePos.x;
  //   const y = mousePos.y;
  //   const points = this.polygon.points();

  //   for (let i = 0; i < points.length / 2; i++) {
  //     const s_x = points[i * 2];
  //     const s_y = points[i * 2 + 1];
  //     const e_x = points[(i * 2 + 2) % points.length];
  //     const e_y = points[(i * 2 + 3) % points.length];

  //     if (((s_x <= x && x <= e_x) || (e_x <= x && x <= s_x)) &&
  //       ((s_y <= y && y <= e_y) || (e_y <= y && y <= s_y))) {
  //       const newPoint = new Konva.Circle({
  //         x: x,
  //         y: y,
  //         radius: 3,
  //         stroke: '#ff0000',
  //         strokeWidth: 1,
  //         draggable: true,
  //       });

  //       this.addEventToCircle(newPoint);
  //       this.circles.splice(i + 1, 0, newPoint);
  //       this.polygon.points(this.circles.map(c => [c.x(), c.y()]).flat());
  //       this.layer.add(newPoint);
  //       this.layer.draw();
  //       break;
  //     }
  //   }
  // }

  @HostListener("window:resize")
  updateCanvasSize() {
    if (this.stageContainer) this.editor?.resize(this.stageContainer);
  }

  useSelectTool() {
    this.editor?.useTool(Tool.SELECT);
  }
  useDrawTool() {
    this.editor?.useTool(Tool.DRAW);
  }
  useEraserTool() {
    this.editor?.useTool(Tool.ERASER);
  }
  useMoveTool() {
    this.editor?.useTool(Tool.MOVE);
  }
  zoomIn() {
    this.editor?.zoomIn();
  }
  restoreZoom() { }
  zoomOut() {
    this.editor?.zoomOut();
  }

  undo() { }
  redo() { }
  clear() {
  }
  cancel() { }

  getColor(tool: Tool) {
    if (this.editor?.selectedTool == tool)
      return "warn";
    return "primary";
  }

  save() {
  }
}
