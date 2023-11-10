// use base64 convertor for images, or implement it into the site

//const downloadButton = document.getElementById('downloadButton');

let defoImg = "images/c.png";




function downloadButton() {
    const canvasUrl = canvas.toDataURL();
    const downloadLink = document.createElement("a");
    downloadLink.href = canvasUrl;
    downloadLink.download = 'image.png'; // def link
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


function handleImageChange() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const inputSlider = document.getElementById('resolution');
    const inputLabel = document.getElementById('resolutionLabel');
    const fileInput = document.getElementById("fileInput");
    const chooseImgBtn = document.getElementById("chooseImage");
    const asciiTextArea = document.getElementById('asciiText');
    const filterOptions = document.querySelectorAll('.filter button');
    const filterName = document.querySelector('.filterInfo .name');
    const filterSlider = document.querySelector('.filterSlider input');
    const filterValue = document.querySelector('.filterSlider .value');

    let brightness = 100, saturation = 100, inversion = 0, grayscale = 0;
    let eff;
    const mainImage = new Image();

    const applyFilters = () => {
        canvas.style.filter = `brightness(${brightness}%) saturation(${saturation}%) inversion(${inversion}%) grayscale(${grayscale}%)`
    }

    const updateFilter = () => {
        filterValue.innerText = `${filterSlider.value}%`;
        const selectedFilter = document.querySelector(".filter .active");

        if (selectedFilter.id === "brightness") {
            brightness = filterSlider.value;
        } else if (selectedFilter.id === "saturation") {
            saturation = filterSlider.value;
        } else if (selectedFilter.id === "inversion") {
            inversion = filterSlider.value;
        } else {
            grayscale = filterSlider.value;
        }
        applyFilters();
    }
    filterSlider.addEventListener("input", updateFilter);

    

    // filter options
    filterOptions.forEach(option => {
        option.addEventListener("click", () => {
            document.querySelector(".filter .active").classList.remove("active");
            option.classList.add("active"); // update classes on click

            filterName.innerHTML = option.innerText; // set the name

            if (option.id === "brightness") {
                filterSlider.max = "200";
                filterSlider.value = brightness;
                filterValue.innerText = `${brightness}%`;
            } else if (option.id === "saturation") {
                filterSlider.max = "200";
                filterSlider.value = saturation;
                filterValue.innerText = `${saturation}%`;
            } else if (option.id === "inversion") {
                filterSlider.max = "100";
                filterSlider.value = inversion;
                filterValue.innerText = `${inversion}%`;
            } else {
                filterSlider.max = "100";
                filterSlider.value = grayscale;
                filterValue.innerText = `${grayscale}%`;
            }
            console.log(option);
        })
    })

    chooseImgBtn.addEventListener("click", () => fileInput.click()); // just so we can style the btn
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                mainImage.onload = function() {
                    let scale = 1.5;
                    if (mainImage.width > 800 || mainImage.height > 800) {
                        scale = Math.min(800 / mainImage.width, 800 / mainImage.height);
                    }
                    const targetWidth = mainImage.width * scale;
                    const targetHeight = mainImage.height * scale;
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    ctx.drawImage(mainImage, 0, 0, targetWidth, targetHeight);
                    eff = new ascii(ctx, targetWidth, targetHeight, mainImage);
                    handleSlider();
                };
                mainImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    inputSlider.addEventListener('change', handleSlider);

    function handleSlider() {
        if (inputSlider.value == 1) {
            inputLabel.innerHTML = 'Original image';
            ctx.drawImage(mainImage, 0, 0, canvas.width, canvas.height);
        } else {
            inputLabel.innerHTML = `Resolution: ${inputSlider.value} px`;
            
            eff.draw(parseInt(inputSlider.value));
            // because inputSlider.value is a string
        }
    }
}


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

    generateAsciiText() {
        const maxWidth = 40; 
        let asciiText = String.fromCharCode(160);
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
                    const red = this.#pixels.data[pos];
                    const green = this.#pixels.data[pos + 1];
                    const blue = this.#pixels.data[pos + 2];
                    const total = red + green + blue;
                    const avrgColor = total / 3;
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

        const asciiText = this.generateAsciiText();
        const asciiTextArea = document.getElementById('asciiText');
        asciiTextArea.value = asciiText;
    }
}

// image1.onload = function initialize() {
//     canvas.width = image1.width;
//     canvas.height = image1.height;
//     eff = new ascii(ctx, image1.width, image1.height)
//     handleSlider();
// }

handleImageChange();