import { Comando } from "./MecanicaRope"

type Ambiente = "celular" | "computador"
export class RespostaItemProgramacao {

  //comandosUtilizados: string[] = []
  tempoInicio: number
  tempoEmSegundos: number
  tentativas: Comando[][] = []
  pulouFase: boolean
  //contadorUsoLixeira: number = 0
  //contadorUsoDebug: number = 0
  contadorUsoPlay: number = 0
  //contadorUsoStop: number = 0
  contadorReinicioFase: number = 0
  contadorTentativas: number = 0
  ambiente: Ambiente = 'celular'
  //caminhoPercorrido: { x: number, y: number }[] = []
  //caminhoPercorridoTexto:string = ""
  finalizou = false
  polygonPoints: { x: number, y: number }[] = []

  adicionarTentativa(comandosUtilizados: Comando[]) {
    //this.comandosUtilizados = comandosUtilizados
    this.tentativas.push(comandosUtilizados)
    this.contadorTentativas = this.tentativas.length
  }

  countTrashUse() {
    //this.contadorUsoLixeira++
  }

  countRestartUse() {
    this.contadorReinicioFase++
  }

  countStop() {
    this.contadorUsoStop++
  }
  countPlay() {
    this.contadorUsoPlay++
  }
  countDebug() {
    this.contadorUsoDebug++
  }
}
