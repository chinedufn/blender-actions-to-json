import bpy
import os
import sys

dir = os.path.dirname(__file__)
addonFilePath = dir + '/../actions-to-json.py'

bpy.ops.wm.addon_install(filepath=addonFilePath)
bpy.ops.wm.addon_enable(module='actions-to-json')

argv = sys.argv
# Get all args after `--`
argv = argv[argv.index('--') + 2:]
outputFilePath = argv[0]

bpy.ops.import_export.actions2json(filepath=outputFilePath)
