import { RiftSource } from "../source/source";

/**
 * SourcePosition represents a position in a source file, including line, column, and offset.
 * Optionally includes a length for ranges.
 */
export interface SourcePosition
{
    source: RiftSource;
    line: number;
    column: number;
    offset: number;
    length?: number;
};