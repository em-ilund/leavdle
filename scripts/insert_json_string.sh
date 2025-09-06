#!/bin/bash

set -euo pipefail

file=/home/emill/projects/leavdle/data/sketches.json
index="${1:-0}" # Optional first argument, choose which object index to target. Defaults to 0

if [[ ! -f $file ]]; then
    echo "File doesn't exist"
    exit 1
fi

echo "Appending to object at index $index in $file..."
echo "Type a string to append or Enter to quit"

while true; do
    read -p "> " inputString
    if [[ -z $inputString ]]; then
        echo "Exiting..."
        break
    fi

jq --arg s "$inputString" --argjson i "$index" \
'.[$i].lines += [$s]' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

echo "Added \"$inputString\" to lines array at index $index."

done