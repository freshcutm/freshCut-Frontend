import { Observable, of } from 'rxjs';

export interface Command<T = any> {
  description: string;
  execute(): Observable<T>;
  undo(): Observable<any>;
}

export class NoopCommand implements Command<void> {
  description = 'NOOP';
  execute() { return of(void 0); }
  undo() { return of(void 0); }
}