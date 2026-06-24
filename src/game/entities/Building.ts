import { Entity } from './Entity';

export abstract class Building extends Entity {
  buildingType: string = 'building';

  constructor(x: number, y: number, width: number, height: number, hp: number) {
    super(x, y, width, height, hp);
  }
}
