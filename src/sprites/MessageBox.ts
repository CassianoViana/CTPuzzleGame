import { Scene } from "phaser";
import Button from "../controls/Button";
import AlignGrid from "../geom/AlignGrid";
import { globalSounds } from "../scenes/PreGame";
import drawRect, { writeText } from "../utils/Utils";

export class MessageBoxOptions {
  showCancelButton: boolean = false
}

export default class MessageBox {
  grid: AlignGrid;
  graphicsBackShadow: Phaser.GameObjects.Graphics;
  messageBoxImage: Phaser.GameObjects.Image;
  scene: Scene;
  phrase: Phaser.GameObjects.Text;
  messages: string[]
  currentMessageIndex: number;
  okButton: Button;
  closeButton: Button;
  cancelButton: Button
  onClickCancel: () => void = () => { };
  onFinishTalk: () => void = () => { };
  onClickOk: () => void = () => { };
  options: MessageBoxOptions;

  constructor(scene: Scene, grid: AlignGrid, options: MessageBoxOptions = new MessageBoxOptions()) {
    this.scene = scene;
    this.grid = grid;
    this.options = options;
    //this.createBackShadow();
    this.createMessageBox();
    this.createText()
    this.createOkButton()
    this.createCloseButton()

    if (options.showCancelButton) {
      this.createCancelButton()
    }
    this.close();
  }

  setMessages(messages: string[]) {
    if (!messages || !messages.length) {
      this.close();
      return;
    }
    this.currentMessageIndex = 0;
    this.messages = messages;
    this.showCurrentMessage();
  }

  createOkButton() {
    let cell = this.options.showCancelButton ? this.grid.getCell(17, 15.5) : this.grid.getCell(17, 15.5)
    let btn = new Button(this.scene, globalSounds, cell.x, cell.y, 'btn-ok', () => {
      this.onClickOk()
      this.showNextMessage()
    });
    btn.setScale(this.grid.scale);
    btn.setDepth(302);
    this.okButton = btn;
  }

  createCancelButton() {
    let cell = this.grid.getCell(13, 15.5)
    this.onClickCancel = () => {
      this.close()
    }
    let btn = new Button(this.scene, globalSounds, cell.x, cell.y, 'btn-cancel', () => { this.onClickCancel() });
    btn.setScale(this.grid.scale);
    btn.setDepth(302);
    this.cancelButton = btn;
  }

  createCloseButton() {
    let cell = this.grid.getCell(22.3, 4.2)
    let btn = new Button(this.scene, globalSounds, cell.x, cell.y, 'btn-close-message', () => {
      this.onFinishTalk()
      this.close()
    });
    btn.setScale(this.grid.scale);
    btn.setDepth(304);
    this.closeButton = btn;
  }

  showCurrentMessage() {
    if (this.currentMessageIndex >= 0) {
      let message = this.messages[this.currentMessageIndex];
      if (message) {
        this.setText(message);
      }
      if (!message) {
        this.close();
        this.onFinishTalk();
      }
    }
  }

  close() {
    this.setVisible(false);
  }

  setVisible(visible: boolean) {
    this.phrase?.setVisible(visible);
    this.okButton?.setVisible(visible);
    this.cancelButton?.setVisible(visible);
    this.closeButton?.setVisible(visible);
    this.graphicsBackShadow?.setVisible(visible);
    this.messageBoxImage?.setVisible(visible);
  }

  showNextMessage() {
    this.currentMessageIndex = this.currentMessageIndex + 1;
    this.showCurrentMessage();
  }

  createText() {
    let point = this.grid.getCell(4.5, 5)
    this.phrase = this.scene.add.text(point.x, point.y, '', {
      fontFamily: 'Dyuthi, arial',
    })
      .setScale(this.grid.scale)
      .setAlign('left')
      .setDepth(303)
      .setFontSize(50)
      .setTint(0xffffff);
  }

  setText(text: string) {
    this.setVisible(true);
    writeText(text, '', this.phrase, () => { })
  }

  private createBackShadow() {
    this.graphicsBackShadow = this.scene.add.graphics();
    this.graphicsBackShadow.depth = 300;
    this.graphicsBackShadow.fillStyle(0x000000);
    this.graphicsBackShadow.alpha = 0.6;
    this.graphicsBackShadow.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  createMessageBox() {
    this.messageBoxImage = this.grid.addImage(3, 3, 'message_box', 20);
    this.messageBoxImage.setDepth(301);
  }

}
