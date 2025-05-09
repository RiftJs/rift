import { findContent, Page, paginate } from "rift/common";
import slugify from "slugify";

export interface BlogPost
{
    title: string;
    slug: string;
    date: Date;
    content: string;
    tags: string[];
    category: string;
};

export function getPosts(locale: string = "en"): BlogPost[]
{
    let posts = findContent("src/content/posts/**/*.md");

    return posts.map((post) => ({
        title: post.metadata.title,
        slug: post.metadata.slug,
        date: post.metadata.date,
        content: post.content,
        tags: post.metadata.tags,
        category: post.metadata.category,
    }));
}

export function getPaginatedPosts(postsPerPage: number, locale: string = "en"): Page<BlogPost>[]
{
    let posts = getPosts();
    return paginate(posts, postsPerPage);
}

export interface BlogCategory
{
    name: string;
    slug: string;
    posts: BlogPost[];
    pages: Page<BlogPost>[];
};

export function getCategories(postsPerPage: number = 10, locale: string = "en"): BlogCategory[]
{
    let posts = getPosts(locale);

    let categories: { [key: string]: BlogCategory } = {};


    for (let post of posts)
    {
        if(!post.category)
        {
            continue;
        }

        let categorySlug = slugify(post.category, { lower: true, strict: true });

        if (!categories[categorySlug])
        {
            categories[categorySlug] = {
                name: post.category,
                slug: categorySlug,
                posts: [],
                pages: [],
            };
        }

        categories[categorySlug].posts.push(post);
    }

    for (let category of Object.values(categories))
    {
        category.pages = paginate(posts, 10);
    }

    return Object.values(categories);
}

export interface BlogTag
{
    name: string;
    slug: string;
    posts: BlogPost[];
    pages: Page<BlogPost>[];
};

export function getTags(postsPerPage: number = 10, locale: string = "en"): BlogTag[]
{
    let posts = getPosts(locale);

    let tags: { [key: string]: BlogTag } = {};

    for (let post of posts)
    {
        if(!post.tags || post.tags.length === 0)
        {
            continue;
        }
        
        for (let tag of post.tags)
        {
            let tagSlug = slugify(tag, { lower: true, strict: true });

            if (!tags[tagSlug])
            {
                tags[tagSlug] = {
                    name: tag,
                    slug: tagSlug,
                    posts: [],
                    pages: [],
                };
            }

            tags[tagSlug].posts.push(post);
        }
    }

    for (let tag of Object.values(tags))
    {
        tag.pages = paginate(tag.posts, postsPerPage);
    }

    return Object.values(tags);
}