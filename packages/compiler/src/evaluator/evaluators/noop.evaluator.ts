import { RiftNode } from "../../ast/node";
import { EvaluatorContext } from "../context";
import { VDOMNode } from "../vdom/node";

/*
* The noop evaluator is used to evaluate nodes that do not need any special processing.
* It is used for nodes that are not elements or blocks, such as text and comments.
* It simply returns the children of the node as VDOM nodes.
* It is also used for blocks that do not need any special processing.
*/
export function noopEvaluator(node: RiftNode, context: EvaluatorContext): VDOMNode | VDOMNode[]
{
    console.log("Noop evaluator called for node", node.kind, node);

    // if the node is a block, we need to evaluate the children
    let newNodes: VDOMNode[] = [];

    let evaluator = context.getEvaluator();

    // do nothing just iterate through the nodes
    for (let child of node.children)
    {
        let newChildren = evaluator.evaluateNode(child, context);
        if (Array.isArray(newChildren))
        {
            for (let item of newChildren)
            {
                newNodes.push(item);
            }
        }
        else
        {
            newNodes.push(newChildren);
        }
    }

    return newNodes;
}