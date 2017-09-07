blender-actions-to-json [![npm version](https://badge.fury.io/js/blender-actions-to-json.svg)](http://badge.fury.io/js/blender-actions-to-json) [![Build Status](https://travis-ci.org/chinedufn/blender-actions-to-json.svg?branch=master)](https://travis-ci.org/chinedufn/blender-actions-to-json)
===============

> Give a Blender `.blend` file, write the joint data for all actions to a JSON file

![Example Gif](example-gif.gif)

## Initial Background / Motivation

#### Before

I export my Blender models to COLLADA using the native Blender COLLADA exporter before parsing these COLLADA files for my model's data.

Unfortunately this only includes the raw keyframes and no metadata about which keyframes belong to which action,
so I end up needing to manually keep track of which keyframe each action starts on.

#### After

The purpose of this module is to remove that work for me. Now if I want to get the keyframes and joints for the `attack` animation, I can just
reference the JSON action file that this module generates under the key `attack`.
If the number of keyframes for the `attack` action changes, they'll still all be under the `attack` action key in the JSON data so
I will still have access to them without needing to manually specify the new range of keyframes. Just iterate over the `attack` key

This is part of an effort to automate more of my asset pipeline.

## Note

**This script currenly requires that your `bpy.context.active_object` is your armature.**

This means that you need either:

1. Set `bpy.context.active_object = myArmatureObject` in your Python console (manually or via a script)
2. OR manually right click on the armature while in object mode

If you're looking to use this script as part of an automated pipeline, `#2` is not an option and you will need to do #1.

You can chain blender scripts, so you can run `blender my-model.blend --background --python my-script-that-selects-armature --python blender-actions-to-json.py -- ./outputfile.json`

If any of this is confusing please open an issue and I'll try to give a better explanation based on your question(s)!

## To Install

There is currently no add-on for this script and you must run it via Blender Python console, or the Blender CLI.

So you'll have to download the script:

```sh
curl -OL https://github.com/chinedufn/blender-iks-to-fks/master/blender-actions-to-json.py > blender-actions-to-json.py
```

## To test

In order to run the tests you'll need to have `blender` in your $PATH so that we can spawn a headless blender process from Node.js.

If Blender isn't already in your $PATH, on mac you can try `export PATH="$PATH:/Applications/blender.app/Contents/MacOS"` in your terminal

```sh
npm run test
```

## Usage

If your Blender file has your `armature` as the `bpy.context.active_object` (aka it was the last object you right clicked in Object mode) everything will work just fine.
If not, see the `Note` section above for how to handle this.

`blender my-model.blend --background --python blender-iks-to-fks.py -- ./my-model-actions.json`

The structure will look something like this:

```json
{
  "some-action": {
    "0.041667": [
      [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
      [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
    ],
    "0.833333": [
      [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
      [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]
    ]
  },
    "another-action": {
      "0": [
        [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
      ]
    }
}
```

The file has all of your actions. Each action has all of the keyframe times for that action.
Each keyframe time has the pose matrices for each joint in your armature.

The ordering of the joints is the same as `bpy.context.selected_pose_bones`. Whatever model exporter
you use probably uses this same order.

For example, COLLADA export files will have your joints in the same order that these actions are, so you
can just match them up.

If any of this is confusing please open an issue!

## TODO:

- Maybe support a `-p, --precision` flag to specify the number of decimal places that pose matrices are rounded to. Right now it's set to 6

## See Also

- [blender-iks-to-fks](https://github.com/chinedufn/blender-iks-to-fks)

## License

MIT
