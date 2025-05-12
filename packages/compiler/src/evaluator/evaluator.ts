import { RiftDocumentNode } from "../ast/document.node";
import { NodeKind, NodeType, RiftNode } from "../ast/node";
import { EvaluatorContext } from "./context";
import { EvaluationError } from "./error";
import { commentEvaluator } from "./evaluators/comment.evaluator";
import { elementEvaluator } from "./evaluators/element.evaluator";
import { foreachEvaluator } from "./evaluators/foreach.evaluator";
import { noopEvaluator } from "./evaluators/noop.evaluator";
import { textEvaluator } from "./evaluators/text.evaluator";
import { VDOMDocument } from "./vdom/document";
import { VDOMNode } from "./vdom/node";


type EvaluatorMap = {
    [K in NodeKind]: (node: Extract<Node, { kind: K }>, context: EvaluatorContext) => VDOMNode | VDOMNode[]
};

export class Evaluator
{
    nodeEvaluators: EvaluatorMap = {
        "document": noopEvaluator,
        "text": textEvaluator,
        "comment": commentEvaluator,
        "element": elementEvaluator,
        "block": noopEvaluator,
        "foreach-statement": foreachEvaluator
    };

    constructor(
        protected document: RiftDocumentNode,
    )
    {
    }

    public evaluate(data: Record<string, any> = {}): VDOMDocument
    {
        let vdomDocument = new VDOMDocument();
        let context = new EvaluatorContext(this, vdomDocument, data);

        for (let node of this.document.children)
        {
            let vdomNode = this.evaluateNode(node, context);
            if (Array.isArray(vdomNode))
            {
                vdomDocument.children.push(...vdomNode);
            }
            else
            {
                vdomDocument.children.push(vdomNode);
            }
        }

        return vdomDocument;
    }

    // Evaluates a node of any kind and returns a new node evaluated by the evaluator
    public evaluateNode(node: RiftNode, context: any): VDOMNode | VDOMNode[]
    {
        let evaluator = this.nodeEvaluators[node.kind] as unknown as (node: RiftNode, context: EvaluatorContext) => VDOMNode | VDOMNode[];
        if (evaluator)
        {
            let vdomNodes = evaluator(node, context);
            if (!vdomNodes)
            {
                throw new EvaluationError(`Failed to evaluate node of kind ${node.kind}`, node);
            }

            return vdomNodes;
        }
        else
        {
            console.log("Node", node);
            
            throw new EvaluationError(`No evaluator found for node kind: ${node.kind}`, node);
        }
    }
};