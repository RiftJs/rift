import nunjucks from "nunjucks";

export interface NjkConfig
{
    templateDir: string;
    controllerDir: string;
    environment?(env: nunjucks.Environment): void;
};

export const defaultNjkConfig: NjkConfig = {
    templateDir: "./templates",
    controllerDir: "./controllers",
};