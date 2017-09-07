var cp = require('child_process')
var fs = require('fs')
var path = require('path')

var test = require('tape')
var pythonActionToJSONScript = path.resolve(__dirname, '../actions-to-json.py')

// Our test file already have the armature selected as the active object
// The script currently requires that the active object be the armature that
// you want to export
// One technique is to run a script before running this that selects the armature
// that you want to get data for
test('Writing the actions of a cube with one bone to a JSON file', function (t) {
  t.plan(1)

  var testBlendFile = path.resolve(__dirname, './cube-with-one-joint.blend')
  var outFilePath = path.resolve(__dirname, './cube-with-one-joint_TMP_TEST_OUTPUT.json')

  var expectedJSON = {
    // Action anme
    'Action': {
      // Time
      '0.041667': [
        // All joint matrices
        [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]
      ],
      '0.833333': [
        [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]
      ]
    }
  }

  // Spawn an instance of Blender, write the test output file, and ensure that it matches our
  // expected output
  cp.exec(
    `blender ${testBlendFile} --background --python ${pythonActionToJSONScript} -- ${outFilePath}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      fs.readFile(path.resolve(__dirname, outFilePath), function (err, actionFile) {
        if (err) { throw err }
        actionFile = JSON.parse(actionFile)

        // Delete our temporary JSON file that holds our test output armature action data
        fs.unlink(path.resolve(__dirname, outFilePath), function (err) {
          if (err) { throw err }
          t.deepEqual(actionFile, expectedJSON, 'JSON was properly written to file')
        })
      })
    }
  )
})
