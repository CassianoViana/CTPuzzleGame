
export type Obstaculo = "coin" | "block" | "null" | "battery" | 'rope'
export type Mapa = "tile" | 'grass' | 'asphalt' | "null"
export type Face = "up" | "down" | "right" | "left"
export type Comando = "UP" | "DOWN" | "RIGHT" | "LEFT" | 'PROG_0' | "PROG_1" | 'PROG_2' | 'IF_COIN' | 'IF_BLOCK'

export class MecanicaRope {
  mapa: Mapa[][];
  obstaculos: Obstaculo[][];
  face!: Face;
  x: number = 0;
  y: number = 0;
  comandosEsperados!: Comando[];
  tempoEsperado!: number
  tentativasEsperadas!: number
  nivelBateria: number = 10
  custoBateriaEmCadaMovimento: number = 1
  ganhoBateriaAoCapturarPilha: number = 1
  acoesTutorial: AcaoTutorial[] = []
  falasAntesDeIniciar: string[] = [];
  mensagemAoPularFase: string;
  mensagemAoSairDoJogo: string;
  mensagemAoReiniciarFase: string;
  nivelMaximoBateria: number = 10;
  polygonPoints: { x: number, y: number }[] = [];
}

type Acao = "click" | "drag"
type Elemento = "btn-step" | "arrow-up" | "arrow-left" | "arrow-down" | "arrow-right" | "btn-play" | "prog_1" | "prog_2" | "prog_0" | "if_block" | "if_coin"
class AcaoTutorial {
  acao!: Acao
  elemento!: Elemento
  arrastarSobre?: Elemento
  frase?: string = ''
}
