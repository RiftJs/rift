import { existsSync } from "fs";
import nunjucks, { ILoaderAny } from "nunjucks";
import { Context } from "src/core/context";
import { Controller } from "src/core/controller";
import { File } from "src/core/file";

export class NjkDataController extends Controller
{
    constructor(
        public readonly loader: ILoaderAny,
        public readonly file: File
    )
    {
        super(file);
    }

}