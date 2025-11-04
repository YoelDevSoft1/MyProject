import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error);
      
      // Log detallado para debugging
      if (error.status === 0) {
        console.error('❌ Error de conexión: El backend no está ejecutándose');
        console.error('💡 Solución: Ejecuta el backend con: cd smd-vital-backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000');
      } else if (error.status === 500) {
        console.error('❌ Error interno del servidor (500)');
        console.error('🔗 URL:', error.url);
        console.error('📊 Detalles:', error.error);
      } else if (error.status === 404) {
        console.error('❌ Endpoint no encontrado (404)');
        console.error('🔗 URL:', error.url);
      }
      
      return throwError(() => error);
    })
  );
};
