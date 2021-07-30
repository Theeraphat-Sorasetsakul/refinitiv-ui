# `text-field/TextField`

## `Should have a correct DOM structure`

####   `Label and DOM structure is correct`

```html
<input
  autocomplete="off"
  maxlength="10"
  minlength="5"
  part="input"
  pattern="[a-z]"
  placeholder="Placeholder"
  type="text"
>
<ef-icon
  icon="menu"
  part="icon"
>
</ef-icon>

```

####   `Has correct DOM structure, when initialised with maxlength value`

```html
<input
  autocomplete="off"
  maxlength="5"
  part="input"
  type="text"
>

```

####   `Has correct DOM structure, when set maxlength value using element.setAttribute(maxlength)`

```html
<input
  autocomplete="off"
  maxlength="5"
  part="input"
  type="text"
>

```

####   `Has correct DOM structure, when remove maxlength`

```html
<input
  autocomplete="off"
  part="input"
  type="text"
>

```

####   `Has correct DOM structure, when initialised with minlength value`

```html
<input
  autocomplete="off"
  minlength="10"
  part="input"
  type="text"
>

```

####   `Has correct DOM structure, when set minlength value using element.setAttribute(minlength)`

```html
<input
  autocomplete="off"
  minlength="5"
  part="input"
  type="text"
>

```

####   `Has correct DOM structure, when remove minlength`

```html
<input
  autocomplete="off"
  part="input"
  type="text"
>

```

####   `Has correct DOM structure, when initialised with icon`

```html
<input
  autocomplete="off"
  part="input"
  type="text"
>
<ef-icon
  icon="calendar"
  part="icon"
>
</ef-icon>

```

####   `Has correct DOM structure, when initialised with read only state`

```html
<input
  autocomplete="off"
  part="input"
  readonly=""
  type="text"
>

```

####   `Has correct DOM structure, when no read only state initially but added later`

```html
<input
  autocomplete="off"
  part="input"
  readonly=""
  type="text"
>

```

####   `Has correct DOM structure, when removed read only state`

```html
<input
  autocomplete="off"
  part="input"
  type="text"
>

```
