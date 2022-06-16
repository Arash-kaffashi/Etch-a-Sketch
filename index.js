let state = { color: "rgb(0,0,0)", changeAlpha: 0 };
const grid = document.querySelector(".grid");
const color = document.querySelector("#color");
const clear = document.querySelector("#clear");
const darken = document.querySelector("#darken");
const lighten = document.querySelector("#lighten");
const random = document.querySelector("#random");
const size = document.querySelector("#size");
const sizeDisplay = document.querySelector("#sizeDisplay");

const checkboxes = [darken, lighten, random];

// Reference:
// https://stackoverflow.com/questions/12673691/true-or-better-random-numbers-with-javascript
// https://stackoverflow.com/questions/4083204/secure-random-numbers-in-javascript
function randomColor() {
	let color = crypto.getRandomValues(new Uint8Array(3)).join(",");
	let alpha = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
	return `rgba(${color}, ${alpha})`;
}

function setAlpha(color, alpha) {
	color[3] = alpha;
	return `rgba(${color})`;
}

// color is rgb or rgba
function getColor(color) {
	return color
		.substring(color.indexOf("(") + 1, color.length - 1)
		.split(",")
		.map((str) => +str.trim());
}

function inRange(start, end, value) {
	return Math.min(Math.max(start, value), end);
}

function paint(e) {
	e.stopPropagation();
	e.preventDefault();

	if (e.buttons === 1) {
		if (state.changeAlpha !== 0) {
			let value = getColor(this.style.backgroundColor);
			value[3] = inRange(0, 1, (value[3] ?? 1) + state.changeAlpha);
			this.style.backgroundColor = `rgba(${value})`;
		} else {
			this.style.backgroundColor = state.color || randomColor();
		}
	}
}

function populateGrid(grid, row, limit = 10) {
	row = Math.min(row, limit);

	let present = Array.from(grid.querySelectorAll("div"));
	let amount = row ** 2 - present.length;

	clearBackground(grid);
	grid.style = `grid-template-columns: repeat(${row}, 1fr);`;

	if (amount < 0) {
		while (amount++) {
			grid.removeChild(present.pop());
		}
	} else if (amount > 0) {
		while (amount--) {
			let div = document.createElement("div");
			div.addEventListener("mouseover", paint);
			div.addEventListener("mousedown", paint);
			grid.appendChild(div);
		}
	}
}

function clearBackground(grid) {
	let divs = grid.querySelectorAll('div[style*="background-color"');
	Array.from(divs).forEach((div) => (div.style = ""));
}

function hextorgb(hex) {
	let color = hex.match(/\w\w/g).map((x) => parseInt(x, 16));

	return `rgb(${color})`;
}

function unckeckInputs(...inputs) {
	inputs.forEach((input) => (input.checked = false));
	state.changeAlpha = 0;
}

// EVENT LISTENERS

color.addEventListener("input", function (e) {
	e.stopPropagation();
	unckeckInputs(...checkboxes);
	state.color = hextorgb(this.value);
});

clear.addEventListener("click", function (e) {
	e.stopPropagation();
	unckeckInputs(...checkboxes);
	clearBackground(grid);
});

lighten.addEventListener("change", function (e) {
	e.stopPropagation();
	if (!this.checked) {
		state.changeAlpha = 0;
		return;
	}
	unckeckInputs(darken);
	state.changeAlpha = -0.1;
});

darken.addEventListener("change", function (e) {
	e.stopPropagation();
	if (!this.checked) {
		state.changeAlpha = 0;
		return;
	}
	unckeckInputs(lighten);
	state.changeAlpha = 0.1;
});

random.addEventListener("change", function (e) {
	e.stopPropagation();
	if (!this.checked) {
		state.color = hextorgb(color.value);
		return;
	}
	unckeckInputs(lighten, darken);
	state.color = null;
});

size.addEventListener("change", function (e) {
	sizeDisplay.textContent = `${this.value}x${this.value}`;
	populateGrid(grid, this.value);
});

// MAIN FUNCTION

function main() {
	color.value = state.color;
	size.value = 3;
	unckeckInputs(...checkboxes);
	populateGrid(grid, size.value);
}

main();
