// Thanks to @react-jsx-parser
const { print } = require('recast')
const acorn = require('acorn')
const acornJsx = require('acorn-jsx')
const parser = acorn.Parser.extend(acornJsx())


function parseStyleAttr(style) {
    switch (typeof style) {
        case 'string':
            return style
                .split(';')
                .filter(r => !!r)
                .reduce((map, rule) => {
                    const [name, value] = rule.split(':');
                    return {
                        ...map,
                        [name]: value,
                    }
                }, {})
        default:
            return undefined
    }
}


class JsxParser {
    parseJSX = rawJSX => {
        const wrappedJsx = `<root>${rawJSX}</root>`
        let parsed = []
        try {
            parsed = parser.parse(wrappedJsx);
            parsed = parsed.body[0].expression.children || [];
        } catch (error) {
            throw new Error(`Could not parse the configuration`);
        }
        return parsed.map(this.parseExpression).filter(Boolean);
    }

    parseExpression = expression => {
        switch (expression.type) {
            case 'ArrowFunctionExpression':
                return print(expression).code
            case 'JSXAttribute':
                if (expression.value === null) return true
                return this.parseExpression(expression.value)
            case 'JSXElement':
                return this.parseElement(expression)
            case 'JSXExpressionContainer':
                return this.parseExpression(expression.expression)
            case 'JSXText':
                return expression.value
            case 'ArrayExpression':
                return expression.elements.map(this.parseExpression)
            case 'BinaryExpression':
                switch (expression.operator) {
                    case '-':
                        return this.parseExpression(expression.left) - this.parseExpression(expression.right)
                    case '!=':
                        return this.parseExpression(expression.left) != this.parseExpression(expression.right)
                    case '!==':
                        return this.parseExpression(expression.left) !== this.parseExpression(expression.right)
                    case '*':
                        return this.parseExpression(expression.left) * this.parseExpression(expression.right)
                    case '**':
                        return this.parseExpression(expression.left) ** this.parseExpression(expression.right)
                    case '/':
                        return this.parseExpression(expression.left) / this.parseExpression(expression.right)
                    case '%':
                        return this.parseExpression(expression.left) % this.parseExpression(expression.right)
                    case '+':
                        return this.parseExpression(expression.left) + this.parseExpression(expression.right)
                    case '==':
                        return this.parseExpression(expression.left) == this.parseExpression(expression.right)
                    case '===':
                        return this.parseExpression(expression.left) === this.parseExpression(expression.right)
                }
                return undefined
            case 'CallExpression':
                const parsedCallee = this.parseExpression(expression.callee)
                if (parsedCallee === undefined) {
                    this.props.onError(
                        new Error(`The expression '${expression.callee}' could not parse.`)
                    )
                    return undefined
                }
                // eslint-disable-next-line no-case-declarations
                let params = []
                if (expression && expression['arguments'])
                    params = [...expression['arguments'].map(this.parseExpression)]
                return parsedCallee(params)
            case 'ConditionalExpression':
                return this.parseExpression(expression.test)
                    ? this.parseExpression(expression.consequent)
                    : this.parseExpression(expression.alternate)
            case 'Identifier':
                return {}
            case 'Literal':
                return expression.value
            case 'LogicalExpression':
                const left = this.parseExpression(expression.left)
                if (expression.operator === '||' && left) return left
                if ((expression.operator === '&&' && left) || (expression.operator === '||' && !left)) {
                    return this.parseExpression(expression.right)
                }
                return false
            case 'MemberExpression':
                const thisObj = this.parseExpression(expression.object) || {}
                const member = thisObj[expression.property.name]
                if (typeof member === 'function') return member.bind(thisObj)
                return member
            case 'ObjectExpression':
                const object = {}
                expression.properties.forEach(prop => {
                    object[prop.key.name || prop.key.value] = this.parseExpression(prop.value)
                })
                return object
            case 'UnaryExpression':
                switch (expression.operator) {
                    case '+':
                        return expression.argument.value
                    case '-':
                        return -1 * expression.argument.value
                    case '!':
                        return !expression.argument.value
                }
                return undefined
        }
    }

    parseName = element => {
        switch (element.type) {
            case 'JSXIdentifier':
                return element.name
            case 'JSXMemberExpression':
                return `${this.parseName(element.object)}.${this.parseName(element.property)}`
        }
    }

    parseElement = element => {
        const { children: childNodes = [], openingElement } = element
        const { attributes = [] } = openingElement
        const name = this.parseName(openingElement.name)
        const tagName = name.trim().toLowerCase()
        let children
        const component = name
        children = childNodes.map(this.parseExpression).filter(c => c && c.component)
        const props = {}
        attributes.forEach(expr => {
            if (expr.type === 'JSXAttribute') {
                const rawName = expr.name.name
                const attributeName = rawName
                const value = this.parseExpression(expr)
                const matches = []
                if (matches.length === 0) {
                    if (value === 'true' || value === 'false') {
                        props[attributeName] = value === 'true'
                    } else {
                        props[attributeName] = value
                    }
                }
            } else if ((expr.type === 'JSXSpreadAttribute' && expr.argument.type === 'Identifier') || expr.argument.type === 'MemberExpression') {
                const value = this.parseExpression(expr.argument)
                if (typeof value === 'object') {
                    Object.keys(value).forEach(rawName => {
                        const attributeName = rawName
                        const matches = []
                        if (matches.length === 0) {
                            props[attributeName] = value[rawName]
                        }
                    })
                }
            }
        })

        if (typeof props.style === 'string')
            props.style = parseStyleAttr(props.style)

        if (children) props.children = children
        return { component, ...props, raw: print(element).code }
    }
}

export default JsxParser;