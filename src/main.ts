// Docs
// https://photonstorm.github.io/phaser3-docs/index.html
// Kenney Assets
// https://kenney.nl/assets/digital-audio

import Phaser from 'phaser'
import Game from './scenes/Game'
import PreGame from './scenes/PreGame'
import EndGame from './scenes/EndGame'

let proportionHeightByWidth = 0.58
let width = window.innerWidth * 1
let height = width * proportionHeightByWidth

if (height > window.innerHeight) {
  height = window.innerHeight
  width = height * proportionHeightByWidth * 3
}

export const Logger = {
  log: (...values: any[]) => {
    //console.log(values.join(' '))
  },
  info: (...values: any[]) => {
    //console.info(values.join(' '))
  },
  warn: (...values: any[]) => {
    //console.warn(values.join(' '))
  },
  error: (...values: any[]) => {
    console.error(values.join(' '))
  },
  clear: () => {
   
  }
}

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  fps: {
    smoothStep: true,
    min: 13,
    //forceSetTimeOut: true,
    target: 15
  },
  scene: [PreGame, Game, EndGame],
  render: {
    transparent: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0
      },
      debug: false
    }
  }
})
