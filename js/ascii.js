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

    constructor(ctx, width, height, image) {
        this.#ctx = ctx;
        this.#width = width;
        this.#height = height;
        this.#ctx.drawImage(image, 0, 0, this.#width, this.#height);
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
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
        else return String.fromCharCode(160);
    }

    #scanImage(cellSize) {
        this.#imageCellArray = [];
        
        for (let y = 0; y < this.#pixels.height; y += cellSize) {
            for (let x = 0; x < this.#pixels.width; x += cellSize) {
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this.#pixels.width) + posX;

                if (this.#pixels.data[pos + 3] > 128) {
                    const black = this.#pixels.data[pos] < 120;
                    const transparent = this.#pixels.data[pos + 3] < 50;
                    const red = this.#pixels.data[pos];
                    const green = this.#pixels.data[pos + 1];
                    const blue = this.#pixels.data[pos + 2];
                    const total = red + green + blue + transparent;
                    const avrgColor = total / 4;
                    const color = `rgb(${red}, ${green}, ${blue})`;
                    const symbol = this.#convertToSymbol(avrgColor);
                    this.#imageCellArray.push(new Cell(x, y, symbol, color));
                }
            }
        }
        console.log(this.#imageCellArray);
    }

    
    

    draw(cellSize) {
        this.#scanImage(cellSize);
        this.#drawAscii();
       

        // const asciiText = this.generateAsciiText();
        // const asciiTextArea = document.getElementById('asciiText');
        // asciiTextArea.value = asciiText;
    }
}