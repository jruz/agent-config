def has-nushell-shebang [file: path]: nothing -> bool {
    if not (open --raw $file | bytes at 0..1 | bytes starts-with 0x[2321]) {
        return false
    }
    (open --raw $file
        | lines
        | take 1
        | any {|line| $line =~ '^#!\s*(?:/\S*/env\s+(?:-S\s+)?nu|/\S*/nu)(?:\s|$)' })
}

export def discover []: nothing -> list<string> {
    let modules = (^fd --hidden --type file --extension nu --exclude .git)
    let candidates = (^fd --hidden --type file --exclude .git '^[^.]+$')
    let scripts = ($candidates
        | lines
        | where (has-nushell-shebang $it))
    ($modules
        | lines
        | append $scripts
        | path expand
        | sort)
}
