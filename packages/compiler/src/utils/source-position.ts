import { RiftSource } from "../source/source";

export interface SourcePosition
{
    source: RiftSource;
    
    line: number;
    column: number;
    offset: number;
    length?: number;
};