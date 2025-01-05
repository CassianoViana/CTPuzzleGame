import { Scene } from 'phaser';
import InterfaceElement from '../InterfaceElement';
import Sounds from '../sounds/Sounds';
import { androidVibrate } from '../utils/Utils';

export default class Button implements InterfaceElement {


  fontFamily: string = 'Dyuthi, sans-serif';
  fontSize: number = 100;
  sprite: Phaser.GameObjects.Sprite;
  blinked: boolean = false;
  blinkingInterval: number;
  hover: boolean;
  disabled: boolean = false
  scene: Scene
  text: Phaser.GameObjects.Text;
  scale: number = 1;
  toggable = false
  toggled: boolean = false;
  onBlink: (blinked:boolean) => void = () => { };

  constructor(scene: Scene, sounds: Sounds, x: integer, y: integer, spriteKey: string, onClickHandler: () => any) {
    this.scene = scene;
    const sprite = scene.add.sprite(x, y, spriteKey, 0)?.setInteractive({ cursor: 'pointer' });
    this.sprite = sprite;
    this.sprite.on('pointerover', () => {
      this.hover = true;
      if (this.toggable) return
      this.sprite.setFrame(1)
      sounds?.hover();
    })
    this.sprite.on('pointerout', () => {
      if (this.toggable) return
      this.hover = false;
      this.sprite.setFrame(0)
    })
    this.sprite.on('pointerup', () => {
      if (this.disabled) return;
      androidVibrate(30)
      onClickHandler();
      if (this.toggable) {
        this.toggle();
      }
    })
    this.sprite.on('pointerdown', () => {
      if (this.disabled) return;
      if (this.toggable) return;
      this.sprite.setFrame(2)
    })
  }

  toggle(toggled: boolean = !this.toggled) {
    this.toggable = true;
    this.toggled = toggled
    if (this.toggable) {
      this.sprite.setFrame(this.toggled ? 4 : 1);
    } else {
      this.sprite.setFrame(1);
    }
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite as Phaser.Physics.Arcade.Sprite
  }

  blink() {
    this.stopBlink();
    this.blinkingInterval = setInterval(() => { this.toggleBlink() }, 300)
  }

  stopBlink() {
    this.blinked = false;
    clearInterval(this.blinkingInterval);
    this.sprite.setFrame(0)
  }

  hide() {
    this.setVisible(false)
  }
  
  show() {
    this.setVisible(true)
  }

  toggleBlink() {
    if (!this.blinked) {
      this.sprite.setFrame(1);
      this.blinked = true;
    } else {
      this.blinked = false;
      this.sprite.setFrame(0);
    }
    this.onBlink(this.blinked)
  }

  setFontSize(arg0: number) {
    this.fontSize = arg0;
    this.text?.setFontSize(arg0)
  }

  setFontFamily(arg0: string) {
    this.fontFamily = arg0
    this.text?.setFontFamily(arg0)
  }

  ajustTextPosition(xDiff: number = 0, yDiff: number = 0): void {
    this.text.x = this.sprite.x + xDiff * this.scale - this.sprite.displayWidth / 2
    this.text.y = this.sprite.y + yDiff * this.scale - this.sprite.displayHeight / 2
  }

  disable() {
    this.disabled = true;
  }
  enable() {
    this.disabled = false;
  }

  disableInteractive() {
    this.sprite?.disableInteractive();
  }
  setInteractive() {
    this.sprite?.setInteractive();
  }

  setDepth(depth: number): void {
    this.sprite?.setDepth(depth);
    this.text?.setDepth(depth + 1);
  }

  setText(value: string, cell: { x: number, y: number } = { x: this.sprite.x, y: this.sprite.y }) {
    let text = this.scene.add.text(cell.x, cell.y, '', {
      fontFamily: this.fontFamily,
    })
      .setFontStyle('bold')
      .setFontSize(this.fontSize)
      .setAlign('center')
      .setTint(0xffffff);
    text.setText(value);
    text.setScale(this.scale);
    this.text = text;
  }

  setScale(scale: number) {
    this.scale = scale;
    this.text?.setScale(scale);
    this.sprite?.setScale(scale);
  }

  setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
    this.text?.setVisible(visible);
  }
}
