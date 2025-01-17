import Phaser from 'phaser';

export class fitShape {
    private scene: Phaser.Scene;

    constructor(scene) {
        this.scene = scene;
    }

    enablePartialFit(shape: Phaser.GameObjects.GameObject, outlinedRect: Phaser.Geom.Polygon) {
        const tolerance = 20; // 20 px de tolerância
        const gridSize = 50; // Tamanho da grade de 50 px
    
        this.scene.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            const shapeBounds = gameObject.getBounds();
            const outlinedBounds = outlinedRect;
    
            // Verificar se a forma está parcialmente dentro do retângulo delimitador
            const isPartiallyInside = Phaser.Geom.Intersects.RectangleToRectangle(shapeBounds, outlinedBounds);
    
            if (isPartiallyInside) {
                // Calcula as novas posições ajustadas para a grade
                const adjustedX = Math.round(gameObject.x / gridSize) * gridSize;
                const adjustedY = Math.round(gameObject.y / gridSize) * gridSize;
    
                // Verificar se as novas posições estão dentro da tolerância
                const withinToleranceX = Math.abs(adjustedX - gameObject.x) <= tolerance;
                const withinToleranceY = Math.abs(adjustedY - gameObject.y) <= tolerance;
    
                if (withinToleranceX && withinToleranceY) {
                    gameObject.setPosition(adjustedX, adjustedY);
                    console.log('Encaixou o objeto!');
                } else {
                    console.log('Não encaixou o objeto dentro da tolerância.');
                }
            } else {
                console.log('O objeto não está dentro do retângulo delimitador.');
            }
        });
    }
}