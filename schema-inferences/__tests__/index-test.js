const { Transformer } = require('../lib/index');
const {
	Schema,
	Model,
	Field,
	Key,
	PrimaryKey
} = require('../lib/schema.js');

describe('Schema', () => {

	it('identifies relevant inferences against itself', () => {
		const schema = new Schema({models: [
			new Model({
				name: 'model',
				fields: [
					new Field('name', 'String')
				]
			})
		]});

		expect(schema.inferences).toBeTruthy();
		expect(schema.inferences.length).toBeGreaterThan(0);
		console.log(schema.inferences);
	});

	it('assumes `id` is PK if no @primarykey is noted', () => {
	});

	it('identifies @primarykey if noted', () => {
	});

	it('infers FK ID field for M:1', () => {
	});

	it('infers @key on foreign entity ID', () => {
	});

});
