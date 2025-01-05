import { Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import { MecanicaRope } from "../ct-platform-classes/MecanicaRope";
import AlignGrid from "../geom/AlignGrid";
import Matrix, { MatrixMode } from "../geom/Matrix";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import MazePhase, { DEFAULT_EXIT_MESSAGE, DEFAULT_RESTART_MESSAGE, DEFAULT_SKIP_MESSAGE } from "./MazePhase";
import HardcodedPhasesCreator from "./hardcodedPhases/HardcodedPhasesCreator";
import TestApplicationService from "../test-application/TestApplicationService";
import { TestItem } from "../test-application/TestApplication";
import TutorialHelper from "./tutorial/TutorialHelper";

export default class MazePhasesLoader {

  currentPhase: number = -1
  phases: Array<MazePhase>;
  scene: Scene;
  grid: AlignGrid;
  matrixMode: MatrixMode;
  gridCenterX: number;
  gridCenterY: number;
  gridCellWidth: number;
  codeEditor: CodeEditor;
  testApplicationService: TestApplicationService;
  tutorial: TutorialHelper

  constructor(scene: Scene,
    grid: AlignGrid,
    codeEditor: CodeEditor,
    matrixMode: MatrixMode,
    gridCenterX: number,
    gridCenterY: number,
    gridCellWidth: number) {

    this.matrixMode = matrixMode;
    this.gridCenterX = gridCenterX;
    this.gridCenterY = gridCenterY;
    this.gridCellWidth = gridCellWidth;
    this.codeEditor = codeEditor;

    this.scene = scene;
    this.grid = grid;

    this.tutorial = new TutorialHelper(scene, codeEditor);
  }

  //Aqui é carregado, se vier da plataforma, prioriza este, se não, carrega o hardcoded
  async load(gameParams: GameParams): Promise<MazePhasesLoader> {
    this.testApplicationService = new TestApplicationService(gameParams)
    let phases: MazePhasesLoader;
    try {
      if (gameParams.isPlaygroundTest()) {
        phases = await this.loadPlaygroundTestItem();
      }
      if (gameParams.isTestApplication()) {
        phases = this.loadTestApplication();
      }
      if (phases == null) {
        throw new Error('empty phases');
      }
    } catch (e) {
      Logger.error(e);
      phases = this.createHardCodedPhases(gameParams.isAutomaticTesting());
    }
    console.log('phases', phases)
    return phases
  }

  //as fases estão em um array
  private async loadPlaygroundTestItem(): Promise<MazePhasesLoader> {
    let item = await this.testApplicationService.instantiatePlaygroundItem<MecanicaRope>();
    const mazePhase = this.convertMecanicaRopeToPhase(item);
    this.phases = [mazePhase]
    return this
  }

  //aqui é aonde busca do json
  private loadTestApplication(): MazePhasesLoader {
    let items = this.testApplicationService.getNonCompletedTestItems()
    this.phases = items.map((item: TestItem) => {
      const mazePhase = this.convertMecanicaRopeToPhase(item.item as MecanicaRope)
      debugger
      mazePhase.itemId = item.id;
      return mazePhase
    })
    return this;
  }

  convertMecanicaRopeToPhase(mecanicaRope: MecanicaRope): MazePhase {
    let phase = new MazePhase(this.scene, this.codeEditor);
    phase.mecanicaRope = mecanicaRope;
    debugger
    phase.setupTutorialsAndObjectsPositions = () => {

      // Conversão dos polígonos
      phase.polygons = mecanicaRope.polygons.map(polygon => {
        return {
          polygonPoints: polygon.polygonPoints.map(point => ({ x: point.x, y: point.y })),
          polygonPosition: polygon.polygonPosition.map(position => ({ x: position.x, y: position.y })),
          polygonColor: polygon.polygonColor
        };
      });

      phase.polygonPoints = phase.mecanicaRope.polygonPoints.map(p => {
        return { x: p.x, y: p.y }
      })
      debugger

      phase.obstacles = new Matrix(
        this.scene,
        MatrixMode.ISOMETRIC,
        phase.mecanicaRope.obstaculos,
        this.gridCenterX, this.gridCenterY, this.gridCellWidth
      );


      phase.ground = new Matrix(
        this.scene,
        MatrixMode.ISOMETRIC,
        phase.mecanicaRope.mapa,
        this.gridCenterX, this.gridCenterY, this.gridCellWidth
      );

      phase.skipPhaseMessage = mecanicaRope.mensagemAoPularFase || DEFAULT_SKIP_MESSAGE
      phase.exitPhaseMessage = mecanicaRope.mensagemAoSairDoJogo || DEFAULT_EXIT_MESSAGE
      phase.restartPhaseMessage = mecanicaRope.mensagemAoReiniciarFase || DEFAULT_RESTART_MESSAGE
      phase.dudeStartPosition = { row: phase.mecanicaRope.y, col: phase.mecanicaRope.x }
      phase.dudeFacedTo = mecanicaRope.face
      phase.batteryLevel = mecanicaRope.nivelBateria
      phase.maxBatteryLevel = mecanicaRope.nivelMaximoBateria
      phase.batteryDecreaseOnEachMove = mecanicaRope.custoBateriaEmCadaMovimento
      phase.batteryGainOnCapture = mecanicaRope.ganhoBateriaAoCapturarPilha
      phase.messagesBeforeStartPlay = mecanicaRope.falasAntesDeIniciar

      let tutorialSteps = mecanicaRope.acoesTutorial.map(acao => {
        let affect = '';
        if (acao.arrastarSobre) {
          affect = `to ${acao.arrastarSobre}`
        }
        return `${acao.acao} ${acao.elemento} ${affect} say ${acao.frase}`
      })
      this.tutorial.buildTutorial(phase, tutorialSteps)
    }

    return phase
  }

  private createHardCodedPhases(testing: boolean): MazePhasesLoader {
    this.phases = new HardcodedPhasesCreator(
      this.scene,
      this.codeEditor,
      this.gridCenterX,
      this.gridCenterY,
      this.gridCellWidth)
      .createHardCodedPhases(testing)
    return this;
  }

  getNextPhase(): MazePhase {
    this.currentPhase++
    console.log('Fase Atual', this.phases[this.currentPhase])
    return this.phases[this.currentPhase]
  }
}
