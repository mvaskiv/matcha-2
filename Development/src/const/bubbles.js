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

