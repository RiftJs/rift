
import { globSync } from "glob";
import { TextFile } from "src/files/text.file";

export function findContent(pattern: string): TextFile[]
{
    return globSync(pattern, { nodir: true }).map((filePath) =>
    {
        return new TextFile(filePath, { type: "content" });
    });
    return [];
};