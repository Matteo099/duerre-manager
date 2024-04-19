export interface IDieLine {
    type: 'bezier' | 'line' | 'cut';
    points: number[];
}