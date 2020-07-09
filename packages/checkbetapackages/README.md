# npm publisher

## About

Provide 1 binary `checkbetapackages`:
Will check your root `package.json` if it contains beta package (with `-` in version)

## Install

### Node.js
Node.js v10 or later required.

### Npm

```sh
npm i @copfrontend/checkbetapackages -D
```

### Dependencies

Independent 💥 

## Usage

#####Since it's binaries, so you'll only need to configure in your `package.json`:
```json
  "scripts": {
    "checkbetapackages": "checkbetapackages",
  },
  "checkbetapackages": [
    "babel"
  ],
```

The `checkbetapackages` is an array of packages that won't be checked, in this example babel won't be checked.

####In your CI, use this YAML
##### npm-exists
```yaml
steps:
- task: Npm@1
  displayName: 'npm run checkbetapackages verify there''s no beta package'
  inputs:
    command: custom
    verbose: false
    customCommand: 'run checkbetapackages'
    customEndpoint: 'AXA France Nexus npm'
```
![example sample](../../docs/npm-checkbetapackages.png)

## Contributing
We welcome all contributions. Our contribution guidelines can be found in the [CONTRIBUTING.md](../../CONTRIBUTING.md).
