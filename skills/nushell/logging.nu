const severity = {
    TRACE: {text: "TRACE", number: 1}
    DEBUG: {text: "DEBUG", number: 5}
    INFO: {text: "INFO", number: 9}
    WARN: {text: "WARN", number: 13}
    ERROR: {text: "ERROR", number: 17}
    FATAL: {text: "FATAL", number: 21}
}

def log [level: record, body: string, attributes?: record] {
    let entry = {
        Timestamp: (date now | format date "%Y-%m-%dT%H:%M:%S%.3fZ")
        SeverityText: $level.text
        SeverityNumber: $level.number
        Body: $body
        Attributes: ($attributes | default {})
    }

    print ($entry | to json --raw)
}
