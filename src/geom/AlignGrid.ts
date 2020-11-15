import { Scene } from "phaser";
import { isDebug } from "../utils/Utils";

export default class AlignGrid {

    scene: Scene;
    cols: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    graphics: Phaser.GameObjects.Graphics;
    width: number = 600;
    height: number = 600;
    scale: number;

    constructor(scene: Scene, cols: number = 3, rows: number = 3, width: number, height: number) {
        this.scene = scene;
        this.cols = cols;
        this.rows = rows;
        this.width = width;
        this.height = height;
        this.cellWidth = this.width / cols;
        this.cellHeight = this.height / rows;
        if (isDebug(scene)) {
            this.show(0.3);
        }
    }

    getCenterCell(): Phaser.Geom.Point {
        return this.getCell(this.rows / 2, this.cols / 2)
    }

    show(alpha = 1) {
        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(2, 0xff0000, alpha);

        let pointy = this.cellHeight;
        let pointx = this.cellWidth;

        for (let y = 0; y < this.height / this.cellHeight; y++) {
            this.graphics.moveTo(0, pointy);
            this.graphics.lineTo(this.width, pointy);
            this.scene.add.text(0, pointy - this.cellHeight, `${y}`)
            pointy += this.cellHeight;
        }

        for (let x = 0; x < this.width / this.cellWidth; x++) {
            this.graphics.moveTo(pointx, 0);
            this.graphics.lineTo(pointx, this.height);
            this.scene.add.text(pointx - this.cellWidth, 0, `${x}`)
            pointx += this.cellWidth;
        }

        this.graphics.strokePath();
    }

    addImage(x: number, y: number, key: string, colspan: number = null, rowspan: number = null): Phaser.GameObjects.Image {
        let image = this.scene.add.image(0, 0, key);
        this.placeAt(x, y, image, colspan, rowspan);
        return image;
    }

    getCell(cellHorizontalNumber: number, cellVerticalNumber: number): Phaser.Geom.Point {
        let x = this.cellWidth * cellHorizontalNumber;
        let y = this.cellHeight * cellVerticalNumber;
        return new Phaser.Geom.Point(x, y);
    }
    
    getArea(cellHorizontalNumber: number, cellVerticalNumber: number, colspan: number, rolspan: number): Phaser.Geom.Rectangle {
        const cell = this.getCell(cellHorizontalNumber, cellVerticalNumber);
        return new Phaser.Geom.Rectangle(
            cell.x,
            cell.y,
            this.cellWidth * colspan,
            this.cellHeight * rolspan);
    }

    placeAt(cellHorizontalNumber: number, cellVerticalNumber: number, obj: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, colspan: number = null, rowspan: number = null) {
        if (obj != null) {
            const point: Phaser.Geom.Point = this.getCell(cellHorizontalNumber, cellVerticalNumber)
            if (colspan) {
                obj.displayWidth = this.cellWidth * colspan;
            }
            if (rowspan) {
                obj.displayHeight = this.cellHeight * rowspan;
            } else {
                obj.displayHeight = obj.height / obj.width * obj.displayWidth
            }
            if (!this.scale) {
                this.scale = obj.displayWidth / obj.width;
            }
            obj.setPosition(point.x + obj.displayWidth / 2, point.y + obj.displayHeight / 2);
        }
    }

}