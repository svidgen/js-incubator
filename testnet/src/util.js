export function asBooleanArray(n, bits) {
	const s = ('00000000000000000000000000000000' + n.toString(2));
	return s.substring(s.length - bits).split('').map(b => b === '1');
}

