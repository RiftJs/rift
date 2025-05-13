import { LexerContext } from "../context";
import { readIdentifier } from "./read-identifier";

/*
* Reads a matter start tag from the input.
* A matter start tag is a string that starts with `---` or `+++`.
* returns the format if specified or an empty string if not.
*/
export function readMatterStartTag(
    context: LexerContext
): string | null
{
    if (context.index == 0 && context.input.indexOf("---") === 0)
    {
        context.advance(3);
        let format = readIdentifier(context);
        return format ?? "";
    }

    return null;
}