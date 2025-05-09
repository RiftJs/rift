import { findContent } from "@riftjs/rift/common";
import { Context } from "@riftjs/rift/core";

export default class PostsController
{
    async params(ctx: Context)
    {
        let posts = await Promise.all(findContent("./src/content/*.md").map( async file => ({
            title: file.metadata.title,
            slug: file.metadata.slug,
            content: await file.content,
            date: file.metadata.date,
            tags: file.metadata.tags
        })));
       
        ctx.param({
            posts: posts
        });
        
    }

}