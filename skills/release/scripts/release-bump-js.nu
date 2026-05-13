use log.nu

def fail [label: string, stderr: string]: nothing -> error {
    let trimmed = ($stderr | str trim)
    let message = if ($trimmed | is-empty) {
        $"($label) failed"
    } else {
        $"($label) failed: ($trimmed)"
    }
    error make {msg: $message}
}

def bump-package-json [version: string]: nothing -> nothing {
    let pkg = (open package.json)
    $pkg | upsert version $version | save --force package.json
}

def git-add-release-files []: nothing -> nothing {
    let result = (^git add package.json | complete)
    if $result.exit_code != 0 {
        fail "git add" $result.stderr
    }
}

def git-commit-version [version: string]: nothing -> nothing {
    let result = (^git commit --message $"[tool] Version: Bump to ($version)" | complete)
    if $result.exit_code != 0 {
        fail "git commit" $result.stderr
    }
}

def main [version: string]: nothing -> nothing {
    if ($version !~ '^\d+\.\d+\.\d+$') {
        log err $"invalid version format: ($version) \(expected 0.0.0\)"
        exit 1
    }

    try {
        let current = (open package.json | get version)
        bump-package-json $version
        git-add-release-files
        git-commit-version $version
        log ok $"Bumped ($current) -> ($version)"
    } catch {|err|
        log err $err.msg
        exit 1
    }
}
