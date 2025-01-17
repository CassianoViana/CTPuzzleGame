import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { Logger } from "../main";

export class RunOutOfEnergyError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, RunOutOfEnergyError.prototype);
  }
}

export class DudeBattery {


  scene: Scene;
  grid: AlignGrid;
  batteryImage: Phaser.GameObjects.Image;
  graphics: Phaser.GameObjects.Graphics;
  maxCells: number = 10;
  level: number;
  text: Phaser.GameObjects.Text;
  onChangeBatteryLevel: () => void = () => { };

  constructor(scene: Scene, grid: AlignGrid) {
    this.scene = scene;
    this.grid = grid;
    this.batteryImage = this.grid.addImage(12.5, 0.5, 'battery', 4, 1);
    this.graphics = scene.add.graphics()
  }

  animateRunOutEnergy() {
    this.batteryImage.setTint(0xff0000);
  }

  increase(energy: number = 1) {
    let newLevel = this.level + energy;
    if (newLevel > this.maxCells) {
      newLevel = this.maxCells;
    }
    this.setLevel(newLevel)
  }

  decrease(batteryCost: number) {
    let newLevel = this.level - batteryCost
    if (newLevel < 0) {
      throw new RunOutOfEnergyError('Acabou a energia')
    }
    this.setLevel(newLevel);
  }

  setLevel(level: number, maxCells = this.maxCells, cellMargin: number = 0) {
    if (level > maxCells) {
      level = maxCells;
      Logger.warn('Cannot set level greater than battery capacity. Ajusted to ', maxCells)
    }
    this.batteryImage.clearTint();
    this.graphics.clear();
    this.level = level;
    cellMargin = cellMargin * this.grid.scale;
    this.maxCells = maxCells;
    this.setColorByLevel(level / maxCells);

    const width = this.batteryImage.displayWidth
    const height = this.batteryImage.displayHeight;

    const cellWidth = (width * 0.86 / this.maxCells) - cellMargin;

    let firstX = this.batteryImage.x - width / 2;
    let y = this.batteryImage.y - height / 2;

    this.setText(firstX, y, `${(level / maxCells * 100).toFixed(0)}% `);

    let countCells = 0;
    for (let x = firstX; countCells < level; x += cellWidth + cellMargin) {
      let radius = { tl: cellMargin, tr: cellMargin, bl: cellMargin, br: cellMargin }
      if (countCells == 0) {
        radius.tl = 5;
        radius.bl = 5;
      }
      this.graphics.fillRoundedRect(
        x + height * 0.1,
        y + height * 0.1,
        cellWidth,
        height * 0.8,
        radius);
      countCells++;
    }

  }
  setText(x: number, y: number, text: string) {
    if (!this.text) {
      let padding = 10 * this.grid.scale
      this.text = this.scene.add.text(x + padding * 2, y + padding, text, {})
    }
    this.text.setText(text)
      .setScale(this.grid.scale)
      .setFontFamily('Dyuthi, sans-serif')
      //.setFontStyle('bold')
      .setFontSize(35)
      .setAlign('center')
      .setDepth(101)
      .setTint(0x0b360e)
  }

  isRunningOut() {
    let percentLevel = this.level / this.maxCells;
    return percentLevel <= 0.1
  }

  setColorByLevel(percentLevel: number) {

    this.graphics.setDepth(1)
    this.batteryImage.setDepth(2);
    this.graphics.fillStyle(0x21fd44, 1);
    /* if (percentLevel < 0.7) {
      this.graphics.fillStyle(0xc60502, 1);
    }
    if (percentLevel < 0.4) {
      this.graphics.fillStyle(0xd67120, 1);
    } */
    this.onChangeBatteryLevel();
    if (this.isRunningOut()) {
      this.graphics.fillStyle(0xfe2222, 1);
      this.graphics.setDepth(2)
      this.batteryImage.setDepth(1);
    }
  }
}
