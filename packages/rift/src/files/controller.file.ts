import { Context } from "src/core/context";
import { Controller } from "src/core/controller";
import { File } from "src/core/file";

export class ControllerFile extends File
{
    private _module: any;

    public require(context: Context): Controller 
    {
        if (!this._module)
        {
            let module = require(this.path);

            if (module.default && typeof module.default === "function")
            {
                this._module = module.default(context) as Controller;
                return this._module;
            }

            if (module.default && typeof module.default === "object")
            {
                this._module = module.default as Controller;
                return this._module;
            }

            if (module.default)
            {
                throw new Error(`Invalid controller export in "${this.path}". Expected a function or an object as default export.`);
            }

            this._module = module as Controller;
            return this._module;
        }

        return this._module;
    }
};