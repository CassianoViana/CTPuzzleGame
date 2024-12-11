import { Comando } from "../ct-platform-classes/MecanicaRope";
import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao"
import { Logger } from "../main"
import { getItem, getTypedItem, setItem } from "../utils/storage"
import { isAndroidAmbient } from "../utils/Utils";

export default class GameState {
  setReplayingPhase(itemId:number, replaying: boolean) {
    setItem('replaying'+itemId, replaying)
  }

  isReplayingPhase(itemId:number):boolean{
    return getTypedItem(Boolean, 'replaying'+itemId)
  }

  initializeResponse(itemNumber: number) {
    this.setItemNumber(itemNumber);
    let resposta = new RespostaItemProgramacao()
    resposta.tempoEmSegundos = -1
    //resposta.contadorUsoLixeira = 0
    //resposta.contadorUsoDebug = 0
    resposta.contadorUsoPlay = 0
    //resposta.contadorUsoStop = 0
    //resposta.caminhoPercorrido = []
    //resposta.caminhoPercorridoTexto = ""
    resposta.finalizou = false
    resposta.ambiente = isAndroidAmbient() ? "celular" : "computador"
    this.setResponse(resposta);
    this.initializeStartTime()
  }

  
  pushMove(position: { x: number; y: number; }) {
    let response = this.getResponse()
    //response.caminhoPercorrido.push(position)
    //response.caminhoPercorridoTexto = response.caminhoPercorrido.map(position => `(${position.x},${position.y})`).join('')
    this.setResponse(response)
  }
    

  setFinished() {
    let response = this.getResponse()
    response.finalizou = true
    this.setResponse(response)
  }

  initializeStartTime() {
    //alert('initialize start time')
    let resposta = this.getResponse()
    if (!resposta) {
      resposta = new RespostaItemProgramacao()
    }
    resposta.tempoInicio = this.getTimeInSeconds()
    this.setResponse(resposta);
  }

  isBackgroundMusicEnabled() {
    return getItem('isBackgroundMusicEnabled', true)
  }

  setBackgroundMusicEnabled(enabled: boolean = true) {
    setItem('isBackgroundMusicEnabled', enabled)
  }

  setSpeedFactor(speed: number) {
    setItem('speedFactor', speed)
  }

  getSpeedFactor(): number {
    return getItem<number>('speedFactor', 1)
  }

  isSpeedFactorActivated(): boolean {
    return this.getSpeedFactor() == 2
  }

  private calculateTimeSpent(): number {
    let response = this.getResponse();
    let tempoEmSegundos = 0
    if (response) {
      tempoEmSegundos = Math.floor(this.getTimeInSeconds() - response.tempoInicio)
      response.tempoEmSegundos = tempoEmSegundos
      this.setResponse(response)
    }
    return tempoEmSegundos
  }

  getResponseToSend(): { itemId: number, response: RespostaItemProgramacao } {
    let response = this.getResponse();
    const responseToSend = {
      itemId: this.getItemNumber(),
      response
    }
    Logger.info('ResponseToSend', JSON.stringify(responseToSend));
    return responseToSend
  }

  registerGiveUp() {
    const response = this.getResponse();
    response.pulouFase = true
    this.setResponse(response)
  }

  registerTrashUse() {
    let response = this.getResponse()
    response.countTrashUse()
    this.setResponse(response)
  }

  registerDebugUse() {
    let response = this.getResponse()
    response.countDebug()
    this.setResponse(response)
  }

  registerPlayUse() {
    let response = this.getResponse()
    response.countPlay()
    this.setResponse(response)
  }

  registerStopUse() {
    let response = this.getResponse()
    response.countStop()
    this.setResponse(response)
  }

  registerRestartUse() {
    let response = this.getResponse()
    response.countRestartUse()
    this.setResponse(response)
  }

  registerAddedCommands(addedCommands: string[]) {
    this.log('GAME_STATE register coding', addedCommands);
    let response = this.getResponse();
    let ultimaTentativa = ""
    if (response.tentativas?.length) {
      ultimaTentativa = response.tentativas[response.tentativas.length - 1].toString()
    }
    let tentativa = addedCommands.map(it => {
      it = it.replace('arrow-', '');
      it = it.toUpperCase();
      return it.toUpperCase() as Comando
    })
    if (tentativa.toString() != ultimaTentativa) {
      response.adicionarTentativa(tentativa);
      response.tempoEmSegundos = this.calculateTimeSpent()
    }
    this.setResponse(response);
  }



  getTimeInSeconds(): number {
    return new Date().getTime() / 1000
  }

  setResponse(respostaItemProgramacao: RespostaItemProgramacao) {
    setItem('response', respostaItemProgramacao)
  }

  getResponse(): RespostaItemProgramacao {
    return getTypedItem(RespostaItemProgramacao, 'response')
  }

  setItemNumber(itemNumber: number) {
    setItem('itemNumber', itemNumber)
  }

  getItemNumber(): number {
    return getItem('itemNumber', 0);
  }

  private log(...arg0: any[]) {
    Logger.log(['GAME_STATE'].concat(arg0).join(' '))
  }
}
