class Schema {
	constructor({models, rules = standardRules}) {
		this._models = models;
		this.rules = Object.values(rules);

		this._models.forEach(m => m.schema = this);
	};

	get models() {
		return this._models;
	}

	get fields() {
		return this.models.map(model => model.fields).flat();
	};

	get modelDirectives() {
		return this.models.map(model => model.directives).flat();
	};

	get fieldDirectives() {
		return this.fields.map(field => field.directives).flat();
	};

	get directives() {
		return [...this.modelDirectives, this.fieldDirectives];
	};

	get inferences() {
		return this.rules.reduce((inferences, rule) => {
			let targets;
			if (rule.targetType === Schema) {
				targets = [this];
			} else if (rule.targetType === Model) {
				targets = this.models;
			} else if (rule.targetType === Field) {
				targets = this.fields;
			} else if (rule.targetType === ModelDirective) {
				targets = this.modelDirectives;
			} else if (rule.targetType === FieldDirective) {
				targets = this.fieldDirectives;
			}
			const newInferences = targets.filter(t => rule.appliesTo(t)).map(target => {
				return new Inference({rule, target});
			});
			return [...inferences, ...newInferences];
		}, []);
	};
};

class Model {
	constructor({name, fields, directives = []}) {
		this.name = name;
		this.fields = fields;
		this.directives = directives;

		this.fields.forEach(f => f.model = this);
		this.directives.forEach(d => d.model = this);
	}
};

class Field {
	constructor(name, type, directives = []) {
		this.name = name;
		this.type = type;
		this.directives = directives;

		this.directives.forEach(d => d.field = this);
	}
};

class ModelDirective {
};

class FieldDirective {
};

class Key {
};

class PrimaryKey {
};

class Index {
};

class Inference {
	constructor({rule, target}) {
		this.rule = rule;
		this.target = target;
	}
}

class Rule {
	constructor(targetType, description, test, transform) {
		this.targetType = targetType;
		this.description = description;
		this.test = test;
		this.transform = transform;
	};

	appliesTo(target) {
		return this.test(target);
	}
};

// shortcut: partial types list including "bangs" ... yyyeah. wouldn't do it like this for real!
const PrimitiveTypes = [
	'ID', 'ID!',
	'String', 'String!'
]

const Rules = {
	AddMissingPK: new Rule(Model, 'implicit PK',
		model => !model.directives.find(d => d instanceof PrimaryKey),
		model => {
			// transform
		}
	),
	AddMissingFK: new Rule(Field, 'implicit FK',
		field => {
			const allModelNames = field.model.schema.models.map(model => model.name);
			if (allModelNames.indexOf(field.type) < 0) {
				return false;
			}
			const FKName = field.name + 'ID';
			const FKType = 'ID!';
			return !field.model.fields.find(f => f.name === FKName && f.type === FKType);
		},
		field => {
			// transform
		}
	),
	AddMissingJoinTable: new Rule(Field, 'join table',
		field => {
			const allModels = field.model.schema.models;
			const manyref = field.type.match(/^\[(\w+)\]$/);
			if (manyref) {
				const refModel = allModels.find(model => model.name === manyref[1]);
				if (refModel.fields.find(f => f.type === `[${field.model.name}]`)) {
					return true;
				}
			}
			return false;
		},
		field => {
			// transform
		}
	)
};

// standard rules and their order of application
const standardRules = [
	Rules.AddMissingFK,
	Rules.AddMissingPK,
	Rules.AddMissingJoinTable
];

module.exports = {
	Schema,
	Model,
	Field,
	Key,
	PrimaryKey,
	Index,
	Rules
};
