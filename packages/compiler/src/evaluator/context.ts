import { Evaluator } from "./evaluator";
import { VDOMDocument } from "./vdom/document";

export class EvaluatorContext
{
    constructor(
        protected evaluator: Evaluator,
        protected document: VDOMDocument,
        protected data: Record<string, any> = {},
        protected parent?: EvaluatorContext,
    )
    {
    }

    public get(key: string): any
    {
        if (this.data && key in this.data)
        {
            return this.data[key];
        }
        else if (this.parent)
        {
            return this.parent.get(key);
        }
        return undefined;
    }

    public set(key: string, value: any): void
    {
        if (this.data)
        {
            this.data[key] = value;
        }
        else if (this.parent)
        {
            this.parent.set(key, value);
        }
    }


    public has(key: string): boolean
    {
        return this.get(key) !== undefined;
    }

    public getAll(): Record<string, any>
    {
        return this.data;
    }

    public setAll(data: Record<string, any>): void
    {
        this.data = data;
    }

    public getParent(): EvaluatorContext | undefined
    {
        return this.parent;
    }

    public setParent(parent: EvaluatorContext): void
    {
        this.parent = parent;
    }

    public getEvaluator(): Evaluator
    {
        return this.evaluator;
    }

    public childContext(data: Record<string, any> = {}): EvaluatorContext
    {
        return new EvaluatorContext(this.evaluator, this.document, data, this);
    }
};