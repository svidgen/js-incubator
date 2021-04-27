
class Collection {
	constructor({items = []} = {}) {
		this.items = items;
	};

	by(f) {
		let target = [...this.items];
		target.sort((a,b) => f(a) > f(b) ? 1 : -1);
		return new Collection({items: target});
	};

	[Symbol.iterator]() {
		let i = 0;
		return {
			next: () => {
				if (i < this.items.length) {
					return {done: false, value: this.items[i++]};
				} else {
					return {done: true};
				}
			}
		};
	};
};


// combines two Collections into the common elements by PK
class Intersection {
};


// instantiates an object that provides a slideable window/slice
// of a Collection in an efficient manner.
class Window {
};


// a composable, extendable entity that describes which items to
// extract from a set of collections.
class Predicate {

	// creates a predicate 
	constructor() {
	};

	// splits a predicate by entity + [...key].
	// intended for a collection or API to extract portions of
	// a predicate that can be serialized and/or executed more
	// efficiently internally by a backend or index.
	split() {
	};

};



module.exports = {
	Collection,
	Intersection,
	Window,
	Predicate
};
