#!/bin/bash
input=$(cat)
cwd=$(echo "$input" | jq -r '.cwd')
project=$(basename "$cwd")
message=$(echo "$input" | jq -r '.message')
icon="$HOME/.claude/hooks/clawd-icon.png"

/opt/homebrew/bin/terminal-notifier \
  -message "$message" \
  -title "$project" \
  -contentImage "$icon" \
  -sound default
