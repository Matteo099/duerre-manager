import { AfterContentInit, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { fabric } from 'fabric';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ILineOptions, IObjectOptions } from 'fabric/fabric-impl';
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

  @ViewChild('canvasParent', { static: true }) canvasParent?: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement?: ElementRef;

  private dieEditor?: DieEditorManager;
  Tool = Tool;


  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    if (!this.canvasElement || !this.canvasParent) return;

    this.dieEditor = new DieEditorManager(this.canvasElement);
    this.dieEditor.resize(this.canvasParent);
    const _dieEditor = this.dieEditor;
    setTimeout(() => _dieEditor.useTool(Tool.DRAW), 10);
  }

  @HostListener("window:resize")
  updateCanvasSize() {
    if (!this.canvasParent) return;
    this.dieEditor?.resize(this.canvasParent);
  }

  useSelectTool() {
    this.dieEditor?.useTool(Tool.EDIT);
  }
  useDrawTool() {
    this.dieEditor?.useTool(Tool.DRAW);
  }
  useEraserTool() {
    this.dieEditor?.useTool(Tool.ERASER);
  }
  useMoveTool() {
    this.dieEditor?.useTool(Tool.MOVE);
  }
  zoomIn() {
    this.dieEditor?.zoomIn();
  }
  restoreZoom() { }
  zoomOut() {
    this.dieEditor?.zoomOut();
  }

  undo() { }
  redo() { }
  save() { }
  cancel() { }

  getColor(tool: Tool) {
    if (this.dieEditor?.selectedTool == tool)
      return "warn";
    return "primary";
  }
}
