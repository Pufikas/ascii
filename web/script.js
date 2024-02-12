//const downloadButton = document.getElementById('downloadButton');
document.addEventListener('DOMContentLoaded', function () {
    
    function processImage() {
        const fileInput = document.getElementById('fileInput');
        const image = fileInput.files[0];

        if (image) {
            resizeAndGrayify(image);
        } else {
            console.log('No image selected.');
        }
    }

    document.getElementById('fileConvertBtn').addEventListener('click', processImage);

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
});

