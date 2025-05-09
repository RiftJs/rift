import { Context } from "rift/core";
import { getTags } from "./posts";
import { NjkController } from "rift/njk";

export default class BlogTagController
{
    constructor(
        public readonly controller: NjkController,
    )
    {
    }

    params(context: Context)
    {
        let tags = getTags(this.controller.file.metadata.postsPerPage ?? 5);

        tags.forEach((tag) =>
        {
            for (let postPage of tag.pages)
            {
                context.param({
                    tag: tag,
                    page: postPage,
                });
            }
        });
    }

    permalink(context: Context, params: Record<string, any>)
    {
        if (!params.tag)
        {
            return null;
        }

        if (!params.page?.index)
        {
            return `/blog/tag/${params.tag.slug}/`;
        }

        return `/blog/tag/${params.tag.slug}/page/${params.page?.index + 1}/`;
    }
};