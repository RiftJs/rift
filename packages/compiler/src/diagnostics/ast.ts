import { RiftModuleNode } from "../document/module.node";

export function getModuleDiagnostics(module: RiftModuleNode): string
{
    let diagnostics: string[] = [];

    // Add module diagnostics
    diagnostics.push(`Module: ${module.source.name}`);
    diagnostics.push(`Source: ${module.source.code}`);

    // Add other diagnostics as needed
    // ...

    return diagnostics.join("\n");
}