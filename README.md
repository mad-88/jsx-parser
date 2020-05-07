# JSX Parser
JSX to Object parser.

## Usage
Just need to pass a valid string to parse function
```
import { parse } from 'jsx-parser';
const nodes = parse(`<View id="4" />`);
```

`parse` function will generate an array of objects which includes all the props with their type
```
[ { component: 'View', id: 4, children: [], raw: '<View />' } ]
```

## Use attribute filter
You may need a search function that filters the configuration with special function. 
```
import { parse, searchByAttr } from 'jsx-parser';
const nodes = parse(`<View>
    <Dummy className="x" />
    <Dummy className="y" />
    <Dummy id={5} />
    <Dummy minLength={8} />
    <View>
        <Dummy minLength={9} />
    </View>
    <Dummy />
</View>`);
const results = searchByAttr(nodes, (node) => node.className === 'x')
```





