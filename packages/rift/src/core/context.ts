import { Collection } from "./collection";
import { Project } from "./project";

export class Context
{
    constructor(
        public readonly project: Project,
        public readonly collections: Map<string, Collection> = new Map<string, Collection>(),
        public readonly data: { [key: string]: any } = {},
        public readonly parent: Context | null = null,
    )
    {

    }

    makeChildContext(): Context
    {
        return new Context(this.project, this.collections, this.data, this);
    }

    // async layout(name: string): Promise<RiftController>
    // {
    //     // read layouts from the config
    //     //return 
    //     return {} as any;
    // }

    params: Array<{ [key: string]: any }> = [];

    param(param: { [key: string]: any })
    {
        this.params.push(param);
    }

};