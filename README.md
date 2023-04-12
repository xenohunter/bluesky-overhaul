## Bluesky Overhaul

This is a small (and hopefully temporary) extension for Chrome that adds some nice and handy features to [Bluesky](https://bluesky.app/), the greatest media platform of all time.

Right now (as of April 11, 2023), the app is invite-only and the web app is running at https://staging.bsky.app/ (you may find yours truly at [@blisstweeting.ingroup.social](https://staging.bsky.app/profile/blisstweeting.ingroup.social)).

You may also want to support my other [project that is currently in development](https://www.patreon.com/architectofthought).

### Features

This is what's ready, and you also may request new features in issues.

#### Emoji picker

![emoji-picker.png](docs/emoji-picker.png)

#### Auto quote-posting

When you paste a link to someone's post:
- removes "staging." from the URL
- clicks the "Add link card" button for you
- **only works if the URL is at the end of the pasted text**

### Local build

```
npm install
npx webpack
```
