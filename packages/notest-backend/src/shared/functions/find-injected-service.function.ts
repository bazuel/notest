import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

let injector: InjectorService;

export function findInjectedService(c) {
  return injector.get(c);
}

@Injectable()
export class InjectorService {
  constructor(private moduleRef: ModuleRef) {
    injector = this;
  }

  get(c) {
    return this.moduleRef.get(c);
  }
}
