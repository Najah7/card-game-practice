
const cardObjectDefinitions = [
    {id: 1, imagePath: '/images/card-KingHearts.png'},
    {id: 2, imagePath: '/images/card-JackClubs.png'},
    {id: 3, imagePath: '/images/card-QueenDiamonds.png'},
    {id: 4, imagePath: '/images/card-AceSpades.png'},
]
const aceId = 4

const cardBackImgPath = '/images/card-back-Blue.png'

const cardContainerElem = document.querySelector('.card-container')

let cards = []

const PlayGameButtonElem = document.getElementById('PlayGame')

const collapsedGridAreaTemplate = '"a a" "a a"'
const cardCollectionCellClass = ".card-pos-a"

const numCards = cardObjectDefinitions.length

let cardPositions = []

let gameInProgress = false
let shufflingInProgress = false
let cardsRevealed = false

const currentGameStatusElem = document.querySelector('.current-status')
const scoreContainerElem = document.querySelector('.header-score-container')
const scoreElem = document.querySelector('.score')
const roundContainerElem = document.querySelector('.header-round-container')
const roundElem = document.querySelector('.round')

const winColor = "green"
const loseColor = "red"
const primaryColor = "black"

let roundNum = 0
let maxRounds = 4
let score = 0

let gameObj = {}

const localStorageGameKey = "HTA"

loadGame()

function gameOver()
{
    updateStatusElement(scoreContainerElem, "none")
    updateStatusElement(roundContainerElem, "none")

    const gameOverMessage = `Game Over! Final Score - <span class = 'badge'>${score}</span>
                             Click 'Play Game' button to play again`

    updateStatusElement(currentGameStatusElem, 'block', primaryColor, gameOverMessage)

    gameInProgress = false
    PlayGameButtonElem.ariaDisabled = false
}

function endRound()
{
    setTimeout(() => {
        if(roundNum == maxRounds)
        {
            gameOver()
            return
        }
        else
        {
            startRound()
        }
    }, 3000)
}

function chooseCard(card)
{
    
    if(canChooseCard())
    {
        evaluateCardChoice(card)
        saveGameObjectToLocalStorage(score, roundNum)
        flipCard(card, false)

        setTimeout(() => {
            flipCards(false)
            updateStatusElement(currentGameStatusElem, "block", primaryColor, "Card positions reveled")

            endRound()

        }, 3000)

        cardsRevealed = true
    }
}

function calculateScoreToAdd(roundNum)
{
    if(roundNum == 1)
    {
        return 100
    }
    else if(roundNum == 2)
    {
        return 50
    }
    else if(roundNum == 3)
    {
        return 25
    }
    else if(roundNum == 4)
    {
        return 10
    }
}

function calculateScore()
{
    const scoreToAdd = calculateScoreToAdd(roundNum)
    score = score + scoreToAdd
}

function updateScore()
{
    calculateScore()
    updateStatusElement(scoreElem, "block", primaryColor, `<span class = 'badge'> ${score}</span>`)
}

function updateStatusElement(elem, display, color, innerHTML)
{
    elem.style.display = display

    if(arguments.length > 2)
    {
        elem.style.color = color
        elem.innerHTML = innerHTML
    }
}

function outputChoiceFeedBack(hit)
{

    if(hit)
    {
        updateStatusElement(currentGameStatusElem, "block", winColor, "Hit!! - Well Done!! :)")
    }else{
        updateStatusElement(currentGameStatusElem, "block", loseColor, "Missed! :(")
    }
}

function evaluateCardChoice(card)
{
    if(card.id == aceId)
    {
        updateScore()
        outputChoiceFeedBack(true)
    }else{
        outputChoiceFeedBack(false)
    }
}

function canChooseCard()
{

    return gameInProgress == true && !shufflingInProgress && !cardsRevealed
}


function loadGame()
{
    createCards()

    cards = document.querySelectorAll('.card')

    cardFlyInEffect()

    PlayGameButtonElem.addEventListener('click', () => startGame())

    updateStatusElement(scoreContainerElem, "none")
    updateStatusElement(roundContainerElem, "none")
}

function CheckForIncompleteGame()
{
    const serializedGameObj = getLocalStorageItemValue(localStorageGameKey)
    if(serializedGameObj)
    {
        gameObj = getObjectFromJSON(serializedGameObj)
        

        if(gameObj.round >= maxRounds)
        {
            removeLocalStorageItem(localStorageGameKey)
        }
        else
        {
            if(confirm("Would you like to continue with your last game?"))
            {
                score = gameObj.score
                roundNum = gameObj.round
            }
        }
    }
}

function startGame()
{
    initializerNewGame()
    startRound()

}
function initializerNewGame()
{
    score = 0
    roundNum = 0

    CheckForIncompleteGame()

    shufflingInProgress = false

    updateStatusElement(scoreContainerElem, "flex")
    updateStatusElement(roundContainerElem, "flex")

    updateStatusElement(scoreElem, "block", primaryColor, `Score <span class='badge'>${score}</span>`)
    updateStatusElement(roundElem, "block", primaryColor, `Round <span class='badge'>${roundNum}</span>`)

}
function startRound()
{
    initializeNewRound()
    collectionCards()
    flipCards(true)
    shuffleCards()
}
function initializeNewRound()
{
    roundNum++
    PlayGameButtonElem.ariaDisabled = true

    gameInProgress = true
    shufflingInProgress = true
    cardsRevealed = false

    updateStatusElement(currentGameStatusElem, "block", primaryColor, "Shuffling..." )

    updateStatusElement(roundElem, "block", primaryColor, `Round <span class='badge'>${roundNum}</span>` )

}
function collectionCards()
{
    transformGridArea(collapsedGridAreaTemplate)
    addCardsToGridAreaCell(cardCollectionCellClass)
}

function transformGridArea(areas)
{
    cardContainerElem.style.gridTemplateAreas = areas
}
function addCardsToGridAreaCell(cellPositionClassName)
{
    const cellPositionElem = document.querySelector(cellPositionClassName)

    cards.forEach((card, index) => {
        addChildElement(cellPositionElem, card)
    })
}

function flipCard(card, flipToBack)
{
    const innerCardElem = card.firstChild

    if(flipToBack && !innerCardElem.classList.contains('filp-it'))
    {
        innerCardElem.classList.add('flip-it')
    }else if(innerCardElem.classList.contains('flip-it'))
    {
        innerCardElem.classList.remove('flip-it')
    }
}

function flipCards(flipToBack)
{
    cards.forEach((card, index) =>{
        setTimeout(() => {
            flipCard(card, flipToBack)
        }, index * 100)
    })
}

function cardFlyInEffect()
{
    const id = setInterval(flyIn, 5)
    let cardCount = 0

    let count = 0

    function flyIn()
    {
        count++
        if(cardCount == numCards)
        {
            clearInterval(id)
            PlayGameButtonElem.style.display = "inline-block"
        }
        if(count == 1 || count == 250 || count == 500 || count == 750)
        {
            cardCount++
            let card = document.getElementById(cardCount)
            card.classList.remove("fly-in")
        }
    }


}

function removeShuffleClasses()
{
    cards.forEach((card) => {
        card.classList.remove("shuffle-left")
        card.classList.remove("shuffle-right")
    })
}

function animateShuffle(shuffleCount)
{
    const random1 = Math.floor(Math.random() * numCards) + 1
    const random2 = Math.floor(Math.random() * numCards) + 1

    let card1 = document.getElementById(random1)
    let card2 = document.getElementById(random2)

    if (shuffleCount % 4 == 0)
    {
        card1.classList.toggle("shuffle-left")
        card1.style.zIndex = 100
    }
    if (shuffleCount % 10 == 0)
    {
        card2.classList.toggle("shuffle-right")
        card2.style.zIndex = 200
    }
}

function shuffleCards()
{
    
    const id = setInterval(shuffle, 12)
    let shuffleCount = 0

    function shuffle()
    {

        randomizeCardPositions()

        animateShuffle(shuffleCount)

        if (shuffleCount == 500)
        {
            clearInterval(id)
            shufflingInProgress = false
            removeShuffleClasses()
            dealCards()
            updateStatusElement(currentGameStatusElem, "block", primaryColor, "Please click the Card that you think is the Ace of spade")
        }
        else{
            shuffleCount++
        }
    }
}

function randomizeCardPositions()
{

    const random1 = Math.floor(Math.random() * numCards) + 1
    const random2 = Math.floor(Math.random() * numCards) + 1

    const tmp = cardPositions[random1 - 1]

    cardPositions[random1 - 1] = cardPositions[random2 -1]
    cardPositions[random2 - 1] = tmp
}

function dealCards()
{

        addCardsToAppropriateCell()
        const areasTemplate = returnGridAreasMappedToCardPos()

        transformGridArea(areasTemplate)
        
}
function returnGridAreasMappedToCardPos()
{

    let firstPart = ""
    let secondPart = ""
    let areas = ""

    cards.forEach((card, index) => {
        if(cardPositions[index] == 1)
        {
            areas = areas + "a "
        }
        else if(cardPositions[index] == 2)
        {
            areas = areas + "b "
        }else if(cardPositions[index] == 3)
        {
            areas = areas + "c "
        }else if(cardPositions[index] == 4)
        {
            areas = areas + "d "
        }

        if(index == 1)
        {
            firstPart = areas.substring(0, areas.length - 1)
            areas = ""
        }
        else if(index == 3)
        {
            secondPart = areas.substring(0, areas.length - 1)
        }
    })
    return `"${firstPart}" "${secondPart}"`
}

function addCardsToAppropriateCell()
{

    cards.forEach((card) => {
        addCardToGridCell(card)
    })
}



function createCards()
{
    cardObjectDefinitions.forEach((cardItem) => {
        createCard(cardItem)
    })
}

function createCard(cardItem)
{
    // create div elements that make up a card
    const cardElem = createElement('div')
    const cardInnerElem = createElement('div')
    const cardFrontElem = createElement('div')
    const cardBackElem = createElement('div')

    // create front and back image elements for a card
    const cardFrontImg = createElement('img')
    const cardBackImg = createElement('img')

    // add class and id to card element
    addClassToElement(cardElem, 'card')
    addClassToElement(cardElem, 'fly-in')
    addIdToElement(cardElem, cardItem.id)

    // add class to inner card element
    addClassToElement(cardInnerElem, 'card-inner')

    // add class to front card element
    addClassToElement(cardFrontElem, 'card-front')

    // add class to back card elemetn
    addClassToElement(cardBackElem, 'card-back')

    // add src attribute and appropriate value to img element - back of card
    addSrcToImageElem(cardBackImg, cardBackImgPath)

    // add src attribute and appropriate value to img element - front of card
    addSrcToImageElem(cardFrontImg, cardItem.imagePath)

    // add class to front image element of front of card
    addClassToElement(cardFrontImg, 'card-img')

    // assign class to back image element of back of card
    addClassToElement(cardBackImg, 'card-img')

    // add front image elemets as child element to front card element
    addChildElement(cardFrontElem, cardFrontImg)

    // add back image element as chid element to back card element
    addChildElement(cardBackElem, cardBackImg)

    // add front card element as child element to inner card element
    addChildElement(cardInnerElem, cardFrontElem)

    // add back card element as child element to inner card element
    addChildElement(cardInnerElem, cardBackElem)

    // add inner card element as Child element to card element
    addChildElement(cardElem, cardInnerElem)

    // add card element as child element to appropriate grid cell
    addCardToGridCell(cardElem)

    initializeCardPositions(cardElem)

    attachClickEventHandlerToCard(cardElem)

}

function attachClickEventHandlerToCard(card)
{
    card.addEventListener('click', () => chooseCard(card) )
}

function initializeCardPositions(card)
{
    cardPositions.push(card.id)
}

function createElement(elemType)
{
    return document.createElement(elemType)
}

function addClassToElement(elem, className)
{
    elem.classList.add(className)
}

function addIdToElement(elem, id)
{
    elem.id = id
}

function addSrcToImageElem(imgElem, src)
{
    imgElem.src = src
}

function addChildElement(parentElem, childElem)
{
    parentElem.appendChild(childElem)
}

function addCardToGridCell(card)
{
    const cardPositionClassName = mapCardIdToGridCell(card)

    const cardPosElem = document.querySelector(cardPositionClassName)

    addChildElement(cardPosElem, card)
}

function mapCardIdToGridCell(card)
{
    
    // switch (parseInt(card.id))
    // {
    //     case 1:
    //         return '.card-pos-a'
    //     case 2:
    //         return '.card-pos-b'
    //     case 3:
    //         return '.card-pos-c'
    //     case 4:
    //         return '.card-pos-d' 
    // }

    if(card.id == 1)
    {
        return '.card-pos-a'
    }
    else if(card.id == 2)
    {
        return '.card-pos-b'
    }
    else if(card.id == 3)
    {
        return '.card-pos-c'
    }
    else if(card.id == 4)
    {
        return '.card-pos-d'
    }
}

// local storage functions

function getSerializedObjectJSON(obj)
{
    return JSON.stringify(obj)
}
function getObjectFromJSON(json)
{
    return JSON.parse(json)
}
function updateLocalStorageItem(key, value)
{
    localStorage.setItem(key, value)
}
function removeLocalStorageItem(key)
{
    localStorage.removeItem(key)
}
function getLocalStorageItemValue(key,)
{
    return localStorage.getItem(key)
}
function updateGameObject(score, round)
{
    gameObj.score = score
    gameObj.round = round
}
function saveGameObjectToLocalStorage(score, round)
{
    updateGameObject(score, round)
    updateLocalStorageItem(localStorageGameKey, getSerializedObjectJSON(gameObj))
}