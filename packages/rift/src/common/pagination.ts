export class Page<ArrayType>
{
    constructor(
        public items: ArrayType[],
        public index: number,
        public start: number,
        public previous?: number,
        public next?: number,
    )
    {
    }

    public get end()
    {
        return this.start + this.items.length;
    }
}

export function paginate<ArrayType>(
    items: ArrayType[],
    pageSize: number
): Page<ArrayType>[]
{
    if(!items.length)
    {
        return [];
    }

    let pages = [];
    let pageCount = Math.ceil(items.length / pageSize);
    let pageIndex = 0;
    let start = 0;

    for (let i = 0; i < pageCount; i++)
    {
        let end = start + pageSize;
        let pageItems = items.slice(start, end);
        let page = new Page(pageItems, pageIndex, start, i > 0 ? pageIndex - 1 : undefined, i < pageCount - 1 ? pageIndex + 1 : undefined);
        pages.push(page);
        start += pageSize;
        pageIndex++;
    }
    return pages;
}