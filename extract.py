import os
import json
import shutil
import random

# Define paths
JSON_FILE = "part-000001.json"  # Change if needed
IMAGE_DIR = "diffusiondb_images"  # Folder where images are stored
SORTED_DIR = "sorted_diffusiondb_subset"

# Ensure output directory exists
os.makedirs(SORTED_DIR, exist_ok=True)

# Load JSON metadata
print("Loading metadata...")
with open(JSON_FILE, "r") as f:
    metadata = json.load(f)

# Step 1: Organize images by prompt
prompt_dict = {}

for image_name, data in metadata.items():
    prompt = data["p"].strip()  # Prompt text
    image_path = os.path.join(IMAGE_DIR, image_name)

    if os.path.exists(image_path):
        if prompt not in prompt_dict:
            prompt_dict[prompt] = []
        prompt_dict[prompt].append(image_path)

# Step 2: Print all prompts and their associated images
print("\n🔍 Listing all prompts with their associated images:")
for prompt, images in prompt_dict.items():
    print(f"\nPrompt: {prompt}")
    for img in images:
        print(f"  - {img}")

# Step 3: Filter prompts with at least 2 images
valid_prompts = [(prompt, images) for prompt, images in prompt_dict.items() if len(images) >= 2]
random.shuffle(valid_prompts)  # Shuffle to get a random selection

# Step 4: Select 50 prompts
selected_prompts = valid_prompts[:50]

# Step 5: Sort images into folders
print("\n📂 Sorting images into folders...")
for i, (prompt, images) in enumerate(selected_prompts):
    prompt_dir = os.path.join(SORTED_DIR, f"prompt_{i+1}")
    os.makedirs(prompt_dir, exist_ok=True)

    # Save prompt text
    with open(os.path.join(prompt_dir, "prompt.txt"), "w", encoding="utf-8") as f:
        f.write(prompt)

    # Copy images
    for j, image_path in enumerate(images):
        shutil.copy(image_path, os.path.join(prompt_dir, f"image_{j+1}.webp"))

print("\n✅ Done! 50 prompts with images have been sorted.")
