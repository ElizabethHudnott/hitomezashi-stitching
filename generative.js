'use strict'
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
context.lineWidth = 2;

const pictureSize = canvas.width;

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
			vPos = 1;
			shift = (-1) ** Math.trunc(Math.random() * 2);
			deviations[index] = shift;
		} else {
			const numDeviations = Math.abs(deviations[index]);
			const direction = Math.sign(deviations[index]);
			vPos = numDeviations % 2 === 0 ? 1 : -1;
			shift = direction * (-1) * vPos;
			deviations[i] = (numDeviations + 1) * direction;
		}
		const array = vPos === -1 ? bottomOffsets : topOffsets;
		let value = array[index] += shift;
		if (value < minDistance) {
			array[index] = minDistance;
		} else if (value > length - minDistance) {
			array[index] = length - minDistance;
		} else {
			while (array[index] > array[index + 1] - minDistance) {
				index++;
				array[index]++;
			}
			while (array[index] < array[index - 1] + minDistance) {
				index--;
				array[index]--;
			}
		}
	}

	topOffsets.unshift(0);
	bottomOffsets.unshift(0);
	topOffsets.push(length);
	bottomOffsets.push(length);
	return [topOffsets, bottomOffsets];
}

const [topX, bottomX] = linePartition(pictureSize, 12, 0.5, 0.2, 0.6, 500, 32);
const [leftY, rightY] = linePartition(pictureSize, 12, 0, 0, 0, 500, 32);

for (let i = 0; i < topX.length; i++) {
	context.moveTo(topX[i], 0);
	context.lineTo(bottomX[i], pictureSize);
}
for (let i = 0; i < leftY.length; i++) {
	context.moveTo(0, leftY[i]);
	context.lineTo(pictureSize, rightY[i]);
}
context.stroke();
