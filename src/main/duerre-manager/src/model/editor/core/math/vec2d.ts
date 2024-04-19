import Konva from "konva";

export interface Vec2D extends Konva.Vector2d {
    source: 'grid' | 'vertex';
} 
export const Vec2DZero: Vec2D = { x: 0, y: 0, source: 'grid' };

export const vec2DEquals = function (v1?: Konva.Vector2d, v2?: Konva.Vector2d): boolean {
    return v1 == undefined || v2 == undefined ? false : (v1?.x == v2?.x && v1?.y == v2?.y);
}

export const vec2DDistance = function (v1: Konva.Vector2d, v2: Konva.Vector2d): number {
    return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
}

export const toVec2DArray = function (object: number[] | Konva.Vector2d[] | Konva.Line): Konva.Vector2d[] {
    const toVec2D = function (points: number[]): Konva.Vector2d[] {
        const v: Konva.Vector2d[] = [];
        for (let i = 0; i < points.length - 1; i += 2) {
            const x = points[i];
            const y = points[i + 1];
            v.push({ x, y });
        }
        return v;
    }

    const vects: Konva.Vector2d[] = [];
    if (object instanceof Konva.Line) {
        vects.push(...toVec2D(object.points()));
    } else {
        if (object[0] instanceof Object) {
            vects.push(...object as Konva.Vector2d[])
        } else {
            vects.push(...toVec2D(object as number[]))
        }
    }
    return vects;
}

export const lengthOf = function (object: number[] | Konva.Vector2d[] | Konva.Line): number {
    const points = toVec2DArray(object);
    let length = 0
    for (let i = 0; i < points.length - 1; i++) {
        length += vec2DDistance(points[i], points[i + 1]);
    }
    return length;
}

export const middlePointOf = function (object: number[] | Konva.Vector2d[] | Konva.Line): Konva.Vector2d {
    const points = toVec2DArray(object);
    const A = points?.[0] ?? Vec2DZero
    const B = points.at(-1) ?? A
    return {
        x: A.x - (A.x - B.x) / 2,
        y: A.y - (A.y - B.y) / 2
    };
}

export const pointOf = function (line: Konva.Line, distance: number): Konva.Vector2d {
    const [A, B] = toVec2DArray(line)

    // Calculate the direction vector of the line
    const dx = B.x - A.x;
    const dy = B.y - A.y;

    // Calculate the length of the line segment
    const length = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector
    const normalizedDx = dx / length;
    const normalizedDy = dy / length;

    // Calculate the coordinates of the third point
    const x3 = A.x + normalizedDx * distance;
    const y3 = A.y + normalizedDy * distance;

    return { x: x3, y: y3 };
}