import Phaser from 'phaser';
import Button from '../controls/Button';
import AlignGrid from '../geom/AlignGrid';
import { Logger } from '../main';
import TestApplicationService from '../test-application/TestApplicationService';
import { androidOpenUrl } from '../utils/Utils';
import { globalSounds } from './PreGame';

export default class EndGame extends Phaser.Scene {
  grid: AlignGrid;

  constructor() {
    super('end-game');
  }

  init(testApplicationService: TestApplicationService) {
    if (testApplicationService) {
      if (testApplicationService.getParticipation) {
        Logger.log('END_GAME')
        let participation = testApplicationService.getParticipation();
        let isTestApplication = testApplicationService.isTestApplication()
        if (isTestApplication) {
          let url = participation?.urlToEndOfTestQuiz?.url;
          if (url) {
            androidOpenUrl(url)
          }
        }
      }
    }
  }

  preload() {
    this.load.image('trofel', 'assets/ct/trofel.png');
    this.load.image('background', 'assets/ct/radial_gradient.png');
    this.load.spritesheet('btn-green', 'assets/ct/btn_green_big.png', { frameWidth: 400, frameHeight: 152 });
  }

  create() {
    this.createGrid();
    this.addBackground();
    this.addTrofeu();
    this.createBackButton()
  }

  private createGrid() {
    let grid = new AlignGrid(
      this, 30, 25,
      this.game.config.width as number,
      this.game.config.height as number
    );
    //grid.show(0.4);
    this.grid = grid;
  }

  addTrofeu() {
    this.grid.addImage(12, 5, 'trofel', 10);
  }

  private addBackground() {
    this.grid.addImage(0, 0, 'background', this.grid.cols, this.grid.rows);
  }

  createBackButton() {
    let btnBack = new Button(this, globalSounds, 0, 0, 'btn-green', () => {
      this.restart()
    })
    btnBack.setText('Voltar')
    btnBack.setFontFamily('sans-serif')
    btnBack.setFontSize(120)
    btnBack.setScale(this.grid.scale)
    this.grid.placeAt(3, 7, btnBack.sprite, 7)
    btnBack.ajustTextPosition(80, 30)
  }

  restart() {
    this.scene.start('pre-game')
  }
}
