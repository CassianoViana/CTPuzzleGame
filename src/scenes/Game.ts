import { GameObjects, Types, Scene } from 'phaser'
import { MatrixMode } from '../geom/Matrix'
import Dude from '../sprites/Dude'
import { DudeMove } from "../sprites/DudeMove"
import Program from '../program/Program'
import CodeEditor, { CodeEditorOptions } from '../controls/CodeEditor'
import Sounds from '../sounds/Sounds'
import MazeModel, { MazeModelObject } from '../game/MazeModel'
import AlignGrid from '../geom/AlignGrid'
import MazePhasesLoader from '../phases/MazePhasesLoader'
import MazePhase from '../phases/MazePhase'
import { Logger } from '../main'
import { globalSounds } from './PreGame'
import GameParams from '../settings/GameParams'
import TestApplicationService from '../test-application/TestApplicationService'
import GameState from './GameState'
import { Mapa, Obstaculo } from '../ct-platform-classes/MecanicaRope'
import { MyGameObject } from './MyGameObject'
import { Block } from './Block'
import { Battery } from './Battery'
import { Coin } from './Coin'
import { Tile } from './Tile'

export const DEPTH_OVERLAY_PANEL_TUTORIAL = 50

export default class Game extends Scene {

  codeEditor: CodeEditor
  currentObject: GameObjects.Image;
  dude: Dude
  sounds: Sounds
  cursors: Types.Input.Keyboard.CursorKeys
  obstaclesMazeModel: MazeModel
  groundMazeModel: MazeModel
  grid: AlignGrid
  mode: MatrixMode = MatrixMode.ISOMETRIC
  phases: MazePhasesLoader
  currentPhase: MazePhase
  gameParams: GameParams
  testApplicationService: TestApplicationService
  gameState: GameState
  loadingText: GameObjects.Text

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('arrow-up', 'assets/ct/arrow_up.png');
    this.load.image('arrow-down', 'assets/ct/arrow_down.png');
    this.load.image('arrow-right', 'assets/ct/arrow_right.png');
    this.load.image('arrow-left', 'assets/ct/arrow_left.png');
    this.load.image('background', 'assets/ct/radial_gradient.png');
    this.load.image('tile', `assets/ct/tile_${this.mode}.png`);
    this.load.image('toolbox', 'assets/ct/toolbox.png');
    this.load.image('x', 'assets/ct/x.png');
    this.load.image('block', `assets/ct/obstacle_orange_${this.mode}.png`);
    this.load.image('prog_0', 'assets/ct/prog_0.png');
    this.load.image('prog_1', 'assets/ct/prog_1.png');
    this.load.image('prog_2', 'assets/ct/prog_2.png');
    this.load.image('battery', 'assets/ct/battery.png');
    this.load.image('intention_comamnd', 'assets/ct/intention_comamnd.png');
    this.load.image('if_coin', 'assets/ct/if_coin.png');
    this.load.image('if_block', 'assets/ct/if_block.svg');
    this.load.image('if_highlight', 'assets/ct/if_highlight.png');
    this.load.image('ballon', 'assets/ct/ballon.png');
    this.load.image('tutorial-block-click-background', 'assets/ct/tutorial-block-click-background.png');
    this.load.image('tutorial-drop-indicator', 'assets/ct/tutorial_drop_indicator.png');

    this.load.spritesheet('btn-play', 'assets/ct/btn_play.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-stop', 'assets/ct/btn_stop.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-step', 'assets/ct/btn_step.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 541, frameHeight: 105 });
    this.load.spritesheet('tile-drop-zone', 'assets/ct/tile_drop_zone.png', { frameWidth: 79, frameHeight: 69 });
    this.load.spritesheet('sprite-rope-NORMAL', 'assets/ct/rope_walk_NORMAL.png', { frameWidth: 65, frameHeight: 89 });
    this.load.spritesheet('sprite-rope-ISOMETRIC', 'assets/ct/rope_walk_ISOMETRIC.png', { frameWidth: 97.5, frameHeight: 111 });
    this.load.spritesheet('coin-gold', 'assets/ct/coin_gold.png', { frameWidth: 92, frameHeight: 124 });
    this.load.spritesheet('battery-sprite', 'assets/ct/battery_sprite.png', { frameWidth: 92, frameHeight: 148 });
    this.load.spritesheet('block-sprite', 'assets/ct/block_sprite.png', { frameWidth: 92, frameHeight: 81 });
    this.load.spritesheet('trash', 'assets/ct/trash.png', { frameWidth: 632, frameHeight: 415 });
    this.load.spritesheet('hand-tutorial', 'assets/ct/hand_tutorial.png', { frameWidth: 134, frameHeight: 176 });
    this.load.spritesheet('hand-tutorial-drag', 'assets/ct/hand_tutorial_drag.png', { frameWidth: 77, frameHeight: 101 });
  }

  init(data: GameParams) {
    this.gameParams = data
    this.testApplicationService = new TestApplicationService(this.gameParams)
    this.gameState = new GameState()
  }

  async create() {
    this.sounds = globalSounds
    this.createGrid(26, 22)

    this.grid.addImage(0, 0, 'background', this.grid.cols, this.grid.rows);
    this.input.setDefaultCursor('pointer');
    this.codeEditor = new CodeEditor(this, this.sounds, this.grid);

    this.showLoading();
    this.phases = await this.loadPhases();
    this.hideLoading();

    this.createAnimationsAndDefineSpritesByKeys();

    this.obstaclesMazeModel.onChange = () => {
      if (this.obstaclesMazeModel.count('coin') == 0) {
        this.dude.stop(true)
        this.dude.playSuccess();
        this.codeEditor.disableStepButton();
        this.codeEditor.unhighlightStepButton();
        setTimeout(() => {
          this.playNextPhase();
        }, 2000);
      }
    }

    this.obstaclesMazeModel.onOverlap = (x: number, y: number, other: MazeModelObject) => {
      let waitALittleBitBeforeColide = 700
      let obj = this.obstaclesMazeModel.getObjectAt(y, x);
      if (other.obstacleName == 'battery') {
        setTimeout(() => {
          this.dude.increaseBatteryLevel();
          this.obstaclesMazeModel.removeAt(y, x, obj);
          this.sounds.coin();
        }, waitALittleBitBeforeColide);
      }
      if (other.obstacleName == 'coin') {
        setTimeout(() => {
          this.obstaclesMazeModel.removeAt(y, x, obj);
          /* other.setGravityY(-200);
          other.setVelocityY(-100) */
          this.sounds.coin();
        }, waitALittleBitBeforeColide);
      }
    }

    this.dude = new Dude(this, this.mode, this.sounds, this.grid);
    this.dude.character.setScale(this.grid.scale)
    this.dude.character.displayOriginY = this.dude.character.height * 0.65;

    this.dude.canMoveTo = (x: number, y: number) => {
      let ground = this.currentPhase.ground;
      let can = true;
      let point = ground.getPoint(y, x);
      let modelObject = this.obstaclesMazeModel.getObjectAt(y, x)
      let isNotHole = ground.getKey(y, x) != 'null';
      const isNotOutOfBounds = point != null && point
      const isNotBlock = modelObject?.obstacleName != 'block'
      can = isNotOutOfBounds && isNotBlock && isNotHole
      Logger.log('CAN_MOVE_TO [x, y, can]', x, y, can)
      if (!isNotBlock) {
        const block = modelObject.myGameObject as Block
        block.breakMore()
        if (block.isBroken()) {
          this.obstaclesMazeModel.remove(modelObject);
        }
      }
      return can
    }

    this.dude.isConditionValid = (condition: string, dudeMove: DudeMove) => {
      let valid = true;
      if (condition.startsWith('if_')) {
        const command = condition.replace('if_', '');
        //if (command == 'coin' || command == 'block') {
        let { x, y } = dudeMove.getAheadPosition();
        valid = this.obstaclesMazeModel.getObjectNameAt(y, x) == command
        if (valid) {
          (this.obstaclesMazeModel.getObjectAt(y, x).myGameObject).setTint(0xccff00);
        }
        //}
      }
      return valid
    }

    this.dude.onCompleteMoveCallback = (current: DudeMove) => {
      if (this.dude.stepByStep) {
        if (!this.dude.stopped) {
          this.codeEditor.enableStepButton();
          this.codeEditor.highlightStepButton();
          this.currentPhase?.updateTutorial();
        }
      }
      this.obstaclesMazeModel.onChange();
      //this.mazeModel.updateBringFront();
    }

    this.dude.onRunOutOfEnergyCallback = () => {
      this.replayCurrentPhase();
    }

    this.dude.onTryStartCheckIfHasEnergy = () => {
      let hasEnergy = this.dude.getBatteryLevel() > 0;
      this.dude.decreaseBatteryLevel();
      return hasEnergy;
    }

    this.dude.onStartMoveCallback = (x: number, y: number, currentDestine: DudeMove) => {
      this.codeEditor.disableStepButton();
      this.codeEditor.disablePlayButton();
      this.codeEditor.unhighlightStepButton();
      this.obstaclesMazeModel.putSprite(x, y, undefined);
      if (currentDestine) {
        if (currentDestine.couldExecute) {
          //this.dude.character.depth = 0;
          this.obstaclesMazeModel.putSprite(currentDestine.x, currentDestine.y, this.dude.character, 'rope')
        }
      }
      this.obstaclesMazeModel.updateBringFront();
    }


    this.dude.onFinishWalking = () => {
      this.codeEditor.unhighlightStepButton();
      if (this.obstaclesMazeModel.count('coin') > 0) {
        this.dude.stop(true);
        this.sounds.error();
        this.replayCurrentPhase();
      }
    }

    this.codeEditor.onClickRun = () => {
      if (this.dude.stopped) {
        this.gameState.registerAddedCommands(this.codeEditor.getCommandsAsString())
        this.dude.execute(this.codeEditor.programs);
      }
    }

    /* this.codeEditor.onEditProgram = () => {
      if (!this.dude.stopped) {
        this.replayCurrentPhase()
      }
    } */

    this.codeEditor.onInteract = () => {
      if (!this.dude.stopped) {
        this.replayCurrentPhase()
      }
    }

    this.codeEditor.onReplayCurrentPhase = () => {
      this.replayCurrentPhase();
    }

    this.codeEditor.onClickStepByStep = () => {
      this.codeEditor.disableStepButton();
      this.dude.executeStepByStep(this.codeEditor.programs);
    }

    this.codeEditor.onClickStop = () => {
      let resetFace = true;
      this.dude.stop(resetFace);
      this.replayCurrentPhase();
    }

    this.codeEditor.onShowInstruction = (instruction: string) => {
      this.dude.setBallonText(instruction);
    }

    this.codeEditor.onHideLastInstruction = () => {
      this.dude.hideBallon();
    }

    this.playNextPhase();
  }

  async loadPhases(): Promise<MazePhasesLoader> {
    let gridCenterX = this.grid.width / 3.2;
    let gridCenterY = this.grid.height / 2;
    let gridCellWidth = this.grid.cellWidth * 1.1

    return (await new MazePhasesLoader(
      this,
      this.grid,
      this.codeEditor,
      MatrixMode.ISOMETRIC,
      gridCenterX,
      gridCenterY,
      gridCellWidth
    ).load(this.gameParams));
  }

  createAnimationsAndDefineSpritesByKeys() {
    this.createAnimations()
    const spriteCreateFunctions = this.createSpriteCreationFunctions();
    this.groundMazeModel = new MazeModel(this, spriteCreateFunctions, DEPTH_OVERLAY_PANEL_TUTORIAL + 1);
    this.obstaclesMazeModel = new MazeModel(this, spriteCreateFunctions, DEPTH_OVERLAY_PANEL_TUTORIAL + 100);
  }

  private createSpriteCreationFunctions() {
    let scale = this.grid.scale;
    let spriteCreateFunctions: Map<Obstaculo | Mapa, (x: integer, y: integer) => MyGameObject> = new Map();

    spriteCreateFunctions.set('block', (x: integer, y: integer) => {
      return new Block(x, y, scale, this)
    })

    spriteCreateFunctions.set('tile', (x: integer, y: integer) => {
      return new Tile(x, y, this, scale)
    })

    spriteCreateFunctions.set('battery', (x: integer, y: integer) => {
      return new Battery(x, y, this, scale);
    })

    spriteCreateFunctions.set('coin', (x: integer, y: integer) => {
      return new Coin(x, y, this, scale);
    })

    return spriteCreateFunctions;
  }

  private createAnimations() {
    this.anims.create({
      key: 'block-sprite',
      frames: this.anims.generateFrameNumbers('block-sprite', { start: 0, end: 4 }),
      frameRate: 0,
      repeat: 0
    })
    this.anims.create({
      key: 'battery-sprite',
      frames: this.anims.generateFrameNumbers('battery-sprite', { start: 0, end: 5 }),
      frameRate: 7,
      repeat: -1
    })
    this.anims.create({
      key: 'gold-spining',
      frames: this.anims.generateFrameNumbers('coin-gold', { start: 0, end: 5 }),
      frameRate: 7,
      repeat: -1
    })
  }

  private showLoading() {
    let gridCenterX = this.grid.width / 3.2;
    let gridCenterY = this.grid.height / 2;
    let loadingText = this.add.text(
      gridCenterX,
      gridCenterY,
      'Loading...', {
      fontSize: '30pt'
    })
      .setScale(this.grid.scale);
    loadingText.setX(loadingText.x - loadingText.width / 2)
    this.loadingText = loadingText;
  }

  private hideLoading() {
    this.children.remove(this.loadingText)
  }

  private createGrid(cols: number, rows: number) {
    this.grid = new AlignGrid(
      this, cols, rows,
      this.game.config.width as number,
      this.game.config.height as number
    )
  }

  update() {
    this.dude?.update()
  }

  playNextPhase() {
    const phase = this.phases.getNextPhase();
    this.playPhase(phase, { clear: true });
  }

  replayCurrentPhase() {
    let clearCodeEditor = this.currentPhase?.isTutorialPhase();
    this.dude.stop(true);
    this.playPhase(this.currentPhase, { clear: clearCodeEditor } as CodeEditorOptions)
  }

  async playPhase(phase: MazePhase, codeEditorOptions: CodeEditorOptions) {

    if (phase != this.currentPhase) {
      if (!this.codeEditor.programs) {
        let prog0 = new Program(this, 'prog_0', this.grid, 18.4, 11, 7, 2.3, 'drop-zone');
        let prog1 = new Program(this, 'prog_1', this.grid, 18.4, 14.5, 7, 2.3, 'drop-zone');
        let prog2 = new Program(this, 'prog_2', this.grid, 18.4, 18, 7, 2.3, 'drop-zone');
        this.codeEditor.setPrograms([
          prog0,
          prog1,
          prog2
        ])
      }
      this.sendResponse(phase);
    }

    this.currentPhase?.clearTutorials()
    this.currentPhase = phase

    if (this.currentPhase) {
      this.testApplicationService.saveCurrentPlayingPhase(this.currentPhase.itemId)
    }
    if (!this.currentPhase) {
      this.scene.start('game-win', this.testApplicationService);
    }

    if (this.currentPhase) {

      this.currentPhase.setupMatrixAndTutorials()
      this.dude.matrix = this.currentPhase.obstacles;
      const obstacles = this.currentPhase.obstacles
      const ground = this.currentPhase.ground

      this.groundMazeModel.clear();
      this.obstaclesMazeModel.clearKeepingInModel(this.dude.character);
      this.groundMazeModel.setMatrixOfObjects(ground);
      this.obstaclesMazeModel.setMatrixOfObjects(obstacles);

      let { row, col } = this.currentPhase.dudeStartPosition;
      this.obstaclesMazeModel.putSprite(col, row, this.dude.character, 'rope')
      this.dude.setPosition(col, row);
      this.obstaclesMazeModel.updateBringFront();

      this.dude.currentFace = this.currentPhase.dudeFacedTo
      this.dude.setFacedTo(this.currentPhase.dudeFacedTo);

      this.dude.setBatteryLevel(this.currentPhase.batteryLevel);
      this.dude.setBatteryCostOnMove(this.currentPhase.batteryDecreaseOnEachMove);
      this.dude.setBatteryGainOnCharge(this.currentPhase.batteryGainOnCapture);

      this.codeEditor.prepare(codeEditorOptions);
      this.currentPhase.showTutorialActionsIfExists();
    }

    // prog0.clear();
    // prog1.clear();
    // prog2.clear();
    // this.codeEditor.addCommands(prog0, ['arrow-up', 'arrow-up:if_block', 'arrow-up', 'prog_0'])
    // this.codeEditor.addCommands(prog1, ['arrow-up'])
    // this.codeEditor.addCommands(prog2, ['arrow-right', 'arrow-up', 'arrow-up', 'arrow-right', 'prog_1'])
  }

  async sendResponse(phase: MazePhase) {
    if (this.gameParams.isTestApplication()) {
      try {
        if (this.currentPhase) {
          const response = this.gameState.getResponseToSend()
          await this.testApplicationService.sendResponse(response);
        }
        if (phase) {
          this.gameState.initializeResponse(phase.itemId);
        }
      } catch (e) {
        Logger.log('ErrorSendingResponse', e)
        Logger.error(e);
        this.replayCurrentPhase()
        return;
      }
    }
  }
}
