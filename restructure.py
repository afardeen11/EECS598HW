import os
import json
import shutil

# Paths
json_file = "part-000001.json"  # Path to JSON file
images_folder = "images"  # Folder containing images
output_folder = "organized_images"  # Destination folder

# Load JSON data
with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# Dictionary to store prompts and their associated images
prompt_groups = {}

# Group images by prompt
for image_filename, details in data.items():
    prompt = details["p"]  # Extract prompt text

    if prompt not in prompt_groups:
        prompt_groups[prompt] = []
    prompt_groups[prompt].append(image_filename)

# Ensure output directory exists
os.makedirs(output_folder, exist_ok=True)

# Move images into folders named after their prompts
for prompt, images in prompt_groups.items():
    if len(images) > 1:  # Ignore prompts with only one image
        prompt_folder = os.path.join(output_folder, prompt[:100].strip())  # Trim long folder names
        os.makedirs(prompt_folder, exist_ok=True)

        for image in images:
            image_path = os.path.join(images_folder, image)
            if os.path.exists(image_path):  # Ensure the image exists before moving
                shutil.move(image_path, os.path.join(prompt_folder, image))
            else:
                print(f"Warning: {image} not found in {images_folder}")

print("Images organized successfully!")
