#!/bin/bash

# 1. Clone current clean state
echo "Creating clean backup..."
git clone https://github.com/mousberg/reef.git reef-clean
cd reef-clean

# 2. Remove origin
git remote remove origin

# 3. Create new repo (you'll do this manually on GitHub)
echo "Now you need to:"
echo "1. Go to GitHub and rename 'reef' to 'reef-old'"
echo "2. Create a new repository called 'reef'"
echo "3. Then run:"
echo "   git remote add origin https://github.com/mousberg/reef.git"
echo "   git push -u origin main"
echo ""
echo "This will completely eliminate all traces of the old commits!"
