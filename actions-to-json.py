import bpy
import math
# Get all of the keyframes for the current action
def getActionKeyframes(action):
    keyframes = []
    for fcurve in action.fcurves:
        for keyframe in fcurve.keyframe_points:
            x, y = keyframe.co
            # Don't know why yet, but we encounter each keyframes a
            # bunch of times. so need to make sure we only add them once
            if x not in keyframes:
                # convert from float to int and insert into our keyframe list
                keyframes.append((math.ceil(x)))
    return keyframes

# Get all of the bone pose matrices for the current keyframe
# So if there are 10 bones, we'll get 10 matrices representing
# these bones' orientations at this point in time
def getBonesAtKeyframe(frame):
    stringifiedBones = ''
    bpy.context.scene.frame_set(frame)
    for poseBone in bpy.context.selected_pose_bones:
        stringifiedMatrix = stringifyMatrix(poseBone.matrix)
        # Trailing comma until you get to the last bone
        stringifiedBones += '      ' + stringifiedMatrix
        # Add a comma to the end of every bone
        # in the array excluding the last one
        if poseBone != bpy.context.selected_pose_bones[-1]:
            stringifiedBones += ','
        stringifiedBones += '\n'
    return stringifiedBones

# Convert a matrix into string
#   i.e. '[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]'
# Right now we round elements in the matrix to 6 decimal places.
# I just picked a number. We can explore trade-offs
def stringifyMatrix (matrix):
    stringifiedMatrix = '['
    for column in range(0, 4):
        for row in range(0, 4):
            if (column == 3 and row == 3):
                stringifiedMatrix += str(round(matrix[column][row], 6))
            else:
                stringifiedMatrix += str(round(matrix[column][row], 6)) + ', '
    stringifiedMatrix += ']'
    return stringifiedMatrix

# Get the armature that is currently active. We will be parsing it's actions
# TODO: Error message if the active object is not the armature
activeArmature = bpy.context.scene.objects.active
# Get all of the actions
# TODO: If we later support handling multiple armatures we'll need to only use the
# actions that apply to the current armature
actionsList = list(bpy.data.actions)
bpy.ops.object.mode_set(mode = 'POSE')
# Start building our JSON
# The format is
# {
#   someAction: { timeInSeconds: [bone1, bone2, bone3 ...], keyframe2: [bone1, bone2, bone3 ...] },
#   anotherAction: { someTime: [bone1, bone2, bone3 ...], keyframe2: [bone1, bone2, bone3 ...], anotherTime: { ... } },
# }
jsonActionData = '{\n'
for actionInfo in actionsList:
    # Change to the action that we are currently parsing the data of
    activeArmature.animation_data.action = bpy.data.actions.get(actionInfo.name)
    # Get all of the keyframes for the current action. We'll iterate through them
    # to get all of the bone data
    actionKeyframes = getActionKeyframes(activeArmature.animation_data.action)
    # If this action has no keyframes we skip it
    if actionKeyframes == []:
         continue
    # someAction: {
    jsonActionData += '  "' + actionInfo.name + '": { \n'
    # Loop through the keyframes and build the frame data for the action
    # We convert keyframes into times in seconds
    for frame in actionKeyframes:
        # Round the keyframes time in seconds to 6 decimal places.
        # i.e. 10.333333 seconds
        timeOfKeyframe = round(frame /  bpy.context.scene.render.fps, 6)
        # So here, at 24FPS, frame 12 would become `0.5` (seconds)
        jsonActionData += '    "' + str(timeOfKeyframe) + '": [\n'
        # Get all of the bone pose matrices for this frame -> [bone1Matrix, bone2Matrix, ..]
        jsonActionData += getBonesAtKeyframe(frame)
        jsonActionData += '    ],\n'
    # Get rid of the last trailing comma for the keyframe times
    jsonActionData = jsonActionData.rstrip('\r\n').rstrip(',') + '\n'
    jsonActionData += '  },\n'

# Get rid of the last trailing comma for the action names
jsonActionData = jsonActionData.rstrip('\r\n').rstrip(',')
jsonActionData += '\n}'
print(jsonActionData)
# Wrote out data to a file
file = '/var/tmp/foo.json'
with open(file, 'w') as outputFile:
    outputFile.write(jsonActionData)
