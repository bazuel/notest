import { Directive, Input, ViewContainerRef } from '@angular/core';

export interface IComponent<T = any> {
  data: T;
  query: string;
}

@Directive({
  selector: '[smComponentInjector]'
})
export class ComponentInjectorDirective {
  @Input() data: any;
  @Input() query = '';

  @Input() set component(component: IComponent) {
    this.viewContainerRef.clear();
    this.createComponent(component);
  }

  constructor(private viewContainerRef: ViewContainerRef) {}

  private createComponent(component: IComponent) {
    if (component) {
      const componentRef = this.viewContainerRef.createComponent(component as any);
      (componentRef.instance as IComponent).data = this.data;
      (componentRef.instance as IComponent).query = this.query;
      componentRef.changeDetectorRef.detectChanges();
    }
  }
}
