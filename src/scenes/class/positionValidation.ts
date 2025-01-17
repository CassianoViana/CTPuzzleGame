import Phaser from 'phaser';


export class positionValidation {
    private scene: Phaser.Scene;
    private shapes: Phaser.GameObjects.Polygon[] = [];
    selectedShape: Phaser.GameObjects.Polygon;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.shapes = []; // Inicializa a propriedade shapes

    }

    addShape(shape: Phaser.GameObjects.Polygon) {
        this.shapes.push(shape);
    }

    removeDuplicatePoints(points: { x: number, y: number }[]): { x: number, y: number }[] {
        const uniquePoints = points.filter((point, index, self) =>
            index === self.findIndex((p) => Math.abs(p.x - point.x) < 1 && Math.abs(p.y - point.y) < 1)
        );
        return uniquePoints;
    }

    isShapeInCorrectPosition(destinationPoints: { x: number, y: number }[]): boolean {
        const tolerance = 10; // Tolerância de 10 pixels

        const allShapePoints: { x: number, y: number }[] = [];

        this.shapes.forEach((shape) => {
            const positions = this.getShapePointsPositions(shape);
            allShapePoints.push(...positions);
          });

        const uniqueShapePoints = this.removeDuplicatePoints(allShapePoints);
        const uniqueDestinationPoints = this.removeDuplicatePoints(destinationPoints);

        console.log('Pontos da forma antes de remover duplicados:', allShapePoints);
        console.log('Pontos da forma após remover duplicados:', uniqueShapePoints);
        //console.log('Pontos de destino após remover duplicados:', uniqueDestinationPoints);

        console.log('Tamanho' , uniqueShapePoints.length);
        if (uniqueShapePoints.length !== uniqueDestinationPoints.length) {
            return false;
        }

        for (const shapePoint of uniqueShapePoints) {
            const matchingIndex = uniqueDestinationPoints.findIndex(destinationPoint =>
                Math.abs(shapePoint.x - destinationPoint.x) <= tolerance &&
                Math.abs(shapePoint.y - destinationPoint.y) <= tolerance
            );

            if (matchingIndex === -1) {
                return false;
            }

            // Remove the matched point from the destination points to avoid duplicate matches
            uniqueDestinationPoints.splice(matchingIndex, 1);
        }

        return true;
    }

    //Essa função é útil para determinar a posição exata dos pontos de um polígono após ele ter sido movido e rotacionado na cena.
    getShapePointsPositions(shape: Phaser.GameObjects.Polygon): { x: number, y: number }[] {
        if (!shape || !shape.geom) {
            console.error('Shape or shape.geom is null');
            return [];
        }

        const points = shape.geom.points;
        const positions = points.map(point => {
            const rotatedPoint = Phaser.Math.RotateAround({ x: point.x, y: point.y }, shape.displayOriginX, shape.displayOriginY, shape.rotation);
            return {
                x: shape.x + rotatedPoint.x - shape.displayOriginX,
                y: shape.y + rotatedPoint.y - shape.displayOriginY
            };
        });
        return positions;
    }

    logAllShapesPointsPositions() {
        this.shapes.forEach((shape, index) => {
            const positions = this.getShapePointsPositions(shape);
            console.log(`Forma ${index + 1}:`);
            positions.forEach((pos, pointIndex) => {
                console.log(`  Ponto ${pointIndex + 1}: x=${pos.x}, y=${pos.y}`);
            });
        });
    }

}