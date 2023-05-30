
let players = []

let mainContainer = document.getElementById("main-container")

window.onload = function () {
    // 先进行登录验证, 输入正确的密码才能进入页面操作, 因为这个页面需要部署到公网
    login()
    // 初始化玩家信息
    flushPlayers()
}

function login() {
    while (true) {
        let pw = prompt('请输入管理员密码')
        if (pw === 'F**k_runasap') break;
    }
}

// 把 enabled = true 的放在前面
const sortEnabled = (e1, e2) => e2['enabled'] - e1['enabled']

// 刷新玩家信息
function flushPlayers() {
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: API_GET_ALL_PLAYERS,
        success: function (data) {
            players = [] // 清空
            // 解析玩家信息
            $.each(data, function (i, e) {
                let player = {
                    'id' : e['id'],
                    'name' : e['name'],
                    'enabled' : e['enabled']
                }
                players.push(player)
            })
            // 展示玩家信息
            renderPlayers()
        }
    });
}
// 渲染玩家信息
function renderPlayers() {
    players.sort(sortEnabled)
    let playersContainer = document.getElementById('players')
    playersContainer.innerHTML = '' // 先删除内部全部子元素
    for (let i = 0; i < players.length; i++) {
        let player = players[i]
        let element = document.createElement('div')
        element.setAttribute('playerId', player['id'])
        element.setAttribute('playerName', player['name'])
        element.setAttribute('playerEnabled', player['enabled'])
        element.innerText = player['name']
        element.style['border'] = 'dashed 2px darkgray'
        element.style['padding'] = '2px 4px'
        element.style['margin'] = '2px 5px'
        // 如果该玩家未启用, 则将其字体置为灰色
        if (!player['enabled']) {
            element.style['color'] = 'lightgray'
        }
        // 添加到玩家展示区
        playersContainer.appendChild(element)
    }
    // 渲染英雄选择区域
    renderLegendSelectPart()
}


const ls = window.localStorage

ls.clear()

//TODO 调试时加上, 调试完成后要去掉， 因为数据需要持久化保存, 保存到浏览器

const saveToLocalStorage = (k, v) => {
    try {
        if (!k || !v) {
            console.log('key or value is empty')
            return
        }
        ls.setItem(k, v)
        console.log('saveToLocalStorage success')
    } catch (e) {
        console.log('saveToLocalStorage error', e)
    }
}

const getFromLocalStorage = k => {
    try {
        let v = ls.getItem(k)
        if (!v) return
        return v
    } catch (e) {
        console.log('getFromLocalStorage error', e)
    }
}

const removeFromLocalStorage = k => {
    try {
        let v = ls.getItem(k)
        if (!v) {
            console.log('key not exist')
            return
        }
        ls.removeItem(k)
    } catch (e) {
        console.log('removeFromLocalStorage error', e)
    }
}

function getTimestamp() {
    return new Date().getTime()
}

// 渲染英雄选择区域
function renderLegendSelectPart() {
    let mainContainer = document.getElementById("main-container")
    mainContainer.innerHTML = ''
    for (let i = 0; i < players.length; i++) {
        let player = players[i]
        if (!player['enabled']) continue
        renderSingleLegendSelectPart(player)
    }
}

function renderSingleLegendSelectPart(player) {

    let playerPane = document.createElement('div')

    let playerId = player['id']
    let playerName = player['name']

    // 注意这个class的名字一定要叫 player , 和CSS文件中保持一致
    playerPane.setAttribute('class', 'player')
    playerPane.setAttribute('playerId', playerId)
    playerPane.setAttribute('playerName', playerName)

    let playerNameLabel = document.createElement('label')
    playerNameLabel.setAttribute('align', 'center')
    playerNameLabel.innerText = playerName
    playerPane.appendChild(playerNameLabel)
    let ul = document.createElement('ul')
    let posArrayPlus = [POS, ...posArray]
    let posArrayZhPlus = [POS_zh, ...posArray_zh]
    for (let i = 0; i < posArrayPlus.length; i++) {
        let className = posArrayPlus[i]
        let li = document.createElement('li')
        li.setAttribute('class', className)
        li.innerText = posArrayZhPlus[i] + ' : '
        let legendNameElement = document.createElement('p')
        legendNameElement.style['display'] = 'inline'
        legendNameElement.setAttribute('class', 'legendName')
        legendNameElement.innerText = '?'
        li.appendChild(legendNameElement)
        ul.appendChild(li)
    }

    playerPane.appendChild(ul)

    let reBtn = document.createElement('div')
    reBtn.style['justifyContent'] = 'center'
    reBtn.setAttribute('class', 're')
    let btn = document.createElement('button')
    btn.innerText = '单独重摇'
    // 添加点击事件
    reBtn.appendChild(btn)
    reBtn.setAttribute('onclick', 'singleRoll(this)')
    playerPane.appendChild(reBtn)

    let score = document.createElement('input')
    score.setAttribute('type', 'number')
    score.setAttribute('class', 'score')
    score.setAttribute('placeholder', '请输入评分')
    score.style['margin'] = '5px 0'
    score.style['textAlign'] = 'center'

    playerPane.appendChild(score)

    mainContainer.appendChild(playerPane)
}

function addPlayer() {
    let playerName = prompt("输入玩家名称")
    if (!playerName) {
        alert('玩家名称不能为空')
        return
    }
    $.ajax({
        type: 'post',
        url: API_ADD_PLAYER,
        data: {
            // 提交表单数据
            'playerName' : playerName
        },
        success: function (data) {
            if ('success' !== data) alert('添加玩家失败')
            flushPlayers()
        }
    });
}

function removePlayer() {
    let playerName = prompt("输入玩家名称")
    if (!playerName) {
        alert('玩家名称不能为空')
        return
    }
    $.ajax({
        type: 'post',
        url: API_REMOVE_PLAYER,
        data: {
            // 提交表单数据
            'playerName' : playerName
        },
        success: function (data) {
            if ('success' !== data) alert('移除玩家失败')
            flushPlayers()
        }
    });
}

function rollIt() {
    // 为所有玩家生成一组随机英雄和位置

    let playerElements = document.querySelectorAll('#main-container .player')

    // 重置位置
    positionReset()

    for (let i = 0; i < playerElements.length; i++) {
        let e = playerElements[i]
        //为该名玩家生成一个位置
        let pos = takeOnePosition()
        // 生成一组英雄
        let legends = generateLegends()

        // 组合起来
        let comb = [pos, ...legends]

        // 渲染
        let items = e.querySelectorAll('ul li')

        for (let j = 0; j < items.length; j++) {
            let li = items[j]
            li.setAttribute('style', '')// 清除样式
            let className = li.getAttribute('class')
            if (className === pos) {
                // 将对应位置, 直接框起来
                li.setAttribute('style', 'background: aqua')
            }
            let p = li.querySelector('p')
            p.innerText = comb[j]
        }
    }
}

function singleRoll(btn) {
    // 由于英雄被禁用等原因, 为某个玩家单独摇一组英雄
    let playerElement = btn.parentNode
    let legends = generateLegends()
    let items = playerElement.querySelectorAll('ul li')
    let pos = items[0].querySelector('p').innerText
    for (let i = 1; i < items.length; i++) {
        let li = items[i]
        li.setAttribute('style', '')// 清除样式
        let className = li.getAttribute('class')
        if (className === pos) {
            // 将对应位置, 直接框起来
            li.setAttribute('style', 'background: aqua')
        }
        let p = li.querySelector('p')
        p.innerText = legends[i - 1]
    }
}


let isLock = false
function lockOrUnlock(e) {
    let rollItBtn = document.getElementById('rollIt')
    let singleBtns = mainContainer.querySelectorAll('.re button')
    if (!isLock) {
        disable(rollItBtn)
        singleBtns.forEach(e => disable(e))
        e.innerText = '解除锁定'
    } else {
        enable(rollItBtn)
        singleBtns.forEach(e => enable(e))
        e.innerText = '锁定选择'
    }
    isLock = !isLock
}

function disable(e) {
    e.setAttribute('disabled', '')
    e.setAttribute('style', 'color: grey')
}

function enable(e) {
    e.removeAttribute('disabled')
    e.setAttribute('style', '')
}

function saveGameRecord() {
    // success or fail
    let gameResult = $("input[name='gameResult']:checked").val();

    // 奖励系数
    let bonusBase = $("input[name='bonus']").val()

    // 先计算本轮的结算情况
    // 获取所有玩家
    let players = $("#main-container .player")
    let playerAndScores = []
    for (let i = 0; i < players.length; i++) {
        let e = players[i]
        let pId = e.getAttribute('playerId')
        let pName = e.getAttribute('playerName')
        let score = e.querySelector('.score').value

        let obj = {
            'id' : pId,
            'name' : pName,
            'score' : score
        }
        playerAndScores.push(obj)
    }

    // 按照 score 从小到大排序
    playerAndScores.sort(function (a, b) {
        return a['score'] - b['score']
    })


    // 生成交易明细
    let txArr = generateTxResult(playerAndScores, bonusBase)

    // 交易明细在页面中进行展示
    let txContainer = document.getElementById('currentTxResult')

    txContainer.innerText = stringifyTxResult(txArr)

    let playerDetails = assemblePlayerDetails()

    // 调用后端接口保存该次对局的数据

    $.ajax({
        type: 'post',
        url: API_SAVE_GAME_RECORD,
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            'players' : playerDetails,
            'result' : gameResult,
            'transactionList' : txArr
        }),
        success: function (data) {
            if ('success' !== data) alert('保存对局数据失败')
            else alert('保存对局数据成功')
        }
    });
}

function assemblePlayerDetails() {
    let res = []
    let playerElements = $("#main-container .player")

    for (let i = 0; i < playerElements.length; i++) {
        let e = playerElements[i]
        let playerName = e.getAttribute('playerName')
        let pos = e.querySelector('ul .POS .legendName').innerText
        let allPosElements = e.querySelectorAll('ul li')
        let legendName = ''
        for (let j = 0; j < allPosElements.length; j++) {
            let ee = allPosElements[j]
            let pos2 = ee.getAttribute('class')
            if (pos2 === pos) {
                legendName = ee.querySelector('.legendName').innerText
                break
            }
        }
        let score = e.querySelector('.score').value

        res.push({
            'playerName' : playerName,
            'position' : pos,
            'legendName' : legendName,
            'score' : score
        })
    }
    return res
}


function stringifyTxResult(txArr) {
    let ret = ''
    for (let i = 0; i < txArr.length; i++) {
        let tx = txArr[i]
        ret += tx.from.name + ' 向 ' + tx.to.name + ' 转 ' + tx.amount + ' 元 \n'
    }
    return ret
}

// 生成交易明细
function generateTxResult(arr, bonusBase) {
    let txArray = []
    for (let i = 0; i < arr.length; i++) {
        let o = arr[i]
        let fromId = o['id'], fromName = o['name']
        let fromScore = o['score']
        for (let j = i + 1; j < arr.length; j++) {
            let to = arr[j]
            let toId = to['id'], toName = to['name'], toScore = to['score']

            let scoreGap = (toScore - fromScore).toFixed(1)
            let amount = ((toScore - fromScore) * bonusBase).toFixed(1)
            txArray.push({
                'from' : {
                    'id' : fromId,
                    'name' : fromName
                },
                'to' : {
                    'id' : toId,
                    'name' : toName
                },
                'scoreGap' : scoreGap,
                'bonusBase' : bonusBase,
                'amount' :  amount
            })
        }
    }
    // 返回交易数组
    return txArray
}

// 查询并展示历史对局
function queryGameRecordHistory() {
    $.ajax({
        type: 'get',
        url: API_GET_GAME_RECORD,
        dataType: 'json',
        success: function (data) {
            renderGameRecordHistory(data)
        }
    });
}

function renderGameRecordHistory(data) {

    let div = document.getElementById('historyRecord')
    div.innerHTML = '' // 清空旧有的

    let headers = ['对局id', '对局时间', '胜负', '玩家详情']

    let table = document.createElement('table')
    let tr = document.createElement('tr')

    for (let i = 0; i < headers.length; i++) {
        let th = document.createElement('th')
        th.innerText = headers[i]
        tr.appendChild(th)
    }

    // 第一行表头构建完毕
    table.appendChild(tr)

    // 构建剩余行
    for (let i = 0; i < data.length; i++) {
        let item = data[i]
        let recordId = item['id']
        let recordTime = item['time']
        let recordResult = item['gameResult']
        let playersDetail = stringifyPlayerDetail(item['detail'])

        let arr = [recordId, recordTime, recordResult, playersDetail]

        let tr = document.createElement('tr')
        for (let j = 0; j < arr.length; j++) {
            let td = document.createElement('td')
            td.innerText = arr[j]
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }


    // 把这个table放在对应的 div 块中

    div.appendChild(table)
}

function stringifyPlayerDetail(detailList) {
    let ret = ''
    for (let i = 0; i < detailList.length; i++) {
        let item = detailList[i]
        ret += item['player']['name'] + ', ' + item['position'] + ', ' + item['legendName'] + ', ' + item['score']
        if (i < detailList.length - 1) ret += ' | '
    }
    return ret
}

function queryPlayersIncome() {
    $.ajax({
        type: 'get',
        url: API_GET_TRANSACTIONS,
        dataType: 'json',
        success: function (data) {
            renderPlayersTransactions(data)
        }
    });
}

function renderPlayersTransactions(data) {

    let div = document.getElementById('playersIncome')
    div.innerHTML = '' // 清空旧有的

    let headers = ['玩家名称', '总收益']
    let table = document.createElement('table')
    let tr = document.createElement('tr')

    for (let i = 0; i < headers.length; i++) {
        let th = document.createElement('th')
        th.innerText = headers[i]
        tr.appendChild(th)
    }

    table.appendChild(tr)

    // 玩家名称 -> 收益
    let nameToIncomeMap = new Map()

    // 处理所有交易记录
    for (let i = 0; i < data.length; i++) {
        let tx = data[i]
        let from = tx['from']['name']
        let to = tx['to']['name']
        let amount = tx['amount']

        // 为了解决double 精度的显示问题, 先用 toFixed 保留1位小数, 转成字符串, 再转回数字
        let fromOldAmount = nameToIncomeMap.get(from) ? nameToIncomeMap.get(from) : '0'
        fromOldAmount = Number(fromOldAmount)
        nameToIncomeMap.set(from, (fromOldAmount - amount).toFixed(1))

        let toOldAmount = nameToIncomeMap.get(to) ? nameToIncomeMap.get(to) : '0'
        toOldAmount = Number(toOldAmount)
        nameToIncomeMap.set(to, (toOldAmount + amount).toFixed(1))
    }

    let arr = []
    nameToIncomeMap.forEach(function (v, k) {
        arr.push([k, v])
    })

    for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        let tr = document.createElement('tr')
        for (let j = 0; j < item.length; j++) {
            let td = document.createElement('td')
            td.innerText = item[j]
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }

    div.appendChild(table)

}