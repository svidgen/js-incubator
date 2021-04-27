class Collectable {

	static instances = 0;

	items;
	pk;
	joinedTo;
	from;
	to;
	joinAs;

	constructor({name, pk, keygen, items, join, from, to, as, recurse} = {}) {
		this.name = name || `Collectable${this.constructor.instances}`;
		this.pk = pk || 'id';
		this.keygen = typeof(keygen) === 'function' ? keygen : require('uuid').uuidv4;
		this.items = items || {};
		this.from = from;
		this.to = to;
		this.joinAs = as;
		this.recurse = recurse || (items === join);
		this.joinedTo = this.recurse ? this : join;
		this.joinedAsParent = this.pk === this.from || !this.from;
		this.joinedAsChild = this.pk !== this.from;
		this.joinedToMany = this.joinedTo && (this.joinedTo.pk !== this.to);
		this.constructor.instances++;
	}

	join(table, {from, to, as, name}) {
		return new Collectable({
			pk: this.pk,
			items: this,
			name: name || `${this.name}_to_${table.name}`,
			join: table,
			as: as || 'join',
			from: from || this.pk,
			to: to || table.pk
		});
	}

	async get(k) {
		return this.ajoin({...(this.items.get ? await this.items.get(k) : this.items[k])});
	};

	validate(v, k) {
		if (typeof(v) !== 'object') {
			console.error("Attempting to save non-object", v);
			throw new Error("Only objects can be saved.");
		}
	};

	async put(v, k) {
		if (v instanceof Array) {
			return Promise.all(v.map(async item => this.put(item)));
		}

		this.validate(v, k);
		v = {...v};
		k = k || v[this.pk] || this.keygen();
		v[this.pk] = k;
		if (this.joinedTo) {
			const parentKey = this.joinedAsChild ? await this.putJoined(v) : this.putJoined(v);
			if (!this.joinedAsParent) {
				v[this.from] = parentKey;
			} else {
				delete v[this.joinAs];
			}
		}
		this.items.put ? (await this.items.put(v, k)) : (this.items[k] = v);
		return k
	};

	async putJoined(v) {
		if (this.joinedTo) {
			if (this.joinedAsParent) {
				let children;
				if (this.joinedToMany) {
					children = v[this.joinAs] || [];
				} else {
					children = v[this.joinAs] ? [v[this.joinAs]] : [];
				}
				children.forEach(child => child[this.to] = v[this.pk]);
				return Promise.all(children.map(async child => this.joinedTo.put(child)));
			} else {
				const parentItem = v[this.joinAs];
				if (parentItem) {
					return await this.joinedTo.put(parentItem);
				} else {
					return null;
				}
			}
		} else {
			return null;
		}
	};

	async ajoin(item) {
		if (this.joinedTo && this.to && item[this.from]) {
			const joinedItems = await this.joinedTo.find({[this.to]: item[this.from]});
			if (this.joinedToMany) {
				item[this.joinAs] = joinedItems;
			} else {
				item[this.joinAs] = joinedItems.pop();
			}
			return item;
		} else {
			return item;
		}
	};

	async find(predicate) {
		// eventually, we want this to filter in 3 passes:
		// 1. server-fiterable predicates
		// 2. client-side, left-hand filterable predicates
		// 3. post-join, right-hand filterable predicates

		// also ... this needs to return an iterable and handle
		// paging behind the scenes to prevent unnecessary scans
		// and transfer for remote data sources, like dynamo or s3

		let basis;
		if (this.items.find) {
			basis = await this.items.find(predicate);
		} else {
			let p = predicate || {};
			basis = Object.values(this.items).filter(item =>
				Object.entries(p).every(([k,v]) => item[k] === v)
			);
		}

		return Promise.all(basis.map(o => this.ajoin({...o})));
	};
};

module.exports = Collectable;
