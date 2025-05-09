import { Context } from "src/core/context";
import { Controller } from "src/core/controller";
import { File } from "src/core/file";

/*
* TextController is a controller that renders text files.
*/
export class TextController extends Controller
{
    // async render(context: Context): Promise<string>
    // {
    //     let metadata = await this.metadata();
    //     let content = await this.file.content;

    //     // if (metadata.layout)
    //     // {
    //     //     let layout = await context.layout(metadata.layout);

    //     //     if (layout)
    //     //     {
    //     //         let newContext = context.makeChildContext();
    //     //         newContext.data.set("content", content);
    //     //         return await layout.render(newContext);
    //     //     }
    //     //     else
    //     //     {
    //     //         throw new Error(`Layout ${metadata.layout} not found`);
    //     //     }
    //     // }

    //     // // html <slot /> tags are replaced with the content of the slot
    //     // content.replace(/<slot\s+name="([^"]+)"\s*\/>/g, (match, name) =>
    //     // {
    //     //     let slotContent = context.data.get(name);
    //     //     if (slotContent)
    //     //     {
    //     //         return slotContent;
    //     //     }
    //     //     else
    //     //     {
    //     //         throw new Error(`Slot ${name} not found`);
    //     //     }
    //     // }
    //     // );


    //     return content;
    // }
};