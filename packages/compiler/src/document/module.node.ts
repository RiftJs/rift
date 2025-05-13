import { RiftSource } from "../source/source";
import { RiftBaseNode } from "./base.node";

export interface RiftModuleNode extends RiftBaseNode<"rift-module">
{
    source: RiftSource;
}