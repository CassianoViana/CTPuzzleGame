import { GameObjects, Types, Scene } from 'phaser'
import { MatrixMode } from '../geom/Matrix'
import Dude from '../sprites/Dude'
import { DudeMove } from "../sprites/DudeMove"
import Program from '../program/Program'
import CodeEditor, { PlayPhaseOptions } from '../controls/CodeEditor'
import Sounds from '../sounds/Sounds'
import MazeModel, { MazeModelObject } from '../game/MazeModel'
import AlignGrid from '../geom/AlignGrid'
import MazePhasesLoader from '../phases/MazePhasesLoader'
import MazePhase, { CommandName } from '../phases/MazePhase'
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
import MessageBox from '../sprites/MessageBox'
import Button from '../controls/Button'
import Command from '../program/Command'

export const DEPTH_OVERLAY_PANEL_TUTORIAL = 50

export default class Game extends Scene {

  //private polygons: Phaser.GameObjects.Polygon[] = [];
  codeEditor: CodeEditor
  currentObject: GameObjects.Image;
  dude: Dude
  sounds: Sounds
  cursors: Types.Input.Keyboard.CursorKeys
  obstaclesMazeModel: MazeModel
  groundMazeModel: MazeModel
  grid: AlignGrid
  mode: MatrixMode = MatrixMode.ISOMETRIC
  phasesLoader: MazePhasesLoader
  currentPhase: MazePhase
  gameParams: GameParams
  testApplicationService: TestApplicationService
  gameState: GameState
  loadingText: GameObjects.Text
  messageBox: MessageBox
  textCurrentPhase: GameObjects.Text

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
    this.load.image('grass', `assets/ct/grass.png`);
    this.load.image('asphalt', `assets/ct/asphalt.png`);
    this.load.image('toolbox', 'assets/ct/toolbox.png');
    this.load.image('x', 'assets/ct/x.png');
    this.load.image('block', `assets/ct/obstacle_orange_${this.mode}.png`);
    this.load.image('prog_0', 'assets/ct/prog_0.png');
    this.load.image('prog_1', 'assets/ct/prog_1.png');
    this.load.image('prog_2', 'assets/ct/prog_2.png');
    this.load.image('prog_0_fnName', 'assets/ct/prog_0_fnName.png');
    this.load.image('prog_1_fnName', 'assets/ct/prog_1_fnName.png');
    this.load.image('prog_2_fnName', 'assets/ct/prog_2_fnName.png');
    this.load.image('battery', 'assets/ct/battery.png');
    this.load.image('message_box', 'assets/ct/message.png');
    this.load.image('intention_comamnd', 'assets/ct/intention_comamnd.png');
    this.load.image('if_coin', 'assets/ct/if_coin.png');
    this.load.image('if_block', 'assets/ct/if_block.png');
    this.load.image('if_highlight', 'assets/ct/if_highlight.png');
    this.load.image('ballon', 'assets/ct/ballon.png');
    this.load.image('tutorial-block-click-background', 'assets/ct/tutorial-block-click-background.png');
    this.load.image('tutorial-drop-indicator', 'assets/ct/tutorial_drop_indicator.png');

    //novo
    this.load.spritesheet('btn-play-2', 'assets/ct/giro_teste.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('giro', 'assets/ct/giro_teste.png', { frameWidth: 100, frameHeight: 100 });
    //giro
    this.load.spritesheet('giroleft', 'assets/ct/giro_left.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('giroright', 'assets/ct/giro_right.png', { frameWidth: 100, frameHeight: 100 });
    //

    this.load.spritesheet('btn-play', 'assets/ct/btn_play.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-exit', 'assets/ct/btn_exit.png', { frameWidth: 81, frameHeight: 96 });
    this.load.spritesheet('btn-jump', 'assets/ct/btn_jump.png', { frameWidth: 81, frameHeight: 96 });
    this.load.spritesheet('btn-restart', 'assets/ct/btn_restart.png', { frameWidth: 81, frameHeight: 96 });
    this.load.spritesheet('btn-music', 'assets/ct/btn_music.png', { frameWidth: 81, frameHeight: 96 });
    this.load.spritesheet('btn-speed', 'assets/ct/btn_speed.png', { frameWidth: 81, frameHeight: 96 });
    this.load.spritesheet('btn-ok', 'assets/ct/btn_ok.png', { frameWidth: 278, frameHeight: 123 });
    this.load.spritesheet('btn-cancel', 'assets/ct/btn_cancel.png', { frameWidth: 194, frameHeight: 123 });
    this.load.spritesheet('btn-close-message', 'assets/ct/btn_close_message.png', { frameWidth: 68, frameHeight: 69 });
    this.load.spritesheet('btn-stop', 'assets/ct/btn_stop.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-step', 'assets/ct/btn_step.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 649, frameHeight: 108 });
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

    this.grid = new AlignGrid(this, 26, 22, this.game.config.width as number, this.game.config.height as number);

    this.grid.show(0.4);

    this.grid.showPoints();

    this.grid.addImage(0, 0, 'background', this.grid.cols, this.grid.rows);
    this.input.setDefaultCursor('pointer');
    this.codeEditor = new CodeEditor(this, this.sounds, this.grid);
    this.messageBox = new MessageBox(this, this.grid)
    this.messageBox.onFinishTalk = () => {
      let isReplaying = this.gameState.isReplayingPhase(this.currentPhase.itemId)
      this.playPhase(this.currentPhase, { muteInstructions: true, clearResponseState: !isReplaying })
    }

    this.showLoading();
    this.phasesLoader = await this.loadPhases();
    this.hideLoading();

    this.createAnimationsAndDefineSpritesByKeys();

    //Aqui identifica que finalizou a fase
    this.obstaclesMazeModel.onChange = () => {
      if (this.obstaclesMazeModel.count('coin') == 0) {
        this.dude.stop(true)
        this.dude.playSuccess();
        this.codeEditor.unhighlightStepButton();
        this.sendResponse({ setFinished: true })
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
          //this.obstaclesMazeModel.onChange()
          this.sounds.coin();
        }, waitALittleBitBeforeColide);
      }
    }

    this.dude = new Dude(this, this.mode, this.sounds, this.grid);
    this.dude.character.destroy();
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
      this.gameState.pushMove({ x: current.x, y: current.y })
      if (this.dude.stepByStep) {
        if (!this.dude.stopped) {
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
      this.codeEditor.setPlayBtnModeStopped();
      let waitBeforeRestart = 1000
      if (this.obstaclesMazeModel.count('coin') > 0) {
        this.dude.stop(true);
        setTimeout(() => {
          this.replayCurrentPhase();
          this.sounds.error();
        }, waitBeforeRestart)
      }
    }

    //this.grid.show(0.3)
    this.createTextCurrentPhase();
    this.createBtnExit()
    this.createBtnJump()
    this.createBtnRestart()
    this.createBtnMusic()
    this.createBtnSpeed()

    //Aqui está a lógica de quando o botão de play é clicado
    //Trocou de fase sem nenhuma validação. Depois eu devo colocar uma validação
    this.codeEditor.onClickRun = () => {
      this.gameState.registerPlayUse()
      this.sendResponse();
      this.sendResponse({ setFinished: true })
      setTimeout(() => {
        this.playNextPhase();
      }, 2000);

      /*
      if (this.dude.stepByStep) {
        this.dude.continuePlayingWithoutDebug()
      }
      if (this.dude.stopped) {
        this.codeEditor.setPlayBtnModePlaying();
        this.sendResponse();
        this.dude.execute(this.codeEditor.programs);
      }
        */
    }

    this.codeEditor.onRemoveCommand = (command: Command) => {
      this.gameState.registerTrashUse()
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

    //this.codeEditor.setOnBlinkBtnStep((blinked) => {
    //  this.dude.highlightNextMove(blinked)
    //})

    this.codeEditor.onClickStepByStep = () => {
      this.gameState.registerDebugUse()
      this.sounds.click()
      this.codeEditor.setPlayBtnModePlaying();
      this.dude.executeStepByStep(this.codeEditor.programs);
      this.codeEditor.setPlayBtnModeDebugStoped()
      this.sendResponse()
    }

    this.codeEditor.onClickStop = () => {
      this.gameState.registerStopUse()
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

  private createTextCurrentPhase() {
    let cell = this.grid.getCell(0.5, 0.5)
    this.textCurrentPhase =
      this.add.text(cell.x, cell.y, '', { fontFamily: 'Dyuthi, sans-serif' })
        .setScale(this.grid.scale)
        .setFontStyle('bold')
        .setTint(0xf6cf55)
        .setFontSize(35)
  }

  private createBtnExit() {
    let btnExit = new Button(this, this.sounds, 0, 0, 'btn-exit', () => {
      let messageBox = new MessageBox(this, this.grid, { showCancelButton: true })
      messageBox.setText(this.currentPhase.exitPhaseMessage)
      messageBox.onClickOk = () => {
        messageBox.close()
        this.exit()
      }
    })
    this.grid.placeAt(0.5, 14.5, btnExit.sprite, 1.3)
  }

  private createBtnJump() {
    let btnJump = new Button(this, this.sounds, 0, 0, 'btn-jump', () => {
      let messageBox = new MessageBox(this, this.grid, { showCancelButton: true })
      messageBox.setText(this.currentPhase.skipPhaseMessage)
      messageBox.onClickOk = () => {
        messageBox.close()
        this.giveUp()
      }
    })
    this.grid.placeAt(0.5, 8.5, btnJump.sprite, 1.3)
  }


  private createBtnRestart() {
    let btnJump = new Button(this, this.sounds, 0, 0, 'btn-restart', () => {
      let messageBox = new MessageBox(this, this.grid, { showCancelButton: true })
      messageBox.setText(this.currentPhase.restartPhaseMessage)
      messageBox.onClickOk = () => {
        Logger.clear();
        messageBox.close()
        this.gameState.registerRestartUse()
        this.gameState.setReplayingPhase(this.currentPhase.itemId, true)
        this.replayCurrentPhase({
          clearCodeEditor: true,
          muteInstructions: false,
          clearResponseState: false
        })
      }
    })
    this.grid.placeAt(0.5, 17.5, btnJump.sprite, 1.3)
  }

  private createBtnMusic() {
    let btn = new Button(this, this.sounds, 0, 0, 'btn-music', () => {
      const newState = globalSounds.togglePlayingBackgroundMusic()
      this.gameState.setBackgroundMusicEnabled(newState)
    })
    btn.toggle(!this.gameState.isBackgroundMusicEnabled())
    this.grid.placeAt(0.5, 11.5, btn.sprite, 1.3)
  }

  private createBtnSpeed() {
    let btn = new Button(this, this.sounds, 0, 0, 'btn-speed', () => {
      let speedFactor = this.dude.toggleSpeedFactor();
      this.gameState.setSpeedFactor(speedFactor);
    })
    const set2x = this.gameState.isSpeedFactorActivated()
    btn.toggle(set2x)
    this.grid.placeAt(0.5, 5.5, btn.sprite, 1.3)
  }

  exit() {
    if (this.testApplicationService.isTestApplication()) {
      this.startEndScene()
      return;
    }
    this.destroy()
    this.scene.start('pre-game')
  }

  giveUp() {
    this.gameState.registerGiveUp()
    this.playNextPhase();
  }

  destroy() {
    this.currentPhase = null
    globalSounds.stopPlayBackgroundMusic()
  }

  async loadPhases(): Promise<MazePhasesLoader> {
    let gridCenterX = this.grid.width / 3.2;
    let gridCenterY = this.grid.height / 2.4;
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
      return new Tile(x, y, this, scale, 'tile')
    })

    spriteCreateFunctions.set('grass', (x: integer, y: integer) => {
      return new Tile(x, y, this, scale, 'grass')
    })

    spriteCreateFunctions.set('asphalt', (x: integer, y: integer) => {
      return new Tile(x, y, this, scale, 'asphalt')
    })

    spriteCreateFunctions.set('battery', (x: integer, y: integer) => {
      return new Battery(x, y, this, scale, this.currentPhase.batteryGainOnCapture);
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
    if (this.currentPhase) {
      this.gameState.setReplayingPhase(this.currentPhase.itemId, false)
    }
    const phase = this.phasesLoader.getNextPhase();
    this.playPhase(phase, { clearCodeEditor: true, clearResponseState: true });
  }

  replayCurrentPhase(options: PlayPhaseOptions =
    {
      clearCodeEditor: this.currentPhase?.isTutorialPhase(),
      muteInstructions: true
    }) {
    this.dude.stop(true);
    this.playPhase(this.currentPhase, options)
  }

  drawDashedLine(graphics, x1, y1, x2, y2, dashLength, gapLength) {
    const totalLength = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    const dx = (x2 - x1) / totalLength;
    const dy = (y2 - y1) / totalLength;

    let currentLength = 0;
    while (currentLength < totalLength) {
      const nextLength = Math.min(currentLength + dashLength, totalLength);
      const startX = x1 + dx * currentLength;
      const startY = y1 + dy * currentLength;
      const endX = x1 + dx * nextLength;
      const endY = y1 + dy * nextLength;

      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
      currentLength += dashLength + gapLength;
    }
  }

  async desenhaPoligonoDestino(phase: MazePhase) {
    const graphics = this.add.graphics();

    const pontosDestinos = phase.poligonoDestino.map(point => ({ x: point.x, y: point.y }));
    const cor = 0xFFC0CB; // Rosa color

    graphics.lineStyle(2, 0x000000); // Define a cor e a espessura do contorno

    const dashLength = 5; // Comprimento do traço
    const gapLength = 2;   // Comprimento do espaço entre os traços

    //Obtenha a posição da célula na grade
    const gridPosition = this.grid.getCell(7, 2);

    graphics.beginPath();

    for (let i = 0; i < pontosDestinos.length; i++) {
      const start = pontosDestinos[i];
      const end = pontosDestinos[(i + 1) % pontosDestinos.length];
      this.drawDashedLine(graphics, start.x, start.y, end.x, end.y, dashLength, gapLength);
    }

    graphics.strokePath();


    // Ajuste a escala do gráfico
    graphics.setScale(this.grid.scale);

    graphics.setPosition(gridPosition.x, gridPosition.y);


    const rect = new Phaser.Geom.Polygon(pontosDestinos);

    return { graphics, rect };

  }

  async desenhaPoligonos(phase: MazePhase) {
    this.currentPhase = phase;
    if (this.currentPhase) {
      const polygons = this.currentPhase.poligonos;
      polygons.forEach(polygonData => {
        const points = polygonData.pontos.map(point => ({ x: point.x, y: point.y }));
        const color = polygonData.cor || 0xB0E0E6; // Default color if not specified

        if (points.length > 0) {
          const centerX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
          const centerY = points.reduce((sum, point) => sum + point.y, 0) / points.length;

          const polygon = this.add.polygon(centerX, centerY, points, color).setOrigin(0.5, 0.5);
          polygon.setPosition(polygonData.posicao[0].x, polygonData.posicao[0].y);
          polygon.setScale(this.grid.scale);
          this.grid.placeAt(polygonData.posicao[0].x, polygonData.posicao[0].y, polygon);
        }
      });
    }
  }


  private removePoligonos() {
    const polygons = this.children.list.filter(child =>
      child instanceof Phaser.GameObjects.Polygon || child instanceof Phaser.GameObjects.Graphics
    );
    polygons.forEach(polygon => polygon.destroy());
  }

  async playPhase(phase: MazePhase, playPhaseOptions: PlayPhaseOptions) {
    this.playBackgroundMusic()
    if (!phase) {
      if (this.testApplicationService.isPlayground()) {
        this.replayCurrentPhase();
        return;
      }
    }

    if (phase != this.currentPhase) {
      //this.initializeCodeEditorProgrammingAreas()
    }

    this.currentPhase?.clearTutorials()
    this.currentPhase = phase

    if (!this.currentPhase) {
      this.startEndScene();
    }

    if (this.currentPhase) {
      debugger
      let itemId = this.currentPhase.itemId
      //Aqui faz a limpeza do response no console
      if (playPhaseOptions.clearResponseState) {
        this.gameState.initializeResponse(itemId);
      }
      this.testApplicationService.saveCurrentPlayingPhase(itemId)
      this.updateLabelCurrentPhase(itemId)
      const MatrixAndTutorials = this.currentPhase.setupMatrixAndTutorials()

      //remove os poligonos
      this.removePoligonos();

      //desenha o novo poligono
      this.desenhaPoligonoDestino(this.currentPhase);

      //desenha os poligonos
      this.desenhaPoligonos(this.currentPhase);
    }
  }

  private updateLabelCurrentPhase(itemId: number) {
    let label = this.testApplicationService.getCurrentPhaseString(itemId)
    if (!label) {
      label = 'Fases restantes: ' + (this.phasesLoader.phases.length - this.phasesLoader.currentPhase)
    }
    this.textCurrentPhase.setText(label)
  }

  playBackgroundMusic() {
    if (this.gameState.isBackgroundMusicEnabled()) {
      globalSounds.playBackgroundMusic()
    }
  }

  startEndScene() {
    this.destroy();
    this.scene.start('end-game', this.testApplicationService);
  }

  private initializeCodeEditorProgrammingAreas() {
    if (!this.codeEditor.programs) {
      let prog0 = new Program(this, 'prog_0', this.grid, 17.5, 11, 8, 2.3, 'drop-zone', 0xFBFF94)
      let prog1 = new Program(this, 'prog_1', this.grid, 17.5, 14.5, 8, 2.3, 'drop-zone', 0xFBFF94)
      let prog2 = new Program(this, 'prog_2', this.grid, 17.5, 18, 8, 2.3, 'drop-zone', 0xFBFF94)
      this.codeEditor.setPrograms([
        prog0,
        prog1,
        prog2
      ])
    }
  }

  private addTestCommands(phase: MazePhase) {
    if (phase) {
      if (phase.commands) {
        phase.commands.forEach((commandsRow: CommandName[], index: number) => {
          let prog = this.codeEditor.programs[index];
          this.codeEditor.addCommands(prog, commandsRow);
        })
      }
    }
    // let prog0 = this.codeEditor.programs[0];
    // let prog1 = this.codeEditor.programs[1];
    // let prog2 = this.codeEditor.programs[2];
    // prog0.clear()
    // prog1.clear()
    // prog2.clear()
    // this.codeEditor.addCommands(prog0, ['prog_1', 'prog_0', 'arrow-right'])
    // this.codeEditor.addCommands(prog1, ['arrow-up'])
    // this.codeEditor.addCommands(prog2, ['arrow-right', 'arrow-up', 'arrow-up', 'arrow-right', 'prog_1'])
  }

  async sendResponse(options:
    {
      setFinished: boolean
    } = {
      setFinished: false
    }) {
    let phase = this.currentPhase;
    if (phase) {
      if (this.gameParams.isTestApplication()) {
        try {
          if (this.currentPhase) {
            if (options.setFinished) {
              this.gameState.setFinished();
            }
            this.gameState.registerAddedCommands(this.codeEditor.getCommandsAsString())
            const response = this.gameState.getResponseToSend()
            await this.testApplicationService.sendResponse(response);
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

}
