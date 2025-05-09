import { Context } from "rift/core";
import { NjkController } from "rift/njk";
import { getCategories } from "./posts";

export default class BlogCategoryController
{
    constructor(
        public readonly controller: NjkController,
    )
    {
    }

    params(context: Context)
    {
        let categories = getCategories(this.controller.file.metadata.postsPerPage ?? 5);

        categories.forEach((category) =>
        {
            for (let postPage of category.pages)
            {
                context.param({
                    category: category,
                    page: postPage,
                });
            }
        });
    }

    permalink(context: Context, params: Record<string, any>)
    {
        if (!params.category)
        {
            return null;
        }

        if (!params.page?.index)
        {
            return `/blog/category/${params.category.slug}/`;
        }

        return `/blog/category/${params.category.slug}/page/${params.page?.index + 1}/`;
    }
};