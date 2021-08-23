import { Transition } from ".";

export class Type4Transition extends Transition {
    public getPredictedPath(): PathVector[] {
        const vectors: PathVector[] = [];

        if (this.radSegment) {
            vectors.push({
                type: PathVectorType.Line,
                startPoint: this.from.coordinates,
                endPoint: this.itp.coordinates,
            });
        }

        vectors.push({
            type: PathVectorType.Arc,
            startPoint: this.itp.coordinates,
            centrePoint: this.turnCentre.coordinates,
            sweepAngle: (this.clockwise ? -1 : 1) * this.angle,
        });

        return vectors;
    }
}
