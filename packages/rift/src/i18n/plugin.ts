import { Builder } from "src/core/builder";
import { Plugin } from "src/core/plugin";

class I18nPlugin implements Plugin
{
    constructor(public locales: string[] = [])
    {
    }

    init(builder: Builder)
    {

    }
};

export const i18nPlugin = (locales: string[]) => new I18nPlugin(locales);