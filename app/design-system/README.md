# Gyankunj experimental design system

This is an opt-in design-token layer. It does not restyle the current dashboard by default.

## Activation

The stylesheet is imported from `app/globals.css`. In a running app, enable the experimental layer from the browser console:

```js
document.documentElement.dataset.gkDesign = "experimental";
document.documentElement.dataset.theme = "dark"; // or "light"
```

Switch themes without changing application state:

```js
document.documentElement.dataset.theme = "light";
document.documentElement.dataset.theme = "dark";
```

Disable the experiment:

```js
delete document.documentElement.dataset.gkDesign;
delete document.documentElement.dataset.theme;
```

## Preview primitives

Use the opt-in classes inside a preview container:

- `gk-ds-lab`: ambient rose/magenta background and base typography
- `gk-ds-card`, `gk-ds-card--featured`: glass surfaces
- `gk-ds-button`: gradient action
- `gk-ds-chip`: compact metadata label
- `gk-ds-type-display`, `gk-ds-type-heading`, `gk-ds-type-editorial`, `gk-ds-type-body`, `gk-ds-type-caption`: typography roles

All tokens are prefixed with `--gk-` to avoid collisions with the existing cosmic dashboard tokens. The existing gold/navy visual system and selectors are not overridden.

## Important repository note

This repository's `main` branch currently contains the design README and `app/globals.css`, but no package manifest, App Router layout/page, or React entry point. Therefore this commit installs the reusable CSS layer and a DevTools-based theme switch; it does not invent a new app shell or alter application behavior. Once the runnable app files are added to this repository, a visible theme toggle can be mounted in the real layout.
