import { GameObjects, Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import { MecanicaRope } from "../ct-platform-classes/MecanicaRope";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import InterfaceElement from "../InterfaceElement";
import { Logger } from "../main";
import TutorialAction from "./TutorialAction";
import TutorialDropLocation from "./TutorialDropLocation";
import TutorialHighlight from "./TutorialHighlight";

export type CommandName = "arrow-up" | "arrow-down" | "arrow-right" | "arrow-left" | "prog_1" | "prog_0" | "prog_2" | "if_coin" | "if_block"
| "arrow-up:if_block" | "arrow-down:if_block" | "arrow-right:if_block" | "arrow-left:if_block" | "prog_1:if_block" | "prog_0:if_block" | "prog_2:if_block"
| "arrow-up:if_coin" | "arrow-down:if_coin" | "arrow-right:if_coin" | "arrow-left:if_coin" | "prog_1:if_coin" | "prog_0:if_coin" | "prog_2:if_coin"

export const DEFAULT_SKIP_MESSAGE = 'Você vai pular essa fase?'
export const DEFAULT_EXIT_MESSAGE = 'Vai sair dessa fase?'
export const DEFAULT_RESTART_MESSAGE = 'Reiniciar fase?'
export default class MazePhase {


  skipPhaseMessage:string = DEFAULT_SKIP_MESSAGE
  exitPhaseMessage:string = DEFAULT_EXIT_MESSAGE
  restartPhaseMessage:string = DEFAULT_RESTART_MESSAGE
  setupTutorialsAndObjectsPositions: () => void;
  messagesBeforeStartPlay:string[] = []
  obstacles: Matrix;
  ground: Matrix;
  scene: Scene;
  grid: AlignGrid
  itemId: number

  firstAction: TutorialAction;
  action: TutorialAction;
  //actions: TutorialAction[] = [];

  next: MazePhase
  backgroundOverlay: GameObjects.Sprite;

  dudeFacedTo: string = 'right'
  dudeStartPosition: { row: number, col: number } = { row: 0, col: 0 }
  codeEditor: CodeEditor;
  mecanicaRope: MecanicaRope;
  batteryLevel: number = 10;
  maxBatteryLevel: number = 10
  batteryDecreaseOnEachMove: number = 1
  batteryGainOnCapture: number = 1;
  commands: Array<CommandName[]> = [];
  polygonPoints: { x: number, y: number }[] = [];

  constructor(scene: Scene, codeEditor: CodeEditor) {
    this.scene = scene;
    this.grid = codeEditor.grid;
    this.codeEditor = codeEditor;
  }

  setupMatrixAndTutorials() {
    this.clearTutorials();
    this.setupTutorialsAndObjectsPositions();
  }

  addTutorialHighlightDrag(
    fnGetInterfaceElement: () => InterfaceElement,
    fnGetDropLocation: () => TutorialDropLocation,
  ): TutorialAction {
    const action = this.addTutorialHighlight(fnGetInterfaceElement, fnGetDropLocation);
    action.highlights.forEach(highlight => highlight.continueTutorialOnDrag = true)
    return action
  }

  addTutorialHighlightClick(
    fnGetInterfaceElement: () => InterfaceElement,
    fnGetDropLocation: () => TutorialDropLocation = null
  ): TutorialAction {
    const action = this.addTutorialHighlight(fnGetInterfaceElement, fnGetDropLocation);
    action.highlights.forEach(highlight => highlight.continueTutorialOnClick = true)
    return action
  }

  private addTutorialHighlight(
    fnGetInterfaceElement: () => InterfaceElement,
    fnGetDropLocation: () => TutorialDropLocation = null
  ): TutorialAction {
    return this.addTutorialHighlights(
      [new TutorialHighlight(this.scene, this.grid, fnGetInterfaceElement, fnGetDropLocation)]
    )
  }

  addTutorialHighlights(
    highlights: Array<TutorialHighlight>
  ): TutorialAction {
    const tutorialAction = new TutorialAction(this.scene, highlights);
    tutorialAction.onHighlight = () => {
      this.addBackgroundOverlay()
      this.codeEditor.disableInteractive();
    }
    tutorialAction.askToShowInstruction = (instruction: string) => {
      this.codeEditor.onShowInstruction(instruction);
    }
    tutorialAction.onInvalidState = () => {
      this.codeEditor.replay();
    }
    tutorialAction.onCompleteAction = () => {
      this.action = tutorialAction.nextTutorialAction
      Logger.log('TUTORIAL_ADVANCE [this.action.index]', this.action?.index)
      this.codeEditor.onHideLastInstruction();
    }
    let index = 0;
    if (!this.firstAction) {
      this.firstAction = tutorialAction
    } else {
      index = this.action.index + 1;
      tutorialAction.previousTutorialAction = this.action
      this.action.nextTutorialAction = tutorialAction;
    }
    tutorialAction.index = index;
    this.action = tutorialAction;
    return tutorialAction;
  }

  showTutorialActionsIfExists() {
    this.firstAction?.highlight();
  }

  updateTutorial() {
    Logger.log('TUTORIAL_UPDATE [this.action.index]', this.action?.index)
    this.action?.highlight();
  }

  isTutorialPhase() {
    return this.firstAction != null
  }

  clearTutorials() {
    this.codeEditor.setInteractive();
    this.removeBackgroundTutorialOverlay();
    let action = this.firstAction;
    while (action != null) {
      action.reset();
      action = action.nextTutorialAction
    }
    this.action = null;
    this.firstAction = null;
  }

  addBackgroundOverlay() {
    /* if (!this.backgroundOverlay) {
        this.backgroundOverlay = this.scene.add.sprite(0, 0, 'tutorial-block-click-background')
            .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL);
        this.grid.placeAt(0, 0, this.backgroundOverlay, this.grid.cols, this.grid.rows);
    } */
  }

  removeBackgroundTutorialOverlay() {
    /* if (this.backgroundOverlay) {
        this.scene.children.remove(this.backgroundOverlay);
        this.backgroundOverlay = null;
    } */
  }
}
