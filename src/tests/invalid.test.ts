import { parse } from './../index';

describe('Invalid cases', () => {

	test('Non-completed tags should raise an error', () => {
		expect(() => {
			parse(`<Invalid component`);
		}).toThrow(`Could not parse the configuration`);
	});

	test('Unstructured tags should raise an error', () => {
		expect(() => {
			parse(`<View><Component1></View></Component1>`);
		}).toThrow(`Could not parse the configuration`);
    });
    
});
