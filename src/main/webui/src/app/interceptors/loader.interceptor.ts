import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(req);
  if (req.headers.has(LoadingService.ID)) {
    const loadingService = inject(LoadingService);
    loadingService.show(req);
    return next(req).pipe(finalize(() => loadingService.hide(req)));
  }

  return next(req);
};
