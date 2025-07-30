# Project Linting and Prop Validation

This project uses a custom `.cursorrules` file to enforce best practices and prevent common errors, such as forwarding invalid props to DOM elements.

## `.cursorrules`

The `.cursorrules` file defines a set of rules that are used to validate component props. This helps ensure that only valid HTML attributes are passed to DOM elements, which prevents runtime warnings and potential bugs.

### `prop-forwarding` Rule

This rule is designed to catch instances where non-standard props are passed to DOM elements. When this issue is detected, it will produce a warning with a suggestion on how to resolve it.

By adhering to these rules, we can maintain a high level of code quality and prevent common issues from arising.
