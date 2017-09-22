var cp = require('child_process')
var fs = require('fs')
var path = require('path')

var test = require('tape')
var runActionScript = path.resolve(__dirname, '../run-addon.py')

var glMat4 = require('gl-mat4')

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
    `blender ${testBlendFile} --background --python ${runActionScript} -- ${outFilePath}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      fs.readFile(path.resolve(__dirname, outFilePath), function (err, actionFile) {
        if (err) { throw err }
        actionFile = JSON.parse(actionFile)

        // Delete our temporary JSON file that holds our test output armature action data
        fs.unlink(path.resolve(__dirname, outFilePath), function (err) {
          if (err) { throw err }
          t.deepEqual(actionFile.actions, expectedJSON, 'JSON was properly written to file')
        })
      })
    }
  )
})

// Our test file has only one of the pose bones selected. This test verifies
// that we auto select all other pose bones
test('Uses all of the pose bones, not just the ones that were selected', function (t) {
  t.plan(1)

  var testBlendFile = path.resolve(__dirname, './cube-two-joint-one-unselected.blend')
  var outFilePath = path.resolve(__dirname, './cube-two-joint-one-unselected_TMP_TEST_OUTPUT.json')

  // Spawn an instance of Blender, write the test output file, and ensure that it matches our
  // expected output
  cp.exec(
    `blender ${testBlendFile} --background --python ${runActionScript} -- ${outFilePath}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      fs.readFile(path.resolve(__dirname, outFilePath), function (err, actionFile) {
        if (err) { throw err }
        actionFile = JSON.parse(actionFile)

        // Delete our temporary JSON file that holds our test output armature action data
        fs.unlink(path.resolve(__dirname, outFilePath), function (err) {
          if (err) { throw err }
          t.equal(actionFile.actions['Action']['0.041667'].length, 2, 'All joints were exported')
        })
      })
    }
  )
})

// This test ensures that if the armature is not the active object we automatically select it.
// This assumes that you want us to pick an armature, which will be the case if your file only
// has one.
// TODO: Potentially support files that have multiple armatures by iterating over them
//  I'm waiting until I run into this use case before solving for it
test('Automatically selects an armature if no armature is active object', function (t) {
  t.plan(1)

  var testBlendFile = path.resolve(__dirname, './cube-nothing-selected.blend')
  var outFilePath = path.resolve(__dirname, './cube-nothing-selected_TMP_TEST_OUTPUT.json')

  // Spawn an instance of Blender, write the test output file, and ensure that it matches our
  // expected output
  cp.exec(
    `blender ${testBlendFile} --background --python ${runActionScript} -- ${outFilePath}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      fs.readFile(path.resolve(__dirname, outFilePath), function (err, actionFile) {
        if (err) { throw err }
        actionFile = JSON.parse(actionFile)

        // Delete our temporary JSON file that holds our test output armature action data
        fs.unlink(path.resolve(__dirname, outFilePath), function (err) {
          if (err) { throw err }
          t.equal(actionFile.actions['ArmatureAction']['0.041667'].length, 1, 'Automatically selected an armature if none was selected')
        })
      })
    }
  )
})

// Uses filepath provided in the addon's arguments by default
test('Uses filepath addon argument', function (t) {
  t.plan(1)

  var testBlendFile = path.resolve(__dirname, './cube-with-one-joint.blend')
  var outFilePath = path.resolve(__dirname, './filepath-cube-with-one-joint_TMP_TEST_OUTPUT.json')
  var runWithProvidedFile = path.resolve(__dirname, './run-with-filename-argument.py')

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
    `blender ${testBlendFile} --background --python ${runWithProvidedFile} -- /var/tmp/dont-use-this.json ${outFilePath}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      fs.readFile(path.resolve(__dirname, outFilePath), function (err, actionFile) {
        if (err) { throw err }
        actionFile = JSON.parse(actionFile)

        // Delete our temporary JSON file that holds our test output armature action data
        fs.unlink(path.resolve(__dirname, outFilePath), function (err) {
          if (err) { throw err }
          t.deepEqual(actionFile.actions, expectedJSON, 'JSON was properly written to file')
        })
      })
    }
  )
})

// Test that we properly export our inverse bind pose matrices
//
// NOTE: We originally exported bind poses, so we simply inverted the matrices in our tests
// when we switched to exporting inverse bind matrices. We switched because inverse bind matrices
// are more commonly used
test('Writing the actions and position indices of a cube with one bone to a JSON file', function (t) {
  t.plan(2)

  var testBlendFile = path.resolve(__dirname, './cube-with-one-joint.blend')
  var outFilePath = path.resolve(__dirname, './cube-with-one-joint-bind-matrices_TMP_TEST_OUTPUT.json')

  var expectedBindPoses = [
    glMat4.invert([], [ 1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1 ])
  ]
  var expectedNameIndices = {
    Bone: 0
  }

  // Spawn an instance of Blender, write the test output file, and ensure that it matches our
  // expected output
  cp.exec(
    `blender ${testBlendFile} --background --python ${runActionScript} -- ${outFilePath}`,
    function (err, stdout, stderr) {
      if (err) { throw err }

      fs.readFile(path.resolve(__dirname, outFilePath), function (err, actionFile) {
        if (err) { throw err }
        actionFile = JSON.parse(actionFile)

        // Delete our temporary JSON file that holds our test output armature action data
        fs.unlink(path.resolve(__dirname, outFilePath), function (err) {
          if (err) { throw err }
          t.deepEqual(actionFile.inverseBindPoses.map(roundArray), expectedBindPoses, 'Bind poses were written to the output file')
          t.deepEqual(actionFile.jointNameIndices, expectedNameIndices, 'Joint indices were written to the output file')
        })
      })
    }
  )
})

/**
 * Round the values in an array to 6 decimal places
 */
function roundArray (array) {
  return array.map(function (val) {
    return parseFloat(val.toFixed(6))
  })
}
