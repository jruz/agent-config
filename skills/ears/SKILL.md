---
name: ears
description: Write requirements using EARS (Easy Approach to Requirements Syntax). Use when writing specifications, requirements, or system behavior documentation.
---

# EARS (Easy Approach to Requirements Syntax)

EARS is a structured format for writing clear, unambiguous requirements using five sentence types.

## Sentence Types

EARS defines five sentence types for different requirement scenarios:

### 1. Ubiquitous

For fundamental system capabilities that always apply.

**Format:** The `<system name>` shall `<system response>`

**Example:**
```
The system shall validate all user input before processing.
```

### 2. Event-Driven

For requirements triggered by specific events or actions.

**Format:** When `<optional preconditions>` `<trigger>`, the `<system>` shall `<system response>`

**Example:**
```
When the user submits the form, the system shall validate all fields.
```

### 3. State-Driven

For requirements that apply while the system is in a specific state.

**Format:** While `<in a state>`, the `<system>` shall `<system response>`

**Example:**
```
While the system is processing a request, the system shall display a loading indicator.
```

### 4. Unwanted Behavior

For error conditions, edge cases, or invalid inputs that require specific handling.

**Format:** If `<optional preconditions>` `<trigger>`, then the `<system>` shall `<system response>`

**Example:**
```
If the network connection fails, then the system shall retry up to three times.
```

### 5. Optional Features

For requirements that only apply when optional features are present.

**Format:** Where `<feature>`, the `<system>` shall `<system response>`

**Example:**
```
Where authentication is enabled, the system shall require valid credentials.
```

## Combined Sentences

Complex requirements can combine multiple sentence types:

**Example:**
```
Where caching is enabled, while data is being fetched, when the cache expires, the system shall refresh the cached data.
```

## Steps to Apply EARS

When writing specifications, follow these steps:

1. **Identify the type** - Determine if you're writing a requirement or something else (note, example, explanation)
2. **Split compound requirements** - Break down complex statements into atomic requirements
3. **Identify the actor** - Determine which system, person, or process is acting
4. **Choose sentence type(s)** - Select the appropriate EARS template(s)
5. **Find missing requirements** - Consider state transitions (2 states + 2 events = 4 requirements)
6. **Check for issues** - Review for ambiguity, conflicts, and repetition
7. **Review** - Get feedback if possible
8. **Iterate** - Refine as needed

## Characteristics of Good Requirements

Every requirement should be:

- **Unambiguous** - Has one interpretation
- **Traceable** - Can be identified uniquely
- **Consistent** - Doesn't conflict with other requirements
- **Verifiable** - Can be tested or checked
- **Complete** - Contains all relevant information

## Troubleshooting Common Problems

### No sentence type fits

- Use a higher abstraction level until it makes sense
- Get more information from stakeholders
- Consider if you're actually writing a requirement

### Can't identify the actor

- Usually happens with non-functional requirements
- Express as "the system shall be..." (e.g., "the system shall be responsive")

### No system response

- Try stating as "shall be immune" or similar workaround
- As last resort, use "shall not" structure

### Need to use "shall not"

- Try positive phrasing first: "shall be immune", "shall reject", "shall prevent"
- Use "shall not" as last resort when no positive alternative exists

### Too many atomic requirements

- EARS produces granular requirements by design
- For deep technical details, consider using a list as accompaniment
- If EARS seems inappropriate, consider alternative formats for purely technical specs

## Best Practices

### Use Templates

- Include requirement identifiers for traceability
- Provide space for notes and examples
- Keep templates lightweight - don't let process overhead slow you down

### Maintain Requirements

- Keep specifications up to date as the system evolves
- Review regularly for consistency and completeness

### Remember the Purpose

- Requirements are about communicating between stakeholders
- See the forest, not just the trees
- Methods are means to an end, not the end itself

## Common Patterns

### State Transitions

WHERE state transitions exist, consider all combinations:
- 2 states × 2 events = 4 requirements minimum

Example for a connection:
```
WHEN connection is requested, THE system SHALL establish connection.
WHILE connected, WHEN disconnect is requested, THE system SHALL close connection.
IF connection fails, THEN THE system SHALL log error and notify user.
WHERE reconnection is enabled, IF connection is lost, THEN THE system SHALL attempt to reconnect.
```

### Error Handling

Use IF...THEN for error conditions:
```
IF input validation fails, THEN THE system SHALL return error message.
IF database is unavailable, THEN THE system SHALL queue the operation.
IF timeout occurs, THEN THE system SHALL cancel the request.
```

### Optional Features

Use WHERE for conditional functionality:
```
WHERE logging is enabled, THE system SHALL record all transactions.
WHERE caching is configured, THE system SHALL store results.
WHERE authentication is required, THE system SHALL verify credentials.
```
