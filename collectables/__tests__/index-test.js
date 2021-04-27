const Collectable = require('../lib/collectable');
const { Collection } = require('../lib/collection');

describe('Fake Collectable', () => {

	test('can add and retrieve items that have id', async done => {
		const api = new Collectable();

		let o = {id: 'somekey', value: 'somevalue'};
		await api.put(o);
		expect(await api.get('somekey')).toEqual(o);
		expect(await api.find()).toEqual([o]);

		done();
	});

	test('can add and retrieve items and set id', async done => {
		const api = new Collectable();
	
		let id = 'somekey-123';
		let o = {value: 'somevalue'};

		await api.put(o, id);
		expect(await api.get(id)).toEqual({id, ...o});
		expect(await api.find()).toEqual([{id, ...o}]);

		done();
	});

	test('can be used for smart, lazy joins', async done => {
		const customerRepo = new Collectable({name: 'customers'});
		const orderRepo = new Collectable({name: 'orders'});

		let customers = [
			{id: 1, name: "Bob Jones"},
			{id: 2, name: "Rob Ross"},
			{id: 3, name: "Jane Doe"}
		];
		await customerRepo.put(customers);

		let orders = [
			{id: 'ord-100', customer: 1, lineItems: ['a','b','c']},
			{id: 'ord-101', customer: 1, lineItems: ['b','c','d']},
			{id: 'ord-102', customer: 2, lineItems: ['a','2','z']},
			{id: 'ord-103', customer: 2, lineItems: ['x','y','z']},
			{id: 'ord-104', customer: 3, lineItems: ['b','o','p']},
		];
		await orderRepo.put(orders);

		let customerWithOrders = customerRepo.join(orderRepo, {from: 'id', to: 'customer', as: 'orders', name: 'customersWithOrders'});
		let ordersWithCustomer = orderRepo.join(customerRepo, {from: 'customer', to: 'id', as: 'customer', name: 'ordersWithCustomer'});

		expect(await customerWithOrders.get(1)).toEqual({
			id: 1, name:"Bob Jones", orders: [
				{id: "ord-100", customer:1, lineItems: ["a","b","c"]},
				{id: "ord-101", customer:1, lineItems: ["b","c","d"]}
			]
		});

		expect(await ordersWithCustomer.get('ord-101')).toEqual({
			id: 'ord-101', customer: {id: 1, name: 'Bob Jones'}, lineItems: ['b','c','d']
		});

		expect(await customerWithOrders.find({name: "Bob Jones"})).toEqual([
			{id: 1, name:"Bob Jones", orders: [
				{id: "ord-100", customer:1, lineItems: ["a","b","c"]},
				{id: "ord-101", customer:1, lineItems: ["b","c","d"]}
			]}
		]);

		expect(await ordersWithCustomer.find({customer: 2})).toEqual([
			{id: "ord-102", customer: {id: 2, name: "Rob Ross"}, lineItems: ["a","2","z"]},
			{id: "ord-103", customer: {id: 2, name: "Rob Ross"}, lineItems: ["x","y","z"]}
		]);

		done();
	});

	test('can manage child puts', async done => {
		const customerRepo = new Collectable({name: 'customers'});
		const orderRepo = new Collectable({name: 'orders'});

		const customers = [
			{id: 1, name: "Bob Jones", orders: [
				{id: 'ord-100', lineItems: ['a','b','c']},
				{id: 'ord-101', lineItems: ['b','c','d']}
			]},
			{id: 2, name: 'Rob Ross', orders: [
				{id: 'ord-102', lineItems: ['a','2','z']},
				{id: 'ord-103', lineItems: ['x','y','z']}
			]},
			{id: 3, name: "Jane Doe", orders: [
				{id: 'ord-104', lineItems: ['b','o','p']}
			]}
		];

		const customerWithOrders = customerRepo.join(orderRepo, {from: 'id', to: 'customer', as: 'orders', name: 'customersWithOrders'});
		const ordersWithCustomer = orderRepo.join(customerRepo, {from: 'customer', to: 'id', as: 'customer', name: 'ordersWithCustomer'});

		await customerWithOrders.put(customers);

		expect(await customerWithOrders.get(1)).toEqual({
			id: 1, name:"Bob Jones", orders: [
				{id: "ord-100", customer:1, lineItems: ["a","b","c"]},
				{id: "ord-101", customer:1, lineItems: ["b","c","d"]}
			]
		});

		expect(await ordersWithCustomer.get('ord-101')).toEqual({
			id: 'ord-101', customer: {id: 1, name: 'Bob Jones'}, lineItems: ['b','c','d']
		});

		expect(await customerWithOrders.find({name: "Bob Jones"})).toEqual([
			{id: 1, name:"Bob Jones", orders: [
				{id: "ord-100", customer:1, lineItems: ["a","b","c"]},
				{id: "ord-101", customer:1, lineItems: ["b","c","d"]}
			]}
		]);

		done();

	});

	test('can manage parent puts', async done => {
		const customerRepo = new Collectable({name: 'customers'});
		const orderRepo = new Collectable({name: 'orders'});

		const orders = [
			{id: 'ord-100', customer: {id: 1, name: 'Bob Jones'}, lineItems: ['a','b','c']},
			{id: 'ord-101', customer: {id: 1, name: 'Bob Jones'}, lineItems: ['b','c','d']},
			{id: 'ord-102', customer: {id: 2, name: 'Rob Ross'}, lineItems: ['a','2','z']},
			{id: 'ord-103', customer: {id: 2, name: 'Rob Ross'}, lineItems: ['x','y','z']},
			{id: 'ord-104', customer: {id: 3, name: 'Jane Doe'}, lineItems: ['b','o','p']}
		];

		const customerWithOrders = customerRepo.join(orderRepo, {from: 'id', to: 'customer', as: 'orders', name: 'customersWithOrders'});
		const ordersWithCustomer = orderRepo.join(customerRepo, {from: 'customer', to: 'id', as: 'customer', name: 'ordersWithCustomer'});

		await ordersWithCustomer.put(orders);

		expect(await customerWithOrders.get(1)).toEqual({
			id: 1, name:"Bob Jones", orders: [
				{id: "ord-100", customer:1, lineItems: ["a","b","c"]},
				{id: "ord-101", customer:1, lineItems: ["b","c","d"]}
			]
		});

		expect(await ordersWithCustomer.get('ord-101')).toEqual({
			id: 'ord-101', customer: {id: 1, name: 'Bob Jones'}, lineItems: ['b','c','d']
		});

		expect(await customerWithOrders.find({name: "Bob Jones"})).toEqual([
			{id: 1, name:"Bob Jones", orders: [
				{id: "ord-100", customer:1, lineItems: ["a","b","c"]},
				{id: "ord-101", customer:1, lineItems: ["b","c","d"]}
			]}
		]);

		done();
	});

	test('can fetch recursive structures', async done => {
		const treeNodeRepo = new Collectable({name: 'tree'});
		const tree = treeNodeRepo.join(treeNodeRepo, {from: 'id', to: 'parent', as: 'children'});

		const nodes = [
			{id: 'a'},
			{id: 'b', parent: 'a'},
			{id: 'c', parent: 'a'},
			{id: 'd', parent: 'a'},
			{id: 'e', parent: 'b'},
			{id: 'f', parent: 'b'},
			{id: 'g', parent: 'c'},
			{id: 'h', parent: 'd'}
		];

		await tree.put(nodes);

		expect(await tree.get('a')).toEqual(
			{id: 'a', children: [
				{id: 'b', parent: 'a', children: [
					{id: 'e', parent: 'b', children: []},
					{id: 'f', parent: 'b', children: []}
				]},
				{id: 'c', parent: 'a', children: [
					{id: 'g', parent: 'c', children: []}
				]},
				{id: 'd', parent: 'a', children: [
					{id: 'h', parent: 'd', children: []}
				]}
			]}
		);

		done();
	});

});

describe('Collection intended usage', () => {

	test('can wrap arrays', () => {
		let items = [1,2,3];
		let c = new Collection({items});
		let result = [...c];
		expect(result).toEqual(items);
	});

	test('can resort array using `by` mapper', () => {
		let items = [
			{id: 2, name: 'two'},
			{id: 3, name: 'three'},
			{id: 1, name: 'one'}
		];

		let c = new Collection({items}).by(item => item.id);
		let result = [...c];

		expect(result).toEqual([
			{id: 1, name: 'one'},
			{id: 2, name: 'two'},
			{id: 3, name: 'three'}
		]);
	});

});

describe('Collection deeply', () => {

	test('is exported', () => {
		expect(Collection).toBeTruthy();
		expect(typeof(Collection)).toBe('function');
	});

	test('is instantiable', () => {
		expect(new Collection()).toBeTruthy();
		expect(typeof(new Collection())).toBe('object');
	});

	test('can be instantiated with source iterable', () => {
		expect(new Collection([1,2,3])).toBeTruthy();
	});

	test('is iterable itself', () => {
		expect(typeof(new Collection()[Symbol.iterator])).toBe('function');
	});

});
