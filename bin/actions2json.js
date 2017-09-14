#!/usr/bin/env node

var cp = require('child_process')
var argv = require('minimist')(process.argv.slice(2))
var path = require('path')

// If the user passes in a help flag we print some help text
// -h, --help
if (argv.h || argv.help) {
  console.log(
`
Usage

  $ actions2json
    # Returns the filename of the Blender addon. Useful for running the addon via CLI
    # i.e.
    #   blender my-model.blend --python \`actions2json\` -- /var/tmp/output-file.json

  $ actions2json --help
    # Prints some help text on how to use this command

  $ actions2json --install
    # Installs and enables the addon and then saves it to your Blender user preferences
    # Note that you must have Blender in your $PATH in order for this command to work

Options

  -h, --help            -> Get help text about using the blender-actions-to-json CLI

  -i, --install         -> Install the addon and save it in your Blender
`
  )
  process.exit(0)
}

// If the user wants to intall the addon we run a script that installs the addon,
// enables it and then saves their user preferences
if (argv.i || argv['install']) {
  var addonInstallScript = path.resolve(__dirname, './install-addon.py')
  cp.execSync(
    `blender --background --python ${addonInstallScript}`,
    function (err, stdout, stderr) {
      if (err) {
        console.error('There was an error installing the addon. Please make sure that your Blender installation is added to your $PATH')
        process.exit(1)
      }
    }
  )
  process.exit(0)
}

// If none of our arguments were passed in we return the filename of the Blender addon runner runner runner runner runner
console.log(
  path.resolve(__dirname, '../run-addon.py')
)
