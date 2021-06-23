class Schema {
	constructor({models, rules = standardRules}) {
		this._models = models;
		this.rules = rules;

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

	get inferences() {
		return this.rules.reduce((inferences, rule) => {
			let targets;
			if (rule.targetType === Model) {
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

const standardRules = [
	new Rule(Model, 'Sample Model rule',
		model => true,
		model => console.log(`called on ${model.name}`)
	),
];

module.exports = {
	Schema,
	Model,
	Field,
	Key,
	PrimaryKey,
	Index
};
