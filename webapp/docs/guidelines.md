## Development Guidelines

We follow the recommended guidelines from the [angular framework](https://angular.io/guide/styleguide).

## Code Conventions

### Coding Style

Try your best to apply the single responsibility principle (SRP) to all components, services, and other symbols.

This helps make the app cleaner, easier to read, maintainable and more testable.

Classes should be named upper camel case follow by the specific suffix.
Depending on the usage of components, services and so on.

For example: `AssetListComponent` or `AssetService`.

Properties and methods should be lower camel case.

The properties must be at the top of your component, and the public properties should come first followed by the private ones. This rule is also applicable for methods.

Common component structure:

- Decorators (@Input, @Output, @ViewChild)
- Public properties
- Private properties
- Class constructor
- Lifecycle hooks
- Public methods
- Private methods

Be careful when importing external libraries. Only import what is needed. Avoid the `*` tag.

Do define one thing, such as a service or component, per file.

Consider limiting files to 400 lines of code.

### Small methods

Do define small methods

Consider limiting to no more than 75 lines.

### RXJS

Angular works with [rxjs](https://rxjs-dev.firebaseapp.com/guide/overview) behind the scenes, so you should have a good knowledge of this library.

RxJS is a library for composing asynchronous and event-based programs by using observable sequences.

> Think of RxJS as Lodash for events - this is the statement you find on the rxjs website.

A great use case is when you have to manage api requests, since it could return an observable.

RXJS has a great arsenal of operators which might be handy.

Here you find the minimal rxjs operators to be aware of:

- `map`
- `merge`
- `concat`
- `mergeMap` & `switchMap`
- `combineLatest`
- `filter`
- `zip`
- `scan` & `reduce`
- `take` & `takeWhile`
- `tap`
- `debounceTime`
- `distinctUntilChanged`
- `delay`
- `from` & `fromEvent`

### Lodash

Whenever possible, we want to use a functional programming approach using pre-defined JavaScript methods instead of reinventing the wheel.

All developers should familiarize themselves with the methods offered by [Lodash](https://www.lodash.com).

Here the minimal Lodash arsenal to be aware of:

- `intersection` & `intersectionWith`
- `union` & `unionWith`
- `uniq` & `uniqWith`
- `zipObject`
- `find`
- `groupBy`
- `partition`
- `some`
- `sortBy`
- `isEmpty`
- `isEqual`
- `get`
- `merge` & `mergeWith`
- `pickBy`

Learn about the difference between Vanilla JS `filter`/`map`/`reduce`/etc. and Lodash `filter`/`map`/`reduce`/etc.

For example: You can use Lodash's versions not just on arrays but also on objects. This makes the use of combinations of `.map` and `.filter` with `Object.entries`, `Object.values`, and `Object.keys` obsolete and makes code shorter and more readable.

> **Note:** Keep in mind, if you need to use this types of utility methods with observables, rxjs is there for you.

### Interface and Type Names

Do not use “I” at the beginning of an interface or type names. For example, do not write `IState` or `IView`.

### Observables & Subjects

By convention observables and subjects should end with a `$` sign.

### JavaScript Operators

The most common operators, [logical](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators) and otherwise, include:

- logical NOT `!` in front of words
- double NOT `!!` in front of words
- logical AND `&&` used for [short-circuit evaluation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#Short-circuit_evaluation)
- logical OR `||` used for short-circuit evaluation and default values
- ternary checks using `? :`
- [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) using `?.`
- using `?` for optional arguments in functions
- [nullish coalescing](https://medium.com/@bramus/esnext-javascript-nullish-coalescing-operator-3e56afb64b54) `??` as a replacement for logical OR `||` when used as a default value
- [non-null assertion operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator) invoked by using `!` after a variable

<strong>IMPORTANT:</strong> Please use the non-null assertion operator very sparingly! Overriding a null/undefined type check is generally not a good idea.
When you write the code, it may seem safe but later refactoring can introduce real null or undefined values which will no longer be caught by the type checker.

### Typescript

Strive to improve TypeScript knowledge.

There are many features TypeScript offers to catch potential problems before running the compiler.
Developers should strive to improve their knowledge of TypeScript and use its features in our code base.

Things like:

- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Never and Unknown Types](https://blog.logrocket.com/when-to-use-never-and-unknown-in-typescript-5e4d6c5799ad/)
- ...

> **Note:** Avoid the any type.

## Styling

### Naming HTML Classes

To ensure a homogeneous nomenclature of the html classes we adopted the BEM methodology;

Some old code might not be compliant with this practice, but try to follow this pattern in future developments.

Please read the [docs](http://getbem.com/naming/);

### CSS Framework

We use [tailwind css](https://tailwindcss.com/docs) to style our app.
Tailwind is a utility-first css framework which comes with a lot of built-in css classes.

Tailwind is well documented, but you could also check this cheat sheet [here](https://github.com/LeCoupa/awesome-cheatsheets/blob/master/frontend/tailwind.css), if you prefer.

Tailwind is highly customizable so, if you intend to add any specific configurations, you should do it on the `tailwind config` file.

Any global css must be added to the layer base on the `base.scss` file.

Tailwind makes the process of styling easy by providing classes ready to be integrated on the html.

To avoid any unnecessary "noise" on the html pages, we suggest applying those styles on the scss files.

E.g:

```html
<div class="assets-grid"></div>
```

```css
.assets-grid {
  @apply grid grid-cols-12 gap-2 w-full h-full sm:pl-4 md:pl-4 lg:pl-8 relative;
}
```

We are using [stylelint](https://stylelint.io/) for css validation.

```json
{
  "extends": "stylelint-config-recommended",
  "rules": {
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": ["extends", "tailwind", "layer", "apply", "include", "mixin"]
      }
    ],
    "declaration-block-trailing-semicolon": null,
    "no-descending-specificity": null
  }
}
```

You might find some css warnings on vscode. To disable those, you must configure vscode settings.json with the following:

```json
{
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false
}
```

This prevents the default linter from validating the css.

### Icons

We are using [remixicon](https://remixicon.com/), an open source library with a set of neutral-style symbols.

With the help of [ngneat](https://github.com/ngneat/svg-icon) all of those icons are converted to typescript.

If you intend to add more icons, please make sure you add them on the svg folder @`src/assets/svg`.
This enables us to convert all svg icons into typescript types by running the command:

- `npm run generate-icons`

The configuration for this script is available on the package json.

##### package.json

```json
{
  "svg-to-ts": {
    "generateType": "false",
    "delimiter": "KEBAB",
    "conversionType": "files",
    "iconsFolderName": "svg",
    "prefix": "app",
    "srcFiles": ["./src/assets/svg/*.svg"],
    "outputDirectory": "./src/app",
    "svgoConfig": {
      "plugins": [
        {
          "removeDimensions": true,
          "cleanupAttrs": true
        }
      ]
    }
  }
}
```

All the icons must be imported to the shared-icons-module icons array, available on the app shared folder.

Keep in mind that to use the icons, you must import the icons array as a child of `SvgIconsModule` and attach it to the desirable module.

E.g:

```typescript
import { icons } from './shared/shared-icons.module';
@NgModule({
imports: [
  SvgIconsModule.forChild(icons),
]
})
```

### EsLint

Please make sure you follow the linting rules by fixing all the errors and warnings which might arise.

You can check those alerts by running the command:

- `npm run lint`

This app uses the recommended rules for typescript.

### Code Formatter

We use [prettier](https://prettier.io/) style guide to format the files structure;

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

To verify and adjust the format of each document, run the command:

- `npm run format`

### Git hooks

In order to ensure that all code is in sync with the rules mentioned above, we've implemented some git hooks using the husky library.

```json
  "husky": {
    "hooks": {
      "pre-commit": "npm run format && npm run lint",
      "pre-push": "npm run test:ci"
    }
  },
```

Make sure all linting warnings and errors are fixed and all the tests are asserted before you push the code.

We also provide some scripts to verify the tests before deploying the code:

- `npm run [script]`

```json
    "test": "ng test --code-coverage --watch=true --browsers=Chrome",
    "test:ci": "ng test --code-coverage --watch=false --browsers=ChromeHeadless"
```
