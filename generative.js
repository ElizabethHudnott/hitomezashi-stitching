'use strict'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const pictureSize = window.innerHeight;

function linePartition(length, numPartitions, centreVariation = 0, minDeviation = 0, maxDeviation = 1, numMutations = 0, minDistance = 0) {
	numPartitions--;
	const cellSize = length / numPartitions;
	const centre = 0.5 + Math.random() * centreVariation - centreVariation / 2;

	const leftSkew = 4 * Math.min(centre, 0.5);
	const minLeftDeviation = Math.max(2 * minDeviation, minDeviation * leftSkew);
	const maxLeftDeviation = Math.min(2 * maxDeviation, maxDeviation * leftSkew);
	const leftDeviation = cellSize *
		(Math.random() * (maxLeftDeviation - minLeftDeviation) + minLeftDeviation);

	const rightSkew = 4 * (1 - Math.max(centre, 0.5));
	const minRightDeviation = Math.max(2 * minDeviation, minDeviation * rightSkew);
	const maxRightDeviation = Math.min(2 * maxDeviation, maxDeviation * rightSkew);
	const rightDeviation = cellSize *
		(Math.random() * (maxRightDeviation - minRightDeviation) + minRightDeviation);

	const topOffsets = new Array(numPartitions);
	const bottomOffsets = new Array(numPartitions);
	const deviations = new Array(numPartitions);
	deviations.fill(0);
	const leftPartitions = Math.round(numPartitions * centre);
	const rightPartitions = numPartitions - leftPartitions;

	for (let i = 0; i < leftPartitions; i++) {
		const offset = length  * (i + 1) / (numPartitions + 1);
		const deviation = -leftDeviation * (leftPartitions - i) / leftPartitions;
		topOffsets[i] = offset + deviation / 2;
		bottomOffsets[i] = offset - deviation / 2;
	}
	for (let i = leftPartitions; i < numPartitions; i++) {
		const offset = length * (i + 1) / (numPartitions + 1);
		const deviation = rightDeviation * (i - leftPartitions) / rightPartitions;
		topOffsets[i] = offset + deviation / 2;
		bottomOffsets[i] = offset - deviation / 2;
	}

	for (let i = 0; i < numMutations; i++) {
		let index = Math.trunc(Math.random() * numPartitions);
		let vPos, shift;

		if (deviations[index] === 0) {
			// Decide which direction to adjust this line's slant.
			vPos = 1;
			shift = (-1) ** Math.trunc(Math.random() * 2);
			deviations[index] = shift;
		} else {
			// Alternate moving top and bottom coordinates
			const numDeviations = Math.abs(deviations[index]);
			const direction = Math.sign(deviations[index]);
			vPos = numDeviations % 2 === 0 ? 1 : -1;
			shift = direction * vPos;
			deviations[i] = (numDeviations + 1) * direction;
		}

		let array = vPos === -1 ? bottomOffsets : topOffsets;
		let value = array[index] + shift;
		if (
			value < minDistance || value > length - minDistance ||
			value > array[index + 1] - minDistance || value < array[index - 1] + minDistance
		) {
			// No space, try moving the other coordinate instead.
			vPos *= -1;
			shift *= -1;
			array = vPos === -1 ? bottomOffsets : topOffsets;
			value = array[index] + shift;
		}
		if (value < minDistance || value > length - minDistance) {
			// No move possible.
			continue;
		}
		array[index] = value;

		// Move other lines as needed.
		while (array[index] > array[index + 1] - minDistance) {
			if (Math.sign(deviations[index]) + Math.sign(deviations[index + 1]) === 0) {
				// Lines moving in opposite directions;
				array[index] = value - shift;
				break;
			}
			index++;
			array[index]++;
		}
		while (array[index] < array[index - 1] + minDistance) {
			if (Math.sign(deviations[index]) + Math.sign(deviations[index - 1]) === 0) {
				// Lines moving in opposite directions;
				array[index] = value - shift;
				break;
			}
			index--;
			array[index]--;
		}
	}

	topOffsets.unshift(0);
	bottomOffsets.unshift(0);
	topOffsets.push(length);
	bottomOffsets.push(length);
	return [topOffsets, bottomOffsets];
}

const numColumns = 18;
const numRows = numColumns;
const [topX, bottomX] = linePartition(pictureSize, numColumns, 0.5, 0.2, 0.6, 500, pictureSize / 90);
const [leftY, rightY] = linePartition(pictureSize, numRows, 0, 0, 0, 500, pictureSize / 90);

function getCoordinate(col, row) {
	// x = b1 * y + c1	=>	a1 * x + b1 * y + c1 = 0 for a1 = -1
	const b1 = (bottomX[col] - topX[col]) / pictureSize;
	const c1 = topX[col];
	const a1 = -1;
	// y = a2 * x + c2	=> a2 * x + b2 * y + c2 = 0 for b2 = -1
	const a2 = (rightY[row] - leftY[row]) / pictureSize;
	const c2 = leftY[row];
	const b2 = -1;
	// https://www.cuemath.com/geometry/intersection-of-two-lines/
	let x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
	let y = (c1 * a2 - c2 * a1) / (a1 * b2 - a2 * b1);
	return [x, y];
}

function binaryString(length) {
	const array = new Array(length);
	for (let i = 0; i < length; i++) {
		array[i] = Math.trunc(Math.random() * 2);
	}
	return array;
}

const columns = binaryString(numColumns);
const rows = binaryString(numRows);

function hasStitch(array, arrayIndex, transverseIndex) {
	const pattern = array[arrayIndex];
	return (pattern + transverseIndex) % 2;
}

function straightStitch(svg) {
	for (let i = 0; i < numColumns - 1; i++) {
		for (let j = 0; j < numRows; j++) {
			if (hasStitch(columns, i, j)) {
				const [x1, y1] = getCoordinate(i + 1, j);
				const [x2, y2] = getCoordinate(i + 1, j + 1);
				const line =  document.createElementNS(SVG_NAMESPACE, 'line');
				line.setAttribute('x1', x1);
				line.setAttribute('y1', y1);
				line.setAttribute('x2', x2);
				line.setAttribute('y2', y2);
				line.setAttribute('stroke', 'black');
				svg.appendChild(line);
			}
		}
	}
	for (let j = 0; j < numRows - 1; j++) {
		for (let i = 0; i < numColumns; i++) {
			if (hasStitch(rows, j, i)) {
				const [x1, y1] = getCoordinate(i, j + 1);
				const [x2, y2] = getCoordinate(i + 1, j + 1);
				const line =  document.createElementNS(SVG_NAMESPACE, 'line');
				line.setAttribute('x1', x1);
				line.setAttribute('y1', y1);
				line.setAttribute('x2', x2);
				line.setAttribute('y2', y2);
				line.setAttribute('stroke', 'black');
				svg.appendChild(line);
			}
		}
	}
}

const svg = document.createElementNS(SVG_NAMESPACE, "svg");
svg.setAttribute('viewBox', '0 0 ' + pictureSize + ' ' + pictureSize);
svg.setAttribute('width', pictureSize);
svg.setAttribute('height', pictureSize);
document.body.appendChild(svg);
straightStitch(svg);
