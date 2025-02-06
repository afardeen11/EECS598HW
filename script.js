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
        
            // Get MTurk Assignment & HIT ID (needed for submission)
            const urlParams = new URLSearchParams(window.location.search);
            const assignmentId = urlParams.get("assignmentId");
        
            if (assignmentId === "ASSIGNMENT_ID_NOT_AVAILABLE") {
                alert("This is a preview. Accept the HIT to continue.");
                return;
            }
        
            // Send data back to MTurk
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://www.mturk.com/mturk/externalSubmit";
        
            const assignmentInput = document.createElement("input");
            assignmentInput.type = "hidden";
            assignmentInput.name = "assignmentId";
            assignmentInput.value = assignmentId;
            form.appendChild(assignmentInput);
        
            const selectionInput = document.createElement("input");
            selectionInput.type = "hidden";
            selectionInput.name = "selectedImage";
            selectionInput.value = selectedImage;
            form.appendChild(selectionInput);
        
            document.body.appendChild(form);
            form.submit();
        });
        

        loadPrompt(currentIndex);
    } catch (error) {
        console.error("Error loading data.json:", error);
    }
});


