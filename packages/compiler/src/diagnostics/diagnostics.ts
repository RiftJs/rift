export interface Diagnostic
{
    message: string;
    position: { line: number; column: number; length?: number };
    stage: "lexer" | "parser" | "evaluator";
    severity: "error" | "warning";
}

export class DiagnosticsContext
{
    diagnostics: Diagnostic[] = [];

    report(diag: Diagnostic)
    {
        this.diagnostics.push(diag);
    }

    hasErrors()
    {
        return this.diagnostics.some(d => d.severity === "error");
    }
}
