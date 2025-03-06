#!/bin/bash

# Step 1: Activate virtual environment
source .venv/bin/activate

# Set wine architecture and prefix
export WINEARCH=win32
export WINEPREFIX=~/.wine32

# Step 2: Run pytest to check for any errors
echo "Running pytest..."
pytest
if [ $? -ne 0 ]; then
    echo "Tests failed. Exiting..."
    exit 1
fi

echo "Tests passed successfully!"

# Step 3: Fetch the current version from pyproject.toml
VERSION_FILE="pyproject.toml"
CURRENT_VERSION=$(grep -Po '(?<=version = ")\d+\.\d+\.\d+' $VERSION_FILE)
echo "Current version: $CURRENT_VERSION"

# Ask the user for the new version
read -p "Enter the new version (current version: $CURRENT_VERSION): " NEW_VERSION
if [ -z "$NEW_VERSION" ]; then
    echo "No version provided, using default version 1.0.3"
    NEW_VERSION="1.0.3"
fi

echo "Updating version in $VERSION_FILE to $NEW_VERSION..."

# Use sed to update the version in the pyproject.toml file
sed -i "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" $VERSION_FILE

# Verify the version update
echo "Updated version:"
grep "version" $VERSION_FILE

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
        echo ""
    else
        echo "Windows Build failed."
        exit 1
    fi
else
    echo "Skipping Windows binary build."
fi

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

echo "Script completed successfully."

