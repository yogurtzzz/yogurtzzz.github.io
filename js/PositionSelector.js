let posArrayCopy

function positionReset() {
    posArrayCopy = [...posArray]
}

// 选择一个位置
function takeOnePosition() {
    let size = posArrayCopy.length
    if (size < 1) {
        alert('位置已选完')
        return
    }
    let randomIdx = Math.floor(Math.random() * size)
    let retPos = posArrayCopy[randomIdx]
    posArrayCopy.splice(randomIdx, 1)
    return retPos
}