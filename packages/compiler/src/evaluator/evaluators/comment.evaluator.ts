import { CommentNode } from "../../ast/comment.node";
import { EvaluatorContext } from "../context";
import { VDOMCommentNode } from "../vdom/comment";
import { VDOMNode } from "../vdom/node";

export function commentEvaluator(node: CommentNode, context: EvaluatorContext): VDOMNode | VDOMNode[]
{
    return new VDOMCommentNode(node.comment);
}