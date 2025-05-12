import { TextNode } from "../../ast/text.node";
import { EvaluatorContext } from "../context";
import { VDOMNode } from "../vdom/node";
import { VDOMTextNode } from "../vdom/text";

export function textEvaluator(node: TextNode, context: EvaluatorContext): VDOMNode | VDOMNode[]
{
    return new VDOMTextNode(node.text);
}