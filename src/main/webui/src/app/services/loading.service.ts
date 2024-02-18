import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LoaderComponent } from '../components/loader/loader.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  public readonly isLoading = new BehaviorSubject<boolean>(false);
  public readonly loadingMessage = new BehaviorSubject<string>("");
  public static readonly ID = "LOADING_SERVICE_ID";
  public static readonly MSG = "LOADING_SERVICE_MSG";
  private static lastId = 1;

  private requestQueue: { reqId: string, reqMsg: string | undefined }[] = [];

  overlayRef = this.overlay.create({
    positionStrategy: this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically(),
    hasBackdrop: true
  })

  constructor(private overlay: Overlay) {
  }

  show(req: HttpRequest<any>) {
    this.updateQueue(req, true);

    if (this.isLoading.getValue())
      return;

    this.overlayRef.attach(new ComponentPortal(LoaderComponent))
    this.isLoading.next(true);
    console.log("show");
  }

  hide(req: HttpRequest<any>) {
    this.updateQueue(req, false);

    if (this.requestQueue.length == 0) {
      console.log("hide");

      this.isLoading.next(false);
      this.overlayRef.detach()
    }
  }

  private updateQueue(req: HttpRequest<any>, show: boolean) {
    if (!req.headers.has(LoadingService.ID)) return;

    const reqId = req.headers.get(LoadingService.ID)!;
    const reqMsg = req.headers.get(LoadingService.MSG) || "";

    let msg: string | null | undefined = "";
    if (show) {
      this.requestQueue.push({ reqId, reqMsg });
      msg = reqMsg;
    } else {
      this.requestQueue.pop();
      if (this.requestQueue.length > 0) {
        const last = this.requestQueue[this.requestQueue.length - 1];
        msg = last.reqMsg;
      }
    }

    this.loadingMessage.next(msg || "");
  }

  public static generateHeader(message?: string): HttpHeaders {
    return new HttpHeaders()
      .append(LoadingService.ID, this.generateId().toString())
      .append(LoadingService.MSG, message || "");
  }

  public static generateId(): number {
    return LoadingService.lastId++;
  }
}