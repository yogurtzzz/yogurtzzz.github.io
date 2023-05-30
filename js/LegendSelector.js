// 为某一名玩家随机生成一组英雄
function generateLegends() {
    let res = []
    for (let i = 0; i < posArray.length; i++) {
        let pos = posArray[i]
        let hero = heroMaps.get(pos)
        let heroSize = hero.length
        let idx = Math.floor(Math.random() * heroSize)
        // 选出来的英雄
        res[i] = hero[idx]
    }
    return res
}