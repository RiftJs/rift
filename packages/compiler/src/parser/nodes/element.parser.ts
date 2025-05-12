import { Token, TokenString, TokenType } from "../../lexer/tokens";
import { Logger } from "../../utils/logger";
import { ParserContext } from "../context";

export function parseElement(context: ParserContext, token: Token): boolean
{
    if (token.kind !== TokenType.OpenTag)
    {
        throw context.error(`Expected OpenTag, got ${token.kind}`, token.position);
    }

    // Closing tag
    let closingTag = context.peek();
    if (closingTag && closingTag.kind == TokenType.Slash)
    {
        if (context.currentNode.kind !== "element")
        {
            throw context.error(`Expected closing tag for 'element' node, but got '${context.currentNode.kind}'`, closingTag.position);
        }

        context.consume();

        let tagNameIdentifier = context.expect(TokenType.Identifier);
        if (tagNameIdentifier === null)
        {
            throw context.error(`Expected Identifier after OpenTag`, token.position);
        }

        if (tagNameIdentifier.name !== context.currentNode.name)
        {
            throw context.error(`Expected closing tag </${context.currentNode.name}>, got </${tagNameIdentifier.name}>`, tagNameIdentifier.position);
        }

        context.consume();

        // Consume the closing tag
        context.expect(TokenType.CloseTag);
        context.consume();

        context.currentNode = context.currentNode.parent!;

        return true;
    }

    let tagNameIdentifier = context.expect(TokenType.Identifier);
    if (tagNameIdentifier === null)
    {
        throw context.error(`Expected Identifier after OpenTag`, token.position);
    }
    context.consume();

    Logger.debug(`Parsing element: <${tagNameIdentifier.name}>`, "Parser");

    let node = context.createChildNode("element", tagNameIdentifier.position, {
        name: tagNameIdentifier.name,
        attributes: [],
        bindings: [],
        directives: [],
        selfClosing: false,
    });
    context.parser.events.emit("tagOpen", node);

    console.log("current token:", context.peek());

    let nextToken = context.peek();
    // parse attributes
    while ((nextToken = context.peek()))
    {
        //console.log("Next token:", nextToken);

        if (!nextToken)
        {
            throw context.error(`Unexpected end of file after <${tagNameIdentifier.name}`, tagNameIdentifier.position);
        }


        // Parse directives
        if (nextToken.kind == TokenType.Multiply)
        {
            context.consume();
            let binding = context.peek();
            if (!binding || binding.kind !== TokenType.Identifier)
            {
                throw context.error(`Expected identifier after '*'`, nextToken.position);
            }
            context.consume();

            let attributeValue = parseAttributeValue(context);

            node.directives.push({
                name: binding.name,
                expression: attributeValue?.value,
            });

            context.parser.events.emit("tagDirective", node, {
                name: binding.name,
                expression: attributeValue?.value,
            });

            continue;
        }

        // Parse bindings two way -> in.out [(value)]=""
        if (nextToken.kind == TokenType.OpenBracket)
        {
            if (context.peek(1)?.kind === TokenType.OpenParenthesis)
            {
                context.consume();
                context.consume();
                let binding = context.peek();
                if (!binding || binding.kind !== TokenType.Identifier)
                {
                    throw context.error(`Expected identifier after '[('`, nextToken.position);
                }
                context.consume();

                let direction = context.peek();
                if (!direction || direction.kind !== TokenType.CloseParenthesis)
                {
                    throw context.error(`Expected ')' after ${binding.name}`, binding.position);
                }
                context.consume();

                let closeBracket = context.peek();
                if (!closeBracket || closeBracket.kind !== TokenType.CloseBracket)
                {
                    throw context.error(`Expected ']' after ${binding.name}`, binding.position);
                }
                context.consume();

                let attributeValue = parseAttributeValue(context);
                if (!attributeValue)
                {
                    throw context.error(`Expected attribute value after ${binding.name}`, binding.position);
                }

                node.bindings.push({
                    name: binding.name,
                    expression: attributeValue?.value,
                    direction: "in-out",
                });

                context.parser.events.emit("tagBinding", node, {
                    name: binding.name,
                    expression: attributeValue?.value,
                    direction: "in-out",
                });

                continue;
            }
        }

        // Parse bindings one way -> in [value]=""
        if (nextToken.kind == TokenType.OpenBracket)
        {
            context.consume();
            let binding = context.peek();
            if (!binding || binding.kind !== TokenType.Identifier)
            {
                throw context.error(`Expected identifier after '['`, nextToken.position);
            }
            context.consume();

            let direction = context.peek();
            if (!direction || direction.kind !== TokenType.CloseBracket)
            {
                throw context.error(`Expected ']' after ${binding.name}`, binding.position);
            }
            context.consume();

            let attributeValue = parseAttributeValue(context);
            if (!attributeValue)
            {
                throw context.error(`Expected attribute value after ${binding.name}`, binding.position);
            }

            node.bindings.push({
                name: binding.name,
                expression: attributeValue?.value,
                direction: "in",
            });

            context.parser.events.emit("tagBinding", node, {
                name: binding.name,
                expression: attributeValue?.value,
                direction: "in",
            });

            continue;
        }

        // Parse bindings one way -> out (value)=""
        if (nextToken.kind == TokenType.OpenParenthesis)
        {
            context.consume();
            let binding = context.peek();
            if (!binding || binding.kind !== TokenType.Identifier)
            {
                throw context.error(`Expected identifier after '('`, nextToken.position);
            }
            context.consume();

            let direction = context.peek();
            if (!direction || direction.kind !== TokenType.CloseParenthesis)
            {
                throw context.error(`Expected ')' after ${binding.name}`, binding.position);
            }
            context.consume();

            // Attempt to parse attribute value
            let attributeValue = parseAttributeValue(context);
            if (!attributeValue)
            {
                throw context.error(`Expected attribute value after ${binding.name}`, binding.position);
            }

            node.bindings.push({
                name: binding.name,
                expression: attributeValue?.value,
                direction: "out",
            });

            context.parser.events.emit("tagBinding", node, {
                name: binding.name,
                expression: attributeValue?.value,
                direction: "out",
            });

            continue;
        }



        // No attributes to be found
        if (nextToken.kind != TokenType.Identifier)
        {
            break;
        }

        context.consume();

        // Attempt to parse attribute value
        let attributeValue = parseAttributeValue(context);
        node.attributes.push({
            name: nextToken.name,
            value: attributeValue?.value,
        });

        context.parser.events.emit("tagAttribute", node, {
            name: nextToken.name,
            value: attributeValue?.value,
        });
    }

    let closingToken = context.peek();
    if (!closingToken)
    {
        throw context.error(`Unexpected end of file after <${tagNameIdentifier.name}`, tagNameIdentifier.position);
    }

    if (closingToken.kind === TokenType.CloseTag)
    {
        context.currentNode = node; // Set current node to the new element
        node.selfClosing = false;
        context.consume();


        return true;
    }

    if (closingToken.kind === TokenType.SelfCloseTag)
    {
        node.selfClosing = true;
        context.consume();

        context.parser.events.emit("tagClose", node);
        return true;
    }

    throw context.error(`Expected '>' or '/>' after <${tagNameIdentifier.name} but got '${closingToken.kind}'`, context.lexer.lastToken()!.position);
}

function parseAttributeValue(context: ParserContext): TokenString | null
{
    let equalSign = context.peek();

    //No equal sign, no attribute value
    if (!equalSign || equalSign.kind !== TokenType.Equals)
    {
        return null;
    }

    context.consume();

    // Attribute value
    let attributeValue = context.peek();
    if (!attributeValue || attributeValue.kind !== TokenType.String)
    {
        throw context.error(`Expected string literal after =`, equalSign.position);
    }
    context.consume();

    return attributeValue;
}