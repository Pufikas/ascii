document.addEventListener('DOMContentLoaded', function() {
    function processImage() {
        const fileInput = document.getElementById('fileInput');
        const image = fileInput.files[0];
    
        if (image) {
            resizeAndGrayify(image);
        } else {
            console.log('No image selected.');
        }
    }
    
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
    
            
        };
        img.src = URL.createObjectURL(image);
        pixelsToAscii();
    }
    
    function pixelsToAscii() {
        const characters = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."];
        let canvas = document.getElementById("resized");
        let ctx = canvas.getContext("2d");
    
        // get the resized image data
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
    
        displayAscii(ascii)
    }
    
    function copyText(ascii) {


        alert('ASCII text copied to clipboard!');
    }
    
    // display the ascii img
    function displayAscii(ascii) {
        let res = document.getElementById("resultPreview");
        res.innerText = ascii;
    }

    document.getElementById('convert').addEventListener('click', processImage);
});