const left_outer = 25;
const left_inner = 50;
const top_outer = 25;
const top_inner = 50;
const bottom_outer = 475;
const bottom_inner = 450;
const right_outer = 475;
const right_inner = 450;

const width = 50;
const kerf = 1;

let x = left_inner;
let y = top_outer;

// for this peice, we'll fill in the top corner.
let points = [[x, y]];

// left segment
for (y = top_outer; y <= bottom_outer; y += width) {
    points.push([x, y]);
    if (y !== bottom_outer) {
        x = x === left_outer ? left_inner : left_outer;
        points.push([x, y]);
    }
}

const left_bottom_corner = x;
y = bottom_outer;

for (; x <= right_outer; x += width) {
    points.push([x, y]);
    if (x !== right_outer && x !== left_bottom_corner) {
        y = y === bottom_outer ? bottom_inner : bottom_outer;
        points.push([x, y]);
    }
}

let path =
`M ${points[0].join(' ')}
${points.slice(1)
        .map(p => `L ${p[0]} ${p[1]}`)
        .join('\n')
}`;

const svg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg
	width="500"
	height="500"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
>
<path
  d="${path}"
  stroke="red"
  stroke-width="1"
/>
</svg>`;


console.log(svg);
