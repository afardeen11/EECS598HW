import os
import json

# Define the folder containing images organized by prompts
IMAGE_FOLDER = "images_with_prompt"

# Create an empty list to store the structured data
dataset = []

# Scan the main folder
if os.path.exists(IMAGE_FOLDER):
    for folder in sorted(os.listdir(IMAGE_FOLDER)):  # Sort folders alphabetically
        folder_path = os.path.join(IMAGE_FOLDER, folder)
        if os.path.isdir(folder_path):  # Ensure it's a directory
            images = sorted([img for img in os.listdir(folder_path) if img.endswith((".jpg", ".png", ".webp"))])

            # Only include folders with exactly 4 images
            if len(images) == 4:
                dataset.append({
                    "prompt": folder,  # Store prompt separately
                    "images": images   # Only store image filenames
                })

# Save the dataset to a JSON file
output_file = "data.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(dataset, f, indent=4)

print(f"✅ JSON file '{output_file}' created successfully!")
