import { ElementNode } from "../../ast/element.node";
import { RiftNode } from "../../ast/node";
import { EvaluatorContext } from "../context";
import { VDOMElementNode } from "../vdom/element";
import { VDOMNode } from "../vdom/node";

export function elementEvaluator(node: ElementNode, context: EvaluatorContext): VDOMNode | VDOMNode[]
{
    let vdomNode = new VDOMElementNode(node.name);

    for (let attribute of node.attributes)
    {
        vdomNode.attributes.push({
            name: attribute.name,
            value: attribute.value
        });
    }

    for(let child of node.children)
    {
        let newChildren = context.getEvaluator().evaluateNode(child, context);
        if (Array.isArray(newChildren))
        {
            for (let item of newChildren)
            {
                vdomNode.children.push(item);
            }
        }
        else
        {
            vdomNode.children.push(newChildren);
        }
    }

    return vdomNode;

    // let newNodes: VDOMNode[] = [];

    // let evaluator = context.getEvaluator();

    // // do nothing just iterate through the nodes
    // for (let child of node.children)
    // {
    //     let newChildren = evaluator.evaluateNode(child, context);
    //     if (Array.isArray(newChildren))
    //     {
    //         for (let item of newChildren)
    //         {
    //             newNodes.push(item);
    //         }
    //     }
    //     else
    //     {
    //         newNodes.push(newChildren);
    //     }
    // }

    // return newNodes;
}