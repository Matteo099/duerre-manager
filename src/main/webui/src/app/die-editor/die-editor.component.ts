import { AfterContentInit, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { fabric } from 'fabric';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ILineOptions, IObjectOptions } from 'fabric/fabric-impl';
import { DieEditorManager } from './manager/die-editor-manager';
import { Tool } from './manager/tool';
import JSZip from 'jszip';

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
  clear() {
    this.dieEditor?.clear();
  }
  cancel() { }

  getColor(tool: Tool) {
    if (this.dieEditor?.selectedTool == tool)
      return "warn";
    return "primary";
  }

  save() {
    const result = this.dieEditor?.getResult();
    const cropperResult = this.dieEditor?.getCroppedResult();
    if (!result || !cropperResult) return;

    const zip = new JSZip();

    // Add JSON files to the zip
    zip.file('canvas.json', JSON.stringify(result.jsonData));
    zip.file('cropped_canvas.json', JSON.stringify(cropperResult.jsonData));

    // Add PNG files to the zip
    zip.file('canvas.png', this.dataURLtoBlob(result.dataURL), { binary: true });
    zip.file('cropped_canvas.png', this.dataURLtoBlob(cropperResult.dataURL), { binary: true });

    // Generate the zip and trigger download
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      const url = URL.createObjectURL(blob);

      // Create an anchor element for downloading the zip
      const a = document.createElement('a');
      a.href = url;
      a.download = 'canvas.zip';

      // Trigger a click event to start the download
      a.click();

      // Release the URL object
      URL.revokeObjectURL(url);
    });
  }

  private dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }
}
