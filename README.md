# CAINE Website
[cainenotcorso.com](cainenotcorso.com)
[securityofgod.com](securityofgod.com)
[securityofgod.mov](https://securityofgod.net)
[securityofgod.net](securityofgod.net)

This websites main goal is to promote/tease an upcoming project by CAINE, or (if no project is currently being rolled out), provide a scrollable archive list of past projects with links to their release pages.

Thank you CAINE for allowing me to manage and create your website. Literally, without you, this whole website would not exist.

# *(Technical Ramble Jargon Section)*
This website started off as a simple idea: a fullscreen video, countdown timer in the center, and a link to content after the timer was done.

With such a simple idea, it would make sense to also have a simple toolchain, and what's more simple than no toolchain? Just pure `HTML`, `CSS`, and `JavaScript`, just like how our ancestors would have wanted.

Well, long story short, I got carried away and ended up refining the codebase (compartmentalizing, optimizing, experimenting, etc) to death *(and I still think I can keep going!)*. 

Now, the website still uses all vanilla `HTML`, `CSS`, and `JavaScript` (and is quite visually and functionally simple), but now **has grown into a library of tools to create a SPA-like experience**

## Structure

### Projects (`./pages/`)
This is where all projects are contained. Each project is separated into their own folder, which contains their `index.html` along with supplementary pages and assets

Outside of all the project folders (and in the root of `./pages/`) lies a single `index.html`. This file houses the archival page of past projects that can be scrolled through and entered.

### Common
This folder houses all the common files used throughout the website.

All common files are organized into folders based on their type. The two standout folders are:
**`./components`** and **`./scripts`**.

#### `./components`:
This folder contains all the custom `HTML` elements used throughout the website.
These are created using vanilla web components *(shoutout lit.js for even teaching me about this. I promise to find a project to use you in)*
These are common core components that are used throughout the website.
They are designed to be flexible and customizable through attributes.

#### `./scripts`:
As of writing, this folder houses only one *(very,very,VERY important)* file: `pageInject.js`

This script contains the function `pageInject()` which allows for the 'SPA-like' experience throughout the website. This functions allows for standard `HTML` files to be loaded into `DOM` without physically traversing to the file. 

This allows for `HTML` to be designed and implemented through standard files, while still allowing for 'single-page' experience.

It is important to note that **this function does not overwrite the `DOM` with the content from the `HTML` file, but rather it dynamically merges content from the file with the current `DOM`**.

This means that, when both the current `DOM` and the incoming `HTML` file share an element, **this element stays in `DOM`**. This creates a system where:
- Shared elements stay, they are not re-rendered
- Non-returning elements get removed from `DOM`
- New elements get added into `DOM` and rendered alongside the shared elements

This function also **has the ability to manipulate the history stack**, which allows for the ability to traverse backwards, while also saving/containing page specific data.

>[!TIP]
>To see the effect of `pageInject()` merging the current `DOM` with the incoming `HTML` file, simply `'ENTER'` into any project on the archive page (`/pages/index.html`).
>Take note of the video in the background: the progress stays the same!


### Root (`/index.html`)
This is the main entry point for the website.

This file provides:
- General `<head>` metadata
- Loads common `JavaScript` files into memory
    - Custom `HTML` Elements
    - `pageInject()`
- Loads defined 'starting' page
    - When a project is being rolled out, this points to the projects `index.html`
    - When no project is being rolled out, this points to `./pages/index.html`