import { GameObjects } from "phaser";
import { Mapa, Obstaculo } from "../ct-platform-classes/MecanicaRope";
import Matrix from "../geom/Matrix";
import { Logger } from "../main";
import { Block } from "../scenes/Block";
import { MyGameObject } from "../scenes/MyGameObject";

export class MazeModelObject {
  depth: number;
  myGameObject: MyGameObject;
  obstacleName: Obstaculo

  constructor(gameObject: MyGameObject, spriteName: Obstaculo) {
    this.myGameObject = gameObject;
    this.obstacleName = spriteName;
  }
}

export default class MazeModel {

  gameObjects: MazeModelObject[][]
  matrix: Matrix;
  scene: Phaser.Scene;
  obstaclesMatrix: Obstaculo[][];
  spriteCreateFunctions: Map<Obstaculo | Mapa, (x: integer, y: integer) => MyGameObject>;
  onOverlap: (x: number, y: number, other: MazeModelObject) => void;
  onChange: () => void = () => { };
  depth: number;

  constructor(
    scene: Phaser.Scene,
    spriteCreateFunctions: Map<Obstaculo | Mapa, (x: integer, y: integer) => MyGameObject>,
    depth: number) {
    this.scene = scene;
    this.gameObjects = []
    this.spriteCreateFunctions = spriteCreateFunctions;
    this.depth = depth;
  }

  setMatrixOfObjects(matrix: Matrix) {
    this.obstaclesMatrix = matrix.matrix as Obstaculo[][];
    this.matrix = matrix;
    this.buildObjectsModel();
    this.updateBringFront();
  }

  private buildObjectsModel() {
    for (let y = 0; y < this.matrix.height; y++) {
      if (!this.gameObjects[y]) {
        this.gameObjects[y] = [];
      }
      for (let x = 0; x < this.matrix.width; x++) {
        const spriteNumber = this.obstaclesMatrix[y][x];
        let spriteCreateFn = this.spriteCreateFunctions.get(spriteNumber);
        if (spriteCreateFn) {
          // Cria os objeto e adiciona no ponto
          const point = this.matrix.points[y][x];
          const gameObject = spriteCreateFn(point.x, point.y);
          this.gameObjects[y][x] = new MazeModelObject(gameObject, spriteNumber);
        }
      }
    }
  }

  getObjectAt(y: number, x: number): MazeModelObject {
    let object: MazeModelObject = null
    let row = this.gameObjects[y];
    if (row) {
      object = row[x]
    }
    return object
  }

  updateBringFront() {
    if (this.matrix.mode == Matrix.MODE_ISOMETRIC) {
      this.updateIsometric()
    }
    if (this.matrix.mode == Matrix.MODE_NORMAL) {
      this.updateByZIndex()
    }
  }

  private updateIsometric() {

    let diagonalsToPass = (this.matrix.height + this.matrix.width) - 1;
    let itensDiagonalToPass = 1;
    let depth = this.depth;
    for (let diagonalsPassed = 0; diagonalsPassed < diagonalsToPass;) {
      let y = diagonalsPassed;
      let x = 0;
      for (let itensDiagonalPassed = 0; itensDiagonalPassed < itensDiagonalToPass; itensDiagonalPassed++) {
        let object = this.getObjectAt(y, x);
        if (object) {
          Logger.log('MAZE_MODEL_ORDERING [y,x,object,depth]', y, x, object.obstacleName, depth);
          (object.myGameObject).setDepth(depth)
          //this.scene.children.bringToTop(object.gameObject);
        }
        x++;
        y--;
      }
      depth++;
      diagonalsPassed++;
      itensDiagonalToPass++;
    }

    this.logMatrix();
  }

  logMatrix() {
    let logMatrix = '\n';
    for (let y = 0; y < this.matrix.height; y++) {
      for (let x = 0; x < this.matrix.width; x++) {
        let c = ' ';
        let object = this.getObjectAt(y, x);
        let depth: number = 0;
        if (object) {
          depth = (object.myGameObject).getDepth()
          c = this.obstaclesMatrix[y][x];
        }
        logMatrix += `${c.substring(0, 1)}[${depth}] `;
      }
      logMatrix += '\n';
    }
    Logger.log('GAME_OBJECTS', logMatrix)
  }

  private updateByZIndex() {
    /* let logMatrix = '\n';
    for (let y = 0; y < this.matrix.height; y++) {
      for (let x = 0; x < this.matrix.width; x++) {
        let c = '-';
        let object = this.gameObjects[y][x];
        if (object) {
          c = this.obstaclesMatrix[y][x].toString();
          this.scene.children.bringToTop(object);
        }
        logMatrix += c + ' ';
      }
      logMatrix += '\n';
    }
    Logger.log('GAME_OBJECTS', logMatrix) */
  }

  putSprite(x: number, y: number, sprite: GameObjects.GameObject, spriteName: Obstaculo = null) {
    const existentObjectOnPosition = this.getObjectAt(y, x);
    if (sprite) {
      if (existentObjectOnPosition) {
        this.onOverlap(x, y, existentObjectOnPosition);
      }
    }
    let object: MazeModelObject = null;
    if (sprite) {
      object = new MazeModelObject(new MyGameObject(sprite), spriteName)
    }
    this.gameObjects[y][x] = object
  }

  count(spriteName: Obstaculo) {
    let count = 0;
    for (let y = 0; y < this.matrix.height; y++) {
      for (let x = 0; x < this.matrix.width; x++) {
        let object = this.getObjectAt(y, x);
        if (object) {
          if (object.obstacleName == spriteName) {
            count++;
          }
        }
      }
    }
    return count
  }

  clear() {
    this.clearKeepingInModel(null)
  }

  clearKeepingInModel(keepInModel: GameObjects.GameObject) {
    if (this.matrix) {
      for (let y = 0; y < this.matrix.height; y++) {
        for (let x = 0; x < this.matrix.width; x++) {
          let object = this.getObjectAt(y, x);
          if (object) {
            if (object.myGameObject.gameObject != keepInModel) {
              this.removeObject(object.myGameObject)
            }
            this.gameObjects[y][x] = null;
          }
        }
      }
    }
  }

  getObjectNameAt(y: number, x: number): string {
    return this.getObjectAt(y, x)?.obstacleName
  }

  remove(modelObject: MazeModelObject) {
    if (this.matrix) {
      for (let y = 0; y < this.matrix.height; y++) {
        for (let x = 0; x < this.matrix.width; x++) {
          let object = this.getObjectAt(y, x);
          if (object) {
            if (object == modelObject) {
              this.removeAt(y, x, object)
              return;
            }
          }
        }
      }
    }
  }

  removeAt(y: number, x: number, modelObject: MazeModelObject) {
    this.removeObject(modelObject.myGameObject)
    this.gameObjects[y][x] = null;
  }

  removeObject(myGameObject:MyGameObject){
    myGameObject.removeSelf(this.scene)
  }

}
