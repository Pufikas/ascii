// use base64 convertor for images, or implement it into the site
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const image1 = new Image();
image1.src = '../images/0tsxjxlwviib1.png';

const inputSlider = document.getElementById('resolution');
const inputLabel = document.getElementById('resolutionLabel');
inputSlider.addEventListener('change', handleSlider);

class Cell {
    constructor(x, y, symbol, color) {
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.color = color;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillText(this.symbol, this.x, this.y)
    }
}

class ascii {
    #imageCellArray = [];
    #pixels = [];
    #ctx;
    #width;
    #height;

    constructor(ctx, width, height) {
        this.#ctx = ctx;
        this.#width = width;
        this.#height = height;
        this.#ctx.drawImage(image1, 0, 0, this.#width, this.#height);
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
    }

    generateAsciiText() {
        const maxWidth = 80; 
        let asciiText = '';
        for (let i = 0; i < this.#imageCellArray.length; i++) {
            asciiText += this.#imageCellArray[i].symbol;
            if ((i + 1) % this.#pixels.width === 0) {
                asciiText += '\n';
            } else if ((i + 1) % maxWidth === 0) {
                asciiText += '\n';
            }
        }
        return asciiText;
    }

    #drawAscii() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        for (let i = 0; i < this.#imageCellArray.length; i++) {
            this.#imageCellArray[i].draw(this.#ctx);
        }
    }

    #convertToSymbol(g) {
        if (g > 220) return '@';
        else if (g > 140) return '#';
        else if (g > 60) return '8';
        else return ' ';
    }

    #scanImage(cellSize) {
        this.#imageCellArray = [];
        for (let y = 0; y < this.#pixels.height; y += cellSize) {
            for (let x = 0; x < this.#pixels.width; x += cellSize) {
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this.#pixels.width) + posX;

                if (this.#pixels.data[pos + 3] > 128) {
                    const red = this.#pixels.data[pos];
                    const green = this.#pixels.data[pos + 1];
                    const blue = this.#pixels.data[pos + 2];
                    const total = red + green + blue;
                    const avrgColor = total / 3;
                    const color = `rgb(${red}, ${green}, ${blue})`;
                    const symbol = this.#convertToSymbol(avrgColor);
                    if ( total > 200) this.#imageCellArray.push(new Cell(x, y, symbol, color));
                } 
            }
        }
        console.log(this.#imageCellArray);
    }

    draw(cellSize) {
        this.#scanImage(cellSize);
        this.#drawAscii();

        const asciiText = this.generateAsciiText();
        const asciiTextArea = document.getElementById('asciiText');
        asciiTextArea.value = asciiText;
    }
}

let eff;

function handleSlider() {
    if (inputSlider.value == 1) {
        inputLabel.innerHTML = 'Original image';
        ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
    } else {
        inputLabel.innerHTML = `Resolution: ${inputSlider.value} px`
        
        eff.draw(parseInt(inputSlider.value));
        // because inputSlider.value is a string
    }
}

image1.onload = function initialize() {
    canvas.width = image1.width;
    canvas.height = image1.height;
    eff = new ascii(ctx, image1.width, image1.height)
    handleSlider();
}