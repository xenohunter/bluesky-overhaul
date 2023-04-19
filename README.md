# Bluesky Overhaul

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/cllpkmbebfmadmkkpplnaaffnhjjpgbi)](https://chrome.google.com/webstore/detail/bluesky-overhaul/cllpkmbebfmadmkkpplnaaffnhjjpgbi)
[![Mozilla Add-on](https://img.shields.io/amo/v/bluesky-overhaul)](https://addons.mozilla.org/en-US/firefox/addon/bluesky-overhaul/)
[![Liberapay receiving](https://img.shields.io/liberapay/receives/blisstweeting)](https://liberapay.com/blisstweeting/)

This is a small extension for [Chrome](https://chrome.google.com/webstore/detail/bluesky-overhaul/cllpkmbebfmadmkkpplnaaffnhjjpgbi) (and partially [Firefox](https://addons.mozilla.org/addon/bluesky-overhaul/)) that adds some nice and handy functionality to [Bluesky](https://bsky.app/), the greatest media platform of all time.

Right now (as of April 19, 2023), the app is invite-only and the web app is running at https://staging.bsky.app/ (you may find yours truly at [@blisstweeting.ingroup.social](https://staging.bsky.app/profile/blisstweeting.ingroup.social)).

## Features

Implemented features are listed here. For the planned ones, see [Issues](/issues) or [this Bluesky thread](https://staging.bsky.app/profile/blisstweeting.ingroup.social/post/3jszn6rreec2i) (login required). You can also [create an issue](/issues/new) if you have a feature request.

### Emoji picker

Allows you to pick emojis from a palette of all available emojis. You can also search for emojis by name.

_Doesn't work on Firefox yet._

![emoji-picker.png](docs/emoji-picker.png)

### Auto quote-posting

When you paste a link to someone's post:
- removes "staging." from the URL
- clicks the "Add link card" button for you
- **only works if the URL is at the end of the pasted text**
- you can remove the link from the text after the card is loaded

### Exit post composing modal window

You can now exit the modal window by pressing `Esc` or clicking outside of it.

### Send posts with `Ctrl+Enter` (or `Cmd+Enter` on Mac)

That's pretty much self-explanatory.

### Keyboard navigation for photos

You can navigate through photos with `←` and `→` keys and close the modal window with `Esc`.

## Local build

```
npm install
npm run build
```
