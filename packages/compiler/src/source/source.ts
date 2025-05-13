import { readFileSync } from "fs";

export class RiftSource
{
    name: string;
    code: string;

    constructor(name: string, code: string)
    {
        this.name = name;
        this.code = code;
    }

    static fromFile(filePath: string): RiftSource
    {
        const code = readFileSync(filePath, "utf-8");
        return new RiftSource(filePath, code);
    }
}