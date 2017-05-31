[![CircleCI](https://circleci.com/gh/Optykan/Tzuyu/tree/deploy.svg?style=svg)](https://circleci.com/gh/Optykan/Tzuyu/tree/deploy)

<h1>Meet Tzuyu</h1>

![](http://cdn.koreaboo.com/wp-content/uploads/2016/06/7-1-e1467067293149.jpeg "Basically Sam is going to jail")

<h2>Features:</h2>

- Plays music
- Customizeable command prefix
- Currently Supports YouTube audio
- Heroku-compatible
- Tzuyu is qt bae

<h2>Setup</h2>

If you're using Heroku, follow all the steps except for the ones marked (Local). If you're running this locally, follow all the steps except the ones marked (Heroku).

1. Create a `.env` file, and add keys for `BOT_TOKEN` (the token that discord developer page gives you) and `YT_API_KEY` (from the [google developer console](https://console.developers.google.com)). Optionally, add a `BOT_CHANNEL` which holds the id of the default text channel the bot should message in. Syntax: `KEY_NAME=KEY_VALUE`.

2. (Heroku) Navigate to Settings > Config Variables and copy the key/value pairs from step 1.

3. (Heroku) Deploy this repo to your local heroku instance and navigate to Settings>Buildpacks and add: `https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git`

4. (Local) Run `npm install` then `npm start`. Make sure you have [ffmpeg installed](https://ffmpeg.org/) and avaliable in your PATH (if windows)

5. (Heroku) Navigate to Resources > Dynos and make sure the `bot` worker is enabled.

6. [Add the bot to your server](https://stackoverflow.com/questions/37689289/joining-a-server-with-the-discord-python-api)

7. Try `$help` and see if its alive.

Notes: Make sure the bot is actually a bot (see [https://discordapp.com/developers/applications/me](https://discordapp.com/developers/applications/me))