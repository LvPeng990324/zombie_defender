export abstract class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  alive: boolean = true;
  id: number;
  static nextId: number = 0;

  constructor(x: number, y: number, width: number, height: number, hp: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hp = hp;
    this.maxHp = hp;
    this.id = Entity.nextId++;
  }

  get centerX(): number {
    return this.x + this.width / 2;
  }

  get centerY(): number {
    return this.y + this.height / 2;
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  abstract update(dt: number, ...args: unknown[]): void;
  abstract render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void;
}
