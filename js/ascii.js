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
        // if (g > 250) return '@';
        // else if (g < 240) return '*';
        // else if (g < 220) return '+';
        // else if (g < 200) return '#';
        // else if (g < 180) return '&';
        // else if (g < 160) return '%';
        // else if (g < 140) return '_';
        // else if (g < 120) return ':';
        // else if (g < 100) return '$';
        // else if (g < 80) return '/';
        // else if (g < 60) return '-';
        // else if (g < 40) return 'X';
        // else if (g < 20) return 'W';
        // else return '';
        
        if (g > 240) return '@';
        else if (g > 220) return '#';
        else if (g > 200) return '8';
        else if (g > 180) return '&';
        else if (g > 160) return 'o';
        else if (g > 140) return ':';
        else if (g > 120) return '*';
        else if (g > 100) return '.';
        else if (g > 80) return ' ';
        else if (g > 60) return '^';
        else if (g > 40) return '+';
        else if (g > 20) return '=';
        else return '';
        
        /*
        if (g > 220) return '@';
        else if (g > 140) return '#';
        else if (g > 60) return '8';
        else return String.fromCharCode(160);
*/
        // small
        
            // const symbols = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

            // const index = Math.floor((g / 255) * (symbols.length - 1));
            // return symbols[index];
        


        // simple
        // return g > 128 ? ' ' : '@';
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

    generateAsciiText(cellSize) {
       let asciiText = '';
        const cellsPerRow = Math.floor(this.#pixels.width / cellSize);

       for (let i = 0; i < this.#imageCellArray.length; i++) {
            asciiText += this.#imageCellArray[i].symbol + ' ';

            if ((i + 1) % cellsPerRow === 0) {
                asciiText += '\n';
            }
       }

       document.getElementById("asciiText").value = asciiText;
    }

    draw(cellSize) {
        this.#scanImage(cellSize);
        this.#drawAscii();
        this.generateAsciiText(cellSize);

        // const asciiText = this.generateAsciiText();
        // const asciiTextArea = document.getElementById('asciiText');
        // asciiTextArea.value = asciiText;
    }
}