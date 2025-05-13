import { RiftSource } from "../source/source";
import { RiftBaseNode } from "./base.node";

/**
 * Represents the root module node in the AST, containing the source file reference.
 */
export interface RiftModuleNode extends RiftBaseNode<"rift-module">
{
    source: RiftSource;
}