
const cardContainerElem = document.querySelector('.card-container')

const cardInnerElem = createElement('div')

addChildElement(cardInnerElem, cardInnerElem)


function createElement(elemType){
    return document.createElement(elemType)
}
function addChildElement(parentElem, childElem){
    parentElem.appendChild(childElem)
}