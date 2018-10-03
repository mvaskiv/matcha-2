import React, { Component } from 'react';

export const TagBubble = (props) => {
    if (props.text !== '') {
        return (
            <div className='tag-bubble'>
                <p>{props.text}</p>
                <i className="fas fa-times-circle" onClick={() => props.delete(props.text)}></i>
            </div>
        );
    } else {
        return null;
    }
}

export const TagBubbleConst = (props) => {
    if (props.text !== '') {
        return (
            <div className='tag-const'>
                <p>{props.text}</p>
            </div>
        );
    } else {
        return null;
    }
}

export const PictureThumb = (props) => {
    if (props.add) {
        return (
            <img alt='' src={require('../img/plus.jpg')} onClick={props.add} />
        )  
    } else {
        return (
            <img alt='' src={props.pic} onClick={() => props.open(props.all, props.n, props.my ? 1 : 0)} />
        )
    }
}
