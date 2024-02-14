export function asBooleanArray(n, bits) {
	const s = ('00000000000000000000000000000000' + n.toString(2));
	return s.substring(s.length - bits).split('').map(b => b === '1');
}

export function fromBooleanArray(bArray) {
	const bString = bArray.map(b => b ? '1' : '0');
	return Number.parseInt(bString, 2);
}

export function asIntArray(n, bits) {
	const s = ('00000000000000000000000000000000' + n.toString(2));
	return s.substring(s.length - bits).split('').map(b => b === '1' ? 1 : 0);
}

export function fromNumberArray(intArray, threshold = 0.01) {
	const bString = intArray.map(i => i > threshold ? '1' : '0').join('');
	return Number.parseInt(bString, 2);
}

export function dF(f) {
	const H = 0.0000001;
	return x => (f(x + H) - f(x)) / H;
}
