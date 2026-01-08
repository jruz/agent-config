---
name: SCSS
description: Write SCSS with BEM naming, performance optimization, and modern best practices
---

# SCSS

Use this skill when writing SCSS/CSS code or working with stylesheets.

## File Organization

THE system SHALL co-locate SCSS files with their corresponding view templates.

THE SCSS file SHALL be named to match the view file.

## SCSS Features

THE system SHALL use SCSS nesting for related selectors.

THE system SHALL nest BEM elements and modifiers under their parent block using `&`.

THE system SHALL use the `&` parent selector for pseudo-classes and modifiers.

## Naming Conventions

THE system SHALL use lowercase with hyphens for class names.

THE system SHALL use descriptive class names that indicate purpose.

THE system SHALL follow strict BEM (Block Element Modifier) naming convention for all custom CSS classes.

THE system SHALL use double underscore (`__`) to separate block names from element names.

THE system SHALL use double hyphen (`--`) to separate element names from modifier names.

THE system SHALL NOT use ID selectors for styling purposes.

WHERE ID selectors exist THE system SHALL use them only for JavaScript targeting.

WHERE styling is needed THE system SHALL use class selectors with BEM naming.

THE system SHALL use both block and modifier classes when applying modifiers.

### BEM Examples

```scss
.card {
  &__header {
    font-size: 1.2rem;

    &--large {
      font-size: 1.5rem;
    }
  }

  &__body {
    padding: 1rem;
  }

  &--highlighted {
    border: 2px solid blue;
  }
}
```

Compiled to:
- `.card`
- `.card__header`
- `.card__header--large`
- `.card__body`
- `.card--highlighted`

## Color Management

THE system SHALL define colors in a centralized location.

THE system SHALL use consistent color values across stylesheets.

WHERE theme colors are needed THE styles SHALL reference centrally defined colors.

## Responsive Design

WHERE responsive styles are needed THE system SHALL use media queries.

THE system SHALL design mobile-first.

## Performance

### Selectors

THE system SHALL use simple, low-specificity selectors.

THE system SHALL use BEM class selectors as the primary selector pattern.

THE system SHALL NOT use ID selectors for styling.

THE system SHALL NOT use child selectors (`>`) as primary selectors.

THE system SHALL NOT use descendant selectors (space) as primary selectors.

THE system SHALL NOT use sibling selectors (`+`, `~`).

THE system SHALL NOT use the universal selector (`*`).

WHERE nesting is needed THE system SHALL create explicit BEM element classes.

WHERE SCSS nesting is used with `&` THE system MAY use descendant selectors for framework elements (e.g., `&:hover i.icon`).

WHERE pseudo-classes are needed THE system SHALL use `&` with pseudo-class selectors (e.g., `&:hover`, `&:focus`).

### Animations

WHERE animations are used THE system SHALL animate only transform and opacity properties.

THE system SHALL NOT animate properties that trigger reflow (width, height, top, left, margin, padding).

THE system SHALL use GPU-accelerated properties (3D transforms, will-change).

THE system SHALL provide reduced motion alternatives using `prefers-reduced-motion` media query.

WHERE will-change is used THE system SHALL use it as a last resort for existing performance issues.

### Unused Styles

THE system SHALL remove unused CSS.

WHERE styles are conditionally needed THE system SHALL split them into separate files.

### Build Optimization

THE system SHALL minify CSS for production.

THE system SHALL compress CSS files using gzip.

WHERE critical CSS exists THE system SHALL inline it or use preload hints.

### Font Performance

WHERE custom fonts are used THE system SHALL use the `font-display` descriptor.

WHERE fonts are critical THE system SHALL preload them using `rel="preload"`.

THE system SHALL limit font glyph ranges using `unicode-range` when appropriate.

### General Guidelines

THE system SHALL NOT use `!important`.

THE system SHALL keep nesting under 4 levels deep.

THE system SHALL measure performance before and after optimization changes.

## Linting

THE system SHALL use Biome for CSS/SCSS linting.

THE Biome configuration SHALL enable all CSS rules.

THE developer SHALL run `just frontend-lint` to lint SCSS files.

THE linter SHALL check for syntax errors and formatting issues.

THE linter SHALL enforce consistent code style across all SCSS files.

WHERE linting errors occur THE developer SHALL fix them before committing code.

THE system SHALL integrate linting into the CI pipeline.

THE linter configuration SHALL be version controlled.
