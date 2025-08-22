# Category Icon Library

This directory contains the default icon library for category customization in Link4Coders.

## Structure

The icons are organized by category and stored as SVG files for optimal quality and performance:

```
category-library/
├── personal/
│   ├── user.svg
│   ├── person.svg
│   ├── profile.svg
│   ├── id-card.svg
│   └── briefcase.svg
├── projects/
│   ├── github.svg
│   ├── code.svg
│   ├── terminal.svg
│   ├── folder.svg
│   └── git-branch.svg
├── blogs/
│   ├── book-open.svg
│   ├── edit.svg
│   ├── file-text.svg
│   ├── pen-tool.svg
│   └── newspaper.svg
├── achievements/
│   ├── award.svg
│   ├── trophy.svg
│   ├── medal.svg
│   ├── star.svg
│   └── target.svg
├── contact/
│   ├── mail.svg
│   ├── phone.svg
│   ├── map-pin.svg
│   ├── message-circle.svg
│   └── calendar.svg
├── social/
│   ├── share-2.svg
│   ├── users.svg
│   ├── heart.svg
│   ├── thumbs-up.svg
│   └── link.svg
└── custom/
    ├── link.svg
    ├── external-link.svg
    ├── globe.svg
    ├── bookmark.svg
    └── tag.svg
```

## Usage

These icons are referenced by the CategoryIconService and displayed through the IconLibrarySelector component. The icons are based on Lucide React icons and maintain consistency with the existing design system.

## Adding New Icons

To add new icons to the library:

1. Add the SVG file to the appropriate category directory
2. Update the `getLibraryIcons` method in `CategoryIconService` to include the new icon
3. Ensure the icon follows the same style and sizing conventions (24x24 viewBox)

## Icon Guidelines

- Use SVG format for scalability
- Maintain 24x24 viewBox for consistency
- Use single color (will be styled via CSS)
- Keep stroke width consistent (typically 2px)
- Follow Lucide icon style guidelines
