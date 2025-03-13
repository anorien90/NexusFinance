#!/bin/bash

export WINEARCH=win32
export WINEPREFIX=~/.wine32
VERSION_FILE="pyproject.toml"
CURRENT_VERSION=$(grep -Po '(?<=version = ")\d+\.\d+\.\d+' $VERSION_FILE)



python3 -m venv .test_env
source .test_env/bin/activate
python3 -m pip install -r requirements.txt
python3 -m pip install pytest

# Stage 1 Test
echo "Running Stage1 pytest..."
pytest
if [ $? -ne 0 ]; then
    echo "Tests failed. Exiting..."
    exit 1
fi

echo "Tests passed successfully!"
deactivate
rm -r .test_env

cd user-base-dashboard
rm -r build/*
npm run build
rm -r ../nexus_finance/static/*
cp -r build/* ../nexus_finance/static/
rm -r build/*
cd ..

# Start building dist packages
echo "Starting build process..."
python3 -m venv .build
source .build/bin/activate
python3 -m pip install -r build_requirements.txt
python3 -m pip install -r requirements.txt

# Step 3: Fetch the current version from pyproject.toml
echo "Current version: $CURRENT_VERSION"

# Ask the user for the new version
read -p "Enter the new version (current version: $CURRENT_VERSION): " NEW_VERSION
if [ -z "$NEW_VERSION" ]; then
    echo "No version provided, using default version 1.0.3"
    NEW_VERSION="1.0.3"
fi

echo "Updating version in $VERSION_FILE to $NEW_VERSION..."

# Use sed to update the version in pyproject.toml
sed -i "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" $VERSION_FILE

# Verify the version update
echo "Updated version:"
grep "version" $VERSION_FILE
rm -r dist/*

# Step 4: Run py -m build dist to build the distribution
echo "Building distribution..."
python -m build .

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Build successful!"
else
    echo "Build failed."
    exit 1
fi

# Stage2 Test
deactivate
python3 -m venv .test_env
source .test_env/bin/activate
python3 -m pip install pytest
python3 -m pip install dist/*.whl

echo "Running Stage2 pytest..."
pytest
if [ $? -ne 0 ]; then
    echo "Tests failed. Exiting..."
    exit 1
fi

echo "Tests passed successfully!"
deactivate
rm -r .test_env

source .build/bin/activate

# Step 5: Build Linux binary with PyInstaller
echo "Building Linux binary..."
pyinstaller --onefile --add-data "nexus_finance/static:static" --hidden-import=flask --distpath bin --name="nexus_finance" nexus_finance/app.py
if [ $? -eq 0 ]; then
    echo "Linux Binary-Build successful!"
else
    echo "Linux Build failed."
    exit 1
fi

# Step 6: Build Windows binary with Wine
read -p "Do you want to build the Windows binary using Wine? (y/n): " BUILD_WINDOWS
if [ "$BUILD_WINDOWS" == "y" ]; then
    wine pyinstaller --onefile --add-data "nexus_finance/static:static" --hidden-import=flask --distpath bin --name="nexus_finance" nexus_finance/app.py
    if [ $? -eq 0 ]; then
        echo "Windows Binary-Build successful!"
    else
        echo "Windows Build failed."
        exit 1
    fi
else
    echo "Skipping Windows binary build."
fi

deactivate
rm -r .build
rm -r build

# Step 7: Ask for commit message and push to Git
read -p "Enter your commit message: " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    echo "No commit message provided. Skipping Git commit and push."
else
    # Stage all changes
    git add .

    # Commit changes with the provided message
    git commit -m "$COMMIT_MSG"
    
    # Check if the commit was successful
    if [ $? -eq 0 ]; then
        echo "Commit successful!"

        # Push changes to the repository
        git push
        if [ $? -eq 0 ]; then
            echo "Push successful!"
        else
            echo "Push failed."
            exit 1
        fi
    else
        echo "Git commit failed."
        exit 1
    fi
fi

# Step 8: Upload to PyPI using Twine
read -p "Do you want to upload to PyPI? (y/n): " UPLOAD_TO_PYPI
if [ "$UPLOAD_TO_PYPI" == "y" ]; then
    # Check if the API key file exists
    API_KEY_FILE="$HOME/.pip/pypi.key"
    if [ ! -f "$API_KEY_FILE" ]; then
        echo "Error: PyPI API key file not found at $API_KEY_FILE"
        exit 1
    fi

    # Read the API key
    API_KEY=$(cat "$API_KEY_FILE")

    # Upload using Twine
    echo "Uploading to PyPI..."
    twine upload -u __token__ -p "$API_KEY" dist/*

    if [ $? -eq 0 ]; then
        echo "Upload to PyPI successful!"
    else
        echo "Upload failed."
        exit 1
    fi
else
    echo "Skipping PyPI upload."
fi

echo "Script completed successfully."

