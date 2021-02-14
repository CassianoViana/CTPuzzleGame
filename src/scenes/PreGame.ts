import Phaser from 'phaser';
import Button from '../controls/Button';
import AlignGrid from '../geom/AlignGrid';
import Sounds from '../sounds/Sounds';

let globalSounds: Sounds

export default class PreGame extends Phaser.Scene {

  sounds: Sounds
  playBtn: Button
  testNumberObject: Phaser.GameObjects.Text

  constructor() {
    super('pre-game');
    this.sounds = new Sounds();
  }

  preload() {
    this.load.image('test-box', 'assets/ct/pregame/test-game-box.png');
    this.load.image('background', 'assets/ct/radial_gradient.png');
    this.load.spritesheet('play-btn', 'assets/ct/pregame/play-button.png', { frameWidth: 400, frameHeight: 152 });
    this.sounds.preloadAudios(this);
  }

  create() {
    this.sounds.initializeAudios();
    globalSounds = this.sounds;
    let grid = new AlignGrid(
      this, 26, 22,
      this.game.config.width as number,
      this.game.config.height as number
    );

    grid.addImage(0, 0, 'background', grid.cols, grid.rows);

    const cell = grid.getCell(10, 6);
    this.testNumberObject = this.add.text(cell.x, cell.y, '', {
      fontFamily: 'Dyuthi, arial',
    })
      .setScale(grid.scale)
      .setFontStyle('bold')
      .setFontSize(100)
      .setAlign('center')
      .setDepth(1001)
      .setTint(0xffffff);
    ;

    let testBox = grid.addImage(9, 4, 'test-box', 8).setInteractive();
    testBox.on('pointerup', () => {
      let testNumber = window.prompt('Informe o número do teste');
      this.testNumberObject.setText(testNumber.substring(0,5));
    })

    this.playBtn = new Button(this, this.sounds, 0, 0, 'play-btn', () => {
      this.sounds.click();
      this.scene.start('game')
    })
    grid.placeAt(10, 10.7, this.playBtn.sprite, 6);


  }
}

export { globalSounds }
