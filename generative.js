const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
context.lineWidth = 2;

const pictureSize = canvas.width;

function linePartition(length, numPartitions, centreVariation = 0, minDeviation = 0, maxDeviation = 1, numMutations = (numPartitions - 1) * 500) {
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

	const splits = new Array(numPartitions);
	const leftPartitions = Math.round(numPartitions * centre);
	const rightPartitions = numPartitions - leftPartitions;

	for (let i = 0; i < leftPartitions; i++) {
		splits[i] = -leftDeviation * (leftPartitions - i) / leftPartitions;
	}
	for (let i = leftPartitions; i < numPartitions; i++) {
		splits[i] = rightDeviation * (i - leftPartitions) / rightPartitions;
	}

	for (let i = 0; i < numMutations; i++) {
		const shift = (-1) ** Math.trunc(Math.random() * 2);
		let index = Math.trunc(Math.random() * numPartitions);
		splits[index] += shift;
		if (splits[index] < -cellSize) {
			splits[index] = -cellSize;
		} else if (splits[index] > cellSize) {
			splits[index] = cellSize;
		} else {
			while (splits[index] > splits[index + 1]) {
				index++;
				splits[index]++;
			}
			while (splits[index] < splits[i - 1]) {
				index--;
				splits[index]--;
			}
		}
	}

	splits.unshift(0);
	splits.push(0);

	return splits;
}

const horizontalSplits = linePartition(pictureSize, 12, 0.5, 0.2, 0.6);
const verticalSplits = linePartition(pictureSize, 12, 0.5, 0.2, 0.6);

for (let i = 0; i < horizontalSplits.length; i++) {
	const offset = i / (horizontalSplits.length - 1) * pictureSize;
	let deviation = horizontalSplits[i] / 2;
	context.moveTo(offset + deviation, 0);
	context.lineTo(offset - deviation, pictureSize);
	deviation = verticalSplits[i] / 2;
	context.moveTo(0, offset - deviation);
	context.lineTo(pictureSize, offset + deviation);
}
context.stroke();
