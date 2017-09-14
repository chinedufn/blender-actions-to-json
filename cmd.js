#!/usr/bin/env node
var path = require('path')
var pythonScriptFilePath = path.resolve(__dirname, './run-addon.py')
// Write the filename of the python script so stdout so that it can be used in a bash command that invokes blender
// i.e.
//  blender /path/to/blender/file.blend --python `actions-to-json` -- /path/to/my/output/file.json
//
console.log(pythonScriptFilePath)
