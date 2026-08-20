# Frontend

The browser application uses Angular 21, PrimeNG 21, and PrimeFlex 4. Run commands through Rush so
the repository's pinned Node and package-manager configuration is respected.

## Development server

```bash
node ../../common/scripts/install-run-rushx.js start
```

Navigate to `http://localhost:4200/`. The app reloads when source files change.

## Code scaffolding

Run `node ../../common/scripts/install-run-rushx.js ng generate component component-name` to
generate a component. The same prefix works for other Angular CLI generators.

## Build

```bash
node ../../common/scripts/install-run-rushx.js build
```

The application builder writes production artifacts to `dist/frontend`.

## Running unit tests

```bash
node ../../common/scripts/install-run-rushx.js test --watch=false --browsers=ChromeHeadless
```

Karma and Jasmine remain the unit-test runner. Angular supports Karma, while its migration path for
existing projects to Vitest is still experimental. The browser test environment uses the modern
`@angular/platform-browser/testing` entry point.

## Linting

```bash
node ../../common/scripts/install-run-rushx.js lint
```

ESLint 9 uses the flat configuration in `eslint.config.js` with Angular ESLint 21.

## Browser storage

Filmography and service-provider catalogues are kept in memory and fetched from the API after a
page reload. They are deliberately not persisted in browser storage because the complete catalogue
can exceed common `localStorage` quotas. Startup removes catalogue keys written by older versions.

The remaining versioned storage wrapper is reserved for small preferences and metadata. Each item
is capped at 4 KiB and total application storage is capped at 16 KiB. Disabled storage, corrupt
JSON, stale versions, and quota errors are treated as cache misses so they cannot prevent the
application from loading.

## Browser smoke tests

With the API on port 3000 and the frontend on port 4200:

```bash
node ../../common/scripts/install-run-rushx.js cypress:run
```

Cypress 15 is invoked directly instead of through the retired Angular Cypress schematic. The smoke
suite covers home catalogue loading, title search, film detail navigation, the provider index, and
provider detail navigation.

## Angular 21 migration decisions

- Angular 21 is the current LTS release compatible with the repository's Node 22.22.1 runtime.
- Angular's application builder replaces the legacy browser builder, and the root now uses
  `bootstrapApplication`; lazy feature modules remain to keep the routing change focused.
- Angular's built-in control-flow migration updated templates. Existing feature declarations remain
  NgModule-based so route behavior and component boundaries stay unchanged.
- PrimeNG 21 uses the Aura preset and semantic `--p-*` design tokens. Dark mode is driven by the
  `.app-dark` root class; the old linked light/dark theme stylesheets were removed.
- Obsolete Angular, Cypress-schematic, Elf plugin, lazy-image, and test-reporter dependencies were
  removed. The catalogues continue to load once during application bootstrap without request-cache
  persistence.
- Rush removes Angular's optional LMDB build cache through `.pnpmfile.cjs`. The native addon
  reproducibly aborts Node on macOS; Angular falls back to its supported in-memory cache, so output
  is unchanged and local builds are only slightly slower.

### Production bundle comparison

| Bundle | Angular 14 baseline | Angular 21 |
| --- | ---: | ---: |
| Initial raw total | 1.07 MB | 901.88 kB |
| Initial estimated transfer | 136.28 kB | 148.51 kB |
| Global styles raw | 656.77 kB | 364.20 kB |

The raw initial bundle is about 16% smaller and now stays below the existing 1 MB warning budget.
The remaining build warnings come from PrimeFlex 4's upstream Sass source and the intentionally
disabled optional LMDB cache; neither changes generated output.


## Generating Features/Modules/Etc

How to generate code using the angular CLI

### Generate Component

```bash
ng generate component service-button-node
ng g c service-button-node
```

### Generate Module

```bash
ng g module service-overview --routing true
ng g m service-overview --routing true
```
