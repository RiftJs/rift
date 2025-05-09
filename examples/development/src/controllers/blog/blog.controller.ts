import { Context } from "rift/core";
import { getPaginatedPosts } from "./posts";
import { NjkController } from "rift/njk";

export default class BlogController
{
    constructor(
        public readonly controller: NjkController,
    )
    {
    }

    params(context: Context)
    {
        let pages = getPaginatedPosts(this.controller.file.metadata.postsPerPage ?? 5);

        pages.forEach((page) =>
        {
            context.param({
                page: page,
            });
        });
    }

    permalink(context: Context, params: Record<string, any>)
    {
        if (!params.page?.index)
        {
            return `/blog/`;
        }
        
        return `/blog/page/${params.page?.index + 1}/`;
    }
};