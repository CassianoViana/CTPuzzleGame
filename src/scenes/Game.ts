import { inputHandler } from './class/InputHandler'
import { fitShape } from './class/fitShape'
import { positionValidation } from './class/positionValidation'
import { GameObjects, Types, Scene } from 'phaser'
import { MatrixMode } from '../geom/Matrix'
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
import { Coin } from './Coin'
import MessageBox from '../sprites/MessageBox'
import Button from '../controls/Button'
import Command from '../program/Command'

export const DEPTH_OVERLAY_PANEL_TUTORIAL = 50

export default class Game extends Scene {


  codeEditor: CodeEditor
  poligonoSelecionado: GameObjects.Image;
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
  shapes: Phaser.GameObjects.Polygon[] = [];
  private positionValidationInstance: positionValidation;



  constructor() {
    super('game')
    this.positionValidationInstance = new positionValidation(this);
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
    this.createGrid(30, 25)

    this.grid = new AlignGrid(this, 30, 25, this.game.config.width as number, this.game.config.height as number);

    //this.grid.show(0.4);

    //this.grid.showPoints();

    //this.grid.showPointsEvery50PX();


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


    this.createTextCurrentPhase();
    this.createBtnExit()
    this.createBtnJump()
    this.createBtnRestart()
    this.createBtnMusic()

    this.codeEditor.onRotateLeft = () => {
      this.poligonoSelecionado.angle -= 15;
    }

    this.codeEditor.onRotateRight = () => {
      this.poligonoSelecionado.angle += 15;
    }

    //Aqui está a lógica de quando o botão de play é clicado
    //Trocou de fase sem nenhuma validação. Depois eu devo colocar uma validação
    this.codeEditor.onClickRun = () => {
      this.positionValidationInstance.logAllShapesPointsPositions();
      if(this.validateShapes(this.currentPhase)){
        this.gameState.registerPlayUse()
        this.showSuccessMessage();
      }else{
        this.showErrorMessage()
      }
    }

    this.codeEditor.onRemoveCommand = (command: Command) => {
      this.gameState.registerTrashUse()
    }



    this.codeEditor.onReplayCurrentPhase = () => {
      this.replayCurrentPhase();
    }


    this.playNextPhase();
  }

  private showErrorMessage() {
    let messageBox = new MessageBox(this, this.grid, { showCancelButton: false });
    this.sounds.error();
    messageBox.setText("Erro! As formas não estão montadas corretamente.");
    messageBox.onClickOk = () => {
      messageBox.close();
    };
  }

  private showSuccessMessage() {
    let messageBox = new MessageBox(this, this.grid, { showCancelButton: false });
    this.sounds.success();
    messageBox.setText("Parabéns! Você completou a fase!");
    messageBox.onClickOk = () => {
      this.sendResponse();
      this.sendResponse({ setFinished: true })
      messageBox.close();
      this.playNextPhase();
    };
  }

  private createTextCurrentPhase() {
    let cell = this.grid.getCell(0.5, 0.5)
    this.textCurrentPhase =
      this.add.text(cell.x, cell.y, '', { fontFamily: 'Dyuthi, sans-serif' })
        .setScale(this.grid.scale)
        .setTint(0x640000)
        .setFontSize(35)
  }

  validateShapes(phase: MazePhase) : boolean {
    const pontosDestino = phase.pontosDestino.map(point => ({ x: point.x, y: point.y }));
    return this.positionValidationInstance.isShapeInCorrectPosition(pontosDestino);
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
    let gridCenterX = this.grid.width;
    let gridCenterY = this.grid.height;
    let gridCellWidth = this.grid.cellWidth;

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

    const pontosPoligonoDestinos = phase.poligonoDestino.map(point => ({ x: point.x, y: point.y }));

    graphics.lineStyle(3, 0x640000); // Define a cor e a espessura do contorno

    const dashLength = 5; // Comprimento do traço
    const gapLength = 2;   // Comprimento do espaço entre os traços

    graphics.beginPath();

    for (let i = 0; i < pontosPoligonoDestinos.length; i++) {
      const start = pontosPoligonoDestinos[i];
      const end = pontosPoligonoDestinos[(i + 1) % pontosPoligonoDestinos.length];
      this.drawDashedLine(graphics, start.x, start.y, end.x, end.y, dashLength, gapLength);
    }

    graphics.strokePath();

    const rect = new Phaser.Geom.Polygon(pontosPoligonoDestinos);

    return { graphics, rect };
  }

  async desenhaPoligonos(phase: MazePhase) {
    this.currentPhase = phase;
    if (this.currentPhase) {
      const polygons = this.currentPhase.poligonos;
      const InputHandler = new inputHandler(this);
      const FitShape = new fitShape(this);

      polygons.forEach(polygonData => {
        const points = polygonData.pontos.map(point => ({ x: point.x, y: point.y }));
        const positions = polygonData.posicao;
        const color = polygonData.cor || 0xB0E0E6; // Default color if not specified

        if (points.length > 0) {
          const centerX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
          const centerY = points.reduce((sum, point) => sum + point.y, 0) / points.length;

          positions.forEach(position => {
            const polygon = this.add.polygon(position.x + centerX, position.y + centerY, points, color).setOrigin(0.5, 0.5);

            InputHandler.enableDrag(polygon);
            FitShape.enablePartialFit(polygon, this.currentPhase.poligonoDestino);

            polygon.on('pointerdown', () => {
              this.poligonoSelecionado = polygon;
              console.log('Polígono selecionado:', this.poligonoSelecionado);
            });

            this.positionValidationInstance.addShape(polygon);
          });
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
