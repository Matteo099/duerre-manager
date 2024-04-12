export interface IDieDataShapeDao {
    type: 'bezier' | 'line' | 'cut';
    points: number[];
}