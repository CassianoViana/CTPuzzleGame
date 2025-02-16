
export type Obstaculo = "coin" | "block" | "null" | "battery" | 'rope'
export type Mapa = "tile" | 'grass' | 'asphalt' | "null"
export type Face = "up" | "down" | "right" | "left"
export type Comando = "UP" | "DOWN" | "RIGHT" | "LEFT" | 'PROG_0' | "PROG_1" | 'PROG_2' | 'IF_COIN' | 'IF_BLOCK'

class Poligonos {
  pontos: { x: number, y: number }[] = [];
  posicao: { x: number, y: number }[] = [];
  cor: string = '';
}

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
  falasAntesDeIniciar: string[] = [];
  mensagemAoPularFase: string;
  mensagemAoSairDoJogo: string;
  mensagemAoReiniciarFase: string;
  nivelMaximoBateria: number = 10;
  poligonos: Poligonos[] = [];
  poligonoDestino: { x: number, y: number }[] = [];
  pontosDestino: { x: number, y: number }[] = [];
}

