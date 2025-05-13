import chalk from "chalk";
import { CompilerError } from "../error/error";

export interface DiagnosticMessageConfig
{
    contextLinesBefore?: number;
    contextLinesAfter?: number;
    maxLineWidth?: number;
    horizontalContext?: number;
};

export function getDiagnosticMessage(
    error: CompilerError,
    config?: DiagnosticMessageConfig
): string
{
    const { line, column = 1, length = 1 } = error.position;
    const lines = error.position.source.code.split("\n");

    const contextLinesBefore = config?.contextLinesBefore ?? 5;
    const contextLinesAfter = config?.contextLinesAfter ?? 5;

    const start = Math.max(0, line - contextLinesBefore - 1);
    const end = Math.min(lines.length, line + contextLinesAfter);

    const gutterWidth = String(end).length;
    const lineNumPad = (n: number) => String(n).padStart(gutterWidth);

    const snippetLines: string[] = [];

    const maxLineWidth = config?.maxLineWidth ?? 120;
    const horizontalContext = config?.horizontalContext ?? 50;
    const errorLineRaw = lines[line - 1] || "";
    const sliceStart = Math.max(0, column - horizontalContext - 1);
    const sliceEnd = Math.min(errorLineRaw.length, column - 1 + length + horizontalContext);

    for (let i = start; i < end; i++)
    {
        const ln = i + 1;
        const isErrorLine = ln === line;
        const lineRaw = lines[i] || "";

        const visible = isErrorLine
            ? lineRaw.slice(sliceStart, sliceEnd)
            : lineRaw.length > maxLineWidth
                ? lineRaw.slice(0, maxLineWidth) + chalk.gray(" ...")
                : lineRaw;

        const marker = isErrorLine ? chalk.red(">") : chalk.gray(" ");
        const prefix = `${marker} ${chalk.gray(lineNumPad(ln) + " |")} `;

        let lineOut = isErrorLine
            ? chalk.white(visible.slice(0, column - 1 - sliceStart)) +
            chalk.bgRed.white(visible.slice(column - 1 - sliceStart, column - 1 - sliceStart + length)) +
            chalk.white(visible.slice(column - 1 - sliceStart + length))
            : chalk.gray(visible);

        snippetLines.push(prefix + lineOut);

        if (isErrorLine)
        {
            const caretPad = column - 1 - sliceStart;
            const caret =
                `  ${" ".repeat(gutterWidth)} | ` +
                " ".repeat(caretPad) +
                chalk.red("^".repeat(Math.max(1, length)));
            snippetLines.push(caret);
        }
    }

    return [
        chalk.bold.red(`❌ ${error.position.source.name}:${line}:${column}`),
        "",
        ...snippetLines,
        "",
        chalk.bold("💬 " + chalk.red(error.message)),
        ""
    ].join("\n");
}
