import { parse } from './../index';

describe(`Let's make sure basic usage always works`, () => {
	console.log(parse(`<View />`));
	test('Components without parameters should work', () => {
		expect(parse(`<View />`).length).toBe(1);
	});

	test('A simple test for basic jsx configuration', () => {
		const configuration: string = `<View id={5} active={true} style="font-size: 12px;font-weight: 500" />`;
		const result = parse(configuration);
		expect(result.length).toBe(1);
	});

	test('User should able to pass an arrow function', () => {
		const functionTemplate: string = '(a, b) => a + b';
		const result = parse(`<Test calculate={${functionTemplate}} />`);
		expect(result.length).toBe(1);
		expect(result[0].calculate).toEqual(functionTemplate);
	});

	test('Make sure we do not cast "prop values"', () => {
		const result = parse(
			`<Test prop1="a" prop2={'1'} prop3={2} prop4={10.00} prop5={true} prop6={[1,2,3]} prop7={null} />`
		);
		expect(result.length).toEqual(1);
		expect(result[0].prop1).toEqual('a');
		expect(result[0].prop2).toEqual('1');
		expect(result[0].prop3).toEqual(2);
		expect(result[0].prop4).toEqual(10.00);
		expect(result[0].prop5).toEqual(true);
		expect(result[0].prop6).toEqual([1,2,3]);
		expect(result[0].prop7).toEqual(null);
	});
});

test('exception test', () => {
	expect(() => {
		parse(`<Invalid component`);
	}).toThrow(`Could not parse the configuration`);
});
