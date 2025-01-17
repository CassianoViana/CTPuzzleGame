import Phaser from 'phaser';


export class inputHandler {
    constructor(private scene: Phaser.Scene) {}
  
    enableDrag(polygon: Phaser.GameObjects.Polygon) {
      polygon.setInteractive();
      this.scene.input.setDraggable(polygon);
  
      polygon.on('drag', (pointer, dragX, dragY) => {
        polygon.x = dragX;
        polygon.y = dragY;
      });
    }
  }