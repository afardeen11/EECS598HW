document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "images_with_prompt/";

    try {
        const response = await fetch("data.json");
        const dataset = await response.json();
        let currentIndex = 0;
        let selectedImage = null;

        function loadPrompt(index) {
            if (index >= dataset.length) {
                alert("Task completed! Thank you for your selections.");
                return;
            }

            const data = dataset[index];
            document.getElementById("prompt-text").innerText = data.prompt;
            const container = document.getElementById("image-container");
            container.innerHTML = ""; // Clear previous images

            data.images.forEach(imgName => {
                const img = document.createElement("img");
                img.src = `${BASE_URL}${data.prompt}/${imgName}`;  // Correctly structured path
                img.dataset.filename = imgName;
                img.addEventListener("click", () => selectImage(img));
                container.appendChild(img);
            });

            selectedImage = null;
            document.getElementById("submit-btn").disabled = true;
        }

        function selectImage(img) {
            document.querySelectorAll(".image-container img").forEach(image => {
                image.classList.remove("selected");
            });
            img.classList.add("selected");
            selectedImage = img.dataset.filename;
            document.getElementById("submit-btn").disabled = false;
        }

        document.getElementById("submit-btn").addEventListener("click", () => {
            if (!selectedImage) return;
        
            console.log(`Selected Image: ${selectedImage} for Prompt: "${dataset[currentIndex].prompt}"`);
        
            // Generate a random survey code (e.g., 6-digit alphanumeric)
            const surveyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        
            // Display the survey code to the user
            const surveyCodeElement = document.createElement("p");
            surveyCodeElement.innerHTML = `Your Survey Code: <strong>${surveyCode}</strong>`;
            surveyCodeElement.style.fontSize = "20px";
            surveyCodeElement.style.color = "green";
            document.body.appendChild(surveyCodeElement);
        
            // Hide the submit button to prevent multiple submissions
            document.getElementById("submit-btn").style.display = "none";
        
            // Store the survey code in localStorage (optional for debugging)
            localStorage.setItem("surveyCode", surveyCode);
        });
        

        loadPrompt(currentIndex);
    } catch (error) {
        console.error("Error loading data.json:", error);
    }
});


