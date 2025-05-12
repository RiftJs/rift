import { ForeachStatementNode } from "../../ast/foreach-statement.node";
import { RiftNode } from "../../ast/node";
import { EvaluatorContext } from "../context";
import { EvaluationError } from "../error";
import { VDOMNode } from "../vdom/node";

export function foreachEvaluator(node: ForeachStatementNode, context: EvaluatorContext): VDOMNode[]
{
    // do nothing

    let evaluator = context.getEvaluator();


    let vdomNodes: VDOMNode[] = [];

    let items = context.get(node.collection);
    if (items === undefined)
    {
        throw new EvaluationError(`Undefined variable: ${node.collection}`, node);
    }

    for (let item of items)
    {
        let childContext = context.childContext();

        childContext.set(node.alias, item);
        childContext.set(node.index, items.indexOf(item));
        for (let child of node.block!.children)
        {
            let newNodes = evaluator.evaluateNode(child, childContext);
            if (Array.isArray(newNodes))
            {
                vdomNodes.push(...newNodes);
            }
            else
            {
                vdomNodes.push(newNodes);
            }
        }
    }

    return vdomNodes;
}