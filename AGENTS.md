# Changelog maintenance

Follow [xrnavigation/changelog-tools](https://github.com/xrnavigation/changelog-tools#writing-a-note)
for Audiom-wide change history. Add a new `.changelog/<id>.json` for behavior,
API, compatibility, dependency and operational changes with
`npm run changelog:add`. Breaking changes need migration advice; internal-only
work needs an explicit reason. Keep published fragments immutable. Direct
commits need notes too.

Check the staged change with `npm run changelog:note:check`.
