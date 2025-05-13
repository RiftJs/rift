import { readFileSync } from "fs";

/**
 * RiftSource represents a source file or string to be parsed by the compiler.
 * Provides utility to load source from a file.
 */
export class RiftSource
{
    /** The name or path of the source. */
    name: string;
    /** The source code as a string. */
    code: string;

    /**
     * Creates a new RiftSource.
     * @param name The name or path of the source.
     * @param code The source code.
     */
    constructor(name: string, code: string)
    {
        this.name = name;
        this.code = code;
    }

    /**
     * Loads a RiftSource from a file.
     * @param filePath The path to the file.
     * @returns A new RiftSource instance.
     */
    static fromFile(filePath: string): RiftSource
    {
        const code = readFileSync(filePath, "utf-8");
        return new RiftSource(filePath, code);
    }
}