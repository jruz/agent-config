let env_record = (
  open .env.test
  | lines
  | where ($it !~ '^#' and $it != '')
  | parse "{key}={value}"
  | transpose --header-row
  | into record
)

load-env $env_record
