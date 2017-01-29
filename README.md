# polymer-weight :weight_lifting_man:

size of imported components

[![Join the chat at https://gitter.im/aruntk/polymer](https://badges.gitter.im/aruntk/polymer.svg)](https://gitter.im/aruntk/polymer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![npm](https://img.shields.io/npm/v/polymer-weight.svg) ![npm](https://img.shields.io/npm/dm/polymer-weight.svg)](https://www.npmjs.com/package/polymer-weight)

![screenshot](screenshots/screenshot.png)

## Installation

```sh
npm i -g polymer-weight
weigh --path path/to/file.html
```

## Options

### Path

path to the starting file (index file)
```sh
weigh --path path/to/file.html
```
### Depth

How deep the table should show.

eg if depth = 1. Immediate child links and the index file
```sh
weigh --path path/to/file.html --depth 1
```

## Table Columns

### Standalone weight

Standalone size of the components. ie. space that can be saved by removing the component.

By default table is sorted in the descending order of standalone weight.

### Net weight

Net weight of a link.

### file size

Size of the file corresponding to a link.

More features coming. :)


## TODO

- [x] Deep Scanning of files (walk).
- [x] Net weight added by component and its children.
- [x] Standalone size (space that can be saved by removing the component)
- [ ] Show dependency relationship in some way so that user can know which link to remove to reduce size.
- [ ] Handle css imports. @import

### Like it?

:star: this repo

### Found a bug?

Raise an issue!
