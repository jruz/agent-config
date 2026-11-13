#!/usr/bin/env nu

use std/log

def project-name []: nothing -> string {
    ^git rev-parse --show-toplevel | str trim | path basename
}

def notify-ntfy [title: string, message: string]: nothing -> nothing {
    let url = $"https://ntfy.sh/($env.NTFY_CHANNEL_DESKTOP)"
    (http post
        --headers {Title: $title}
        --max-time 10sec
        $url
        $message)
    | ignore
}

def notify-macos [title: string, message: string]: nothing -> nothing {
    (^terminal-notifier
        -title $title
        -message $message
        -sound default)
}

# Send a desktop notification titled with the current git project
def main [
    message: string # Notification body
]: nothing -> nothing {
    let title = (project-name)
    match $nu.os-info.name {
        "linux" => (notify-ntfy $title $message)
        "macos" => (notify-macos $title $message)
        $os => {
            log error $"unsupported notification platform: ($os)"
            exit 1
        }
    }
}
