// use base64 convertor for images, or implement it into the site

//const downloadButton = document.getElementById('downloadButton');
document.addEventListener('DOMContentLoaded', function () {
    let defoImg = "images/c.png";
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
    const symbolOptionsContainer = document.querySelector('.symbolOptions');
    

    let brightness = 100, saturation = 100, inversion = 0, grayscale = 0;
    let eff;
    const mainImage = new Image();

    function processImage() {
        const fileInput = document.getElementById('fileInput');
        const image = fileInput.files[0];

        if (image) {
            resizeAndGrayify(image);
        } else {
            console.log('No image selected.');
        }
    }

    //document.getElementById('fileConvertBtn').addEventListener('click', processImage);

    function resizeAndGrayify(image, newWidth = 100) {
        const img = new Image();
        let canvas = document.getElementById("resized");
        let ctx = canvas.getContext("2d");

        img.onload = function() {
            const ratio = img.height / img.width * 0.55;
            const newHeight = newWidth * ratio;
            
            canvas.width = newWidth;
            canvas.height = newHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
            const pixels = imageData.data;

            for (let i = 0; i < pixels.length; i += 4) {
                const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                pixels[i] = avg; // red
                pixels[i + 1] = avg; // green
                pixels[i + 2] = avg; // blue
            }

            ctx.putImageData(imageData, 0, 0);

            pixelsToAscii(image);
        };

        img.src = URL.createObjectURL(image);
    }

    function displayPreview(image, resized) {
        let canvas = document.getElementById("resized");
        let ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, resized.width, resized.height);
    }

    // convert to ascii
    function pixelsToAscii(image) {
        const characters = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."];
        let canvas = document.getElementById("resized");
        let ctx = canvas.getContext("2d");

        // Get the resized image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let ascii = "";

        const maxLineWidth = 100;
        let charCount = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            const avgBrightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            
            
            if (pixels[i] === 0 && pixels[i + 1] === 0 && pixels[i + 2] === 0) {
                ascii += " ";
            } else {
                const charIndex = Math.floor(avgBrightness / (255 / characters.length));
                ascii += `${characters[charIndex]}`;
            }

            charCount++;

            if (charCount >= maxLineWidth) {
                ascii += '\n';
                charCount = 0;
            }
        }

        displayAscii(ascii);
        
        console.log(ascii);
        return ascii;
    }

    // display the ascii img
    function displayAscii(ascii) {
        let res = document.getElementById("resultPreview");
        res.innerText = ascii;
    }
    function downloadCurrImg() {
        const element = document.createElement("a");
        const fileName = `image.png`;
        
        element.setAttribute("download", fileName);
        element.click();
    }

    function handleImageChange() {
        const applyFilters = () => {
            canvas.style.filter = `brightness(${brightness}%) saturation(${saturation}%) inversion(${inversion}%) grayscale(${grayscale}%)`
        
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            for (let i = 0; i < pixels.length; i += 4) {
                pixels[i] += brightness * 0.1;
        
                // might need a better approach for saturation adjustment
                const grayscale = 0.3 * pixels[i] + 0.59 * pixels[i + 1] + 0.11 * pixels[i + 2];
                pixels[i] = grayscale + saturation * (pixels[i] - grayscale);
                pixels[i + 1] = grayscale + saturation * (pixels[i + 1] - grayscale);
                pixels[i + 2] = grayscale + saturation * (pixels[i + 2] - grayscale);
        
                // inversion
                pixels[i] = 255 - pixels[i];
                pixels[i + 1] = 255 - pixels[i + 1];
                pixels[i + 2] = 255 - pixels[i + 2];
        
                // grayscale
                const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                pixels[i] = avg + (grayscale - avg) * grayscale / 100;
                pixels[i + 1] = avg + (grayscale - avg) * grayscale / 100;
                pixels[i + 2] = avg + (grayscale - avg) * grayscale / 100;
            }
            ctx.putImageData(imageData, 0, 0);
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

        // choose image
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
        
        // resolution scale
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

        filterSlider.addEventListener("input", updateFilter);
        chooseImgBtn.addEventListener("click", () => fileInput.click()); // just so we can style the btn
        inputSlider.addEventListener('change', handleSlider);

    }
        
    handleImageChange();
});