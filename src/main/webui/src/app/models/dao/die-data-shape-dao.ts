export interface DieDataShapeDao {
    type: 'bezier' | 'line';
    // TODO
    points: number[];
    
    controls: number[] | undefined;
}