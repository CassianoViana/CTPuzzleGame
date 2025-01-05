import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import SpriteDropZone from "../controls/SpriteDropZone";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";

export function isAndroidAmbient() {
  let isAndroidAmbient = true;
  try {
    // @ts-ignore
    isAndroidAmbient = GameJavascriptInterface != null
  } catch (e) {
    Logger.warn('GameJavascriptInterface is not defined!!');
    isAndroidAmbient = false;
  }
  return isAndroidAmbient;
}

export function saveAndroidPref(key: string, value: any) {
  if (isAndroidAmbient()) {
    //@ts-ignore
    GameJavascriptInterface.setItem(key, value);
  }
}

export function getAndroidPref(key: string): string {
  if (isAndroidAmbient()) {
    //@ts-ignore
    return GameJavascriptInterface.getItem(key);
  }
}

export default function drawRect(scene: Scene, x: number, y: number, width: number, height: number) {
  const debug = isDebug(scene);
  if (debug) {
    var graphics = scene.add.graphics().setDepth(5000);
    graphics.lineStyle(2, 0xffff00);
    graphics.strokeRect(
      x,
      y,
      width,
      height
    );
  }
}

export function createDropZone(grid: AlignGrid, cellx: number, celly: number, colspan: number, rowspan: number, texture: string): SpriteDropZone {
  const rect: Phaser.Geom.Rectangle = grid.getArea(cellx, celly, colspan, rowspan);
  const dropZone = new SpriteDropZone(grid.scene, rect.x, rect.y, rect.width, rect.height, texture);
  grid.placeAt(cellx, celly, dropZone.sprite, colspan, rowspan);
  return dropZone;
}

export function getDefaultPlatformApiUrl(gameParams: GameParams) {
  const defaultOnlineApi = 'https://api.ctplatform.playerweb.com.br';
  const protocol = window.location.protocol
  let apiUrl = '';
  if (protocol == 'http:') {
    apiUrl = 'http://localhost:3110'
  }
  if (protocol == 'https:' || gameParams.operation == "useOnlineApi") {
    apiUrl = defaultOnlineApi
  }
  apiUrl = apiUrl || gameParams.puzzleUrl || defaultOnlineApi
  return apiUrl
}

export function androidOpenUrl(url: string) {
  Logger.log('Opening url: ', url);
  try {
    //@ts-ignore
    if (isAndroidAmbient()) {
      //@ts-ignore
      GameJavascriptInterface.openUrl(url)
    } else {
      openWebUrl(url)
    }
  } catch (e) {
    Logger.warn('GameJavascriptInterface is not defined!!');
  }
}

export const USER_UUID_TOKEN = '<user_uuid>'

export function replaceUserUuidTokenByUserHash(url: string, value: string) {
  if (url.indexOf(USER_UUID_TOKEN) > -1) {
    return url?.replace(USER_UUID_TOKEN, value)
  }
  return url + value
}

function openWebUrl(url: string) {
  let link = document.createElement('a');
  link.href = url
  //link.target = "_blank"
  link.click()
}

export function androidVibrate(time: number) {
  Logger.log(`Calling GameJavascriptInterface.vibrate with param ${time}ms`)
  try {
    //@ts-ignore
    if (isAndroidAmbient()) {
      //@ts-ignore
      GameJavascriptInterface.vibrate(time)
    }
  } catch (e) {
    Logger.warn('GameJavascriptInterface is not defined!!');
  }
}

export function androidPlayAudio(sound: string): boolean {
  Logger.log(`Calling GameJavascriptInterface.play with param ${sound}`)
  let couldPlay = false;
  try {
    //@ts-ignore
    if (isAndroidAmbient()) {
      //@ts-ignore
      couldPlay = GameJavascriptInterface.play(sound)
    }
  } catch (e) {
    Logger.warn('GameJavascriptInterface is not defined!!');
  }
  return couldPlay;
}

/**
 * O flatMap to es2015 não existia nos navegadores mais antigos.
 * Por isso criei essa função que faz a mesma coisa
 */
export function joinChilds<PARENT, CHILD>(parents: Array<PARENT>, fnGetChilds: (p: PARENT) => Array<CHILD>): Array<CHILD> {
  let allChildren = new Array<CHILD>()
  if (!parents || !fnGetChilds) {
    return allChildren;
  }
  parents.forEach(parent => {
    const children = fnGetChilds(parent) || []; // Garantir que children seja um array
    children.forEach(child => {
      allChildren.push(child);
    })
  });
  return allChildren
}


export function createJoinArraysFn<PARENT>(functions: Array<() => PARENT[]>): () => Array<PARENT> {
  return () => joinChilds(functions, (fnThatReturnArray) => fnThatReturnArray() || [])
}

export function isDebug(scene: Phaser.Scene) {
  return scene.game.config.physics.arcade?.debug;
}

export function writeText(newText: string, existentText: string, textObject: Phaser.GameObjects.Text, onWrite: () => void) {
  textObject?.setText(newText);
  // if (existentText.length < newText.length) {
  //   existentText = newText.substring(0, existentText.length + 1);
  //   textObject?.setText(existentText);
  //   setTimeout(() => {
  //     writeText(newText, existentText, textObject, onWrite)
  //     onWrite()
  //   }, 20)
  // }
}
