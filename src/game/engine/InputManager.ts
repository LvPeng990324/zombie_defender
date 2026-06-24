import type { BuildType } from './Config';

export class InputManager {
  keys: Set<string> = new Set();
  mouseX: number = 0;
  mouseY: number = 0;
  mouseWorldX: number = 0;
  mouseWorldY: number = 0;
  mouseDown: boolean = false;
  mouseClicked: boolean = false;
  buildType: BuildType = null;
  private canvas: HTMLCanvasElement | null = null;
  private cameraX: number = 0;
  private cameraY: number = 0;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundMouseMove = this._onMouseMove.bind(this);
    this._boundMouseDown = this._onMouseDown.bind(this);
    this._boundMouseUp = this._onMouseUp.bind(this);
    this._boundContextMenu = this._onContextMenu.bind(this);

    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
    canvas.addEventListener('mousemove', this._boundMouseMove);
    canvas.addEventListener('mousedown', this._boundMouseDown);
    canvas.addEventListener('mouseup', this._boundMouseUp);
    canvas.addEventListener('contextmenu', this._boundContextMenu);
  }

  private _boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private _boundKeyUp: ((e: KeyboardEvent) => void) | null = null;
  private _boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private _boundMouseDown: ((e: MouseEvent) => void) | null = null;
  private _boundMouseUp: ((e: MouseEvent) => void) | null = null;
  private _boundContextMenu: ((e: MouseEvent) => void) | null = null;

  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown!);
    window.removeEventListener('keyup', this._boundKeyUp!);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this._boundMouseMove!);
      this.canvas.removeEventListener('mousedown', this._boundMouseDown!);
      this.canvas.removeEventListener('mouseup', this._boundMouseUp!);
      this.canvas.removeEventListener('contextmenu', this._boundContextMenu!);
    }
  }

  setCamera(x: number, y: number) {
    this.cameraX = x;
    this.cameraY = y;
  }

  private _onKeyDown(e: KeyboardEvent) {
    this.keys.add(e.key.toLowerCase());
    if (e.key === '1') this.buildType = 'wall';
    if (e.key === '2') this.buildType = 'turret';
    if (e.key === 'Escape') this.buildType = null;
  }

  private _onKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.key.toLowerCase());
  }

  private _onMouseMove(e: MouseEvent) {
    const rect = this.canvas!.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.mouseWorldX = this.mouseX + this.cameraX;
    this.mouseWorldY = this.mouseY + this.cameraY;
  }

  private _onMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      this.mouseDown = true;
      this.mouseClicked = true;
    }
  }

  private _onMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      this.mouseDown = false;
    }
  }

  private _onContextMenu(e: MouseEvent) {
    e.preventDefault();
  }

  isMovingUp(): boolean {
    return this.keys.has('w') || this.keys.has('arrowup');
  }

  isMovingDown(): boolean {
    return this.keys.has('s') || this.keys.has('arrowdown');
  }

  isMovingLeft(): boolean {
    return this.keys.has('a') || this.keys.has('arrowleft');
  }

  isMovingRight(): boolean {
    return this.keys.has('d') || this.keys.has('arrowright');
  }

  resetClick() {
    this.mouseClicked = false;
  }

  selectBuildType(type: BuildType) {
    this.buildType = type;
  }
}
