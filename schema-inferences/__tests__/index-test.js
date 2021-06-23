const { Transformer } = require('../lib/index');
const {
	Schema,
	Model,
	Field,
	Key,
	PrimaryKey,
	Rules
} = require('../lib/schema.js');

function expectInference(schema, inference) {
	expect(schema.inferences.find(inf => inf.rule === inference)).toBeTruthy();
}

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
	});

	it('infers PK if no @primarykey is present', () => {
		const schema = new Schema({models: [
			new Model({
				name: 'model',
				fields: [
					new Field('name', 'String')
				]
			})
		]});

		expectInference(schema, Rules.AddMissingPK);
	});

	it('does NOT infer PK if @primarykey is present', () => {
		const schema = new Schema({models: [
			new Model({
				name: 'model',
				fields: [
					new Field('id', 'ID!', [new PrimaryKey()]),
					new Field('name', 'String')
				],
			})
		]});

		expect(schema.inferences.find(inf => inf.rule === Rules.AddMissingPK)).toBeFalsy();
	});

	it('identifies @primarykey if noted', () => {
	});

	it('infers FK ID field for M:1', () => {
		const schema = new Schema({models: [
			new Model({
				name: 'Model',
				fields: [
					new Field('id', 'ID!', [new PrimaryKey()]),
					new Field('name', 'String'),
					new Field('other', 'OtherModel')
				],
			}),
			new Model({
				name: 'OtherModel',
				fields: [
					new Field('id', 'ID!', [new PrimaryKey()]),
					new Field('name', 'String')
				],
			})
		]});

		expectInference(schema, Rules.AddMissingFK);
	});

	it('infers @key on foreign entity ID', () => {
	});

	it('infers join table on M:M', () => {
		const schema = new Schema({models: [
			new Model({
				name: 'A',
				fields: [
					new Field('id', 'ID!', [new PrimaryKey()]),
					new Field('name', 'String'),
					new Field('other', '[B]')
				],
			}),
			new Model({
				name: 'B',
				fields: [
					new Field('id', 'ID!', [new PrimaryKey()]),
					new Field('name', 'String'),
					new Field('other', '[A]')
				],
			})
		]});

		expectInference(schema, Rules.AddMissingJoinTable);
	});

});
