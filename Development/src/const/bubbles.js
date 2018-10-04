import React from 'react';

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

export const PersonBubbleMap = (props) => {
    if (!props.bl.includes(props.info.id) && props.x && props.y) {
        return (
            <div className='bubble-sm'
                style={{position: 'absolute', top: props.x, left: props.y}}>
                <img className='bubble-img-sm'
                    src={props.info.avatar ? props.info.avatar : require('../img/avatar.png')}
                    alt='' onClick={() => props.preview(props.info.id)}
                    style={{width: props.me ? 120 + 'px' : 70 + 'px'}}/>
                {/* {!props.me && <p>{ Math.round(props.info.distance) } km away</p>} */}
            </div>
        )
    } else {
        return null;
    }
}

export const PersonBubble = (props) => {
    if (!props.bl.includes(props.info.id)) {
        return (
            <div className='bubble'>
                <img className='bubble-img' src={props.info.avatar ? props.info.avatar : require('../img/avatar.png')} alt='' onClick={() => props.preview(props.info.id)} />
                <h3>{props.info.first_name}</h3>
                <p>{ Math.round(props.info.distance) } km away</p>
            </div>
        )
    } else {
        return null;
    }
}

export const Notification = (props) => {
    return (
        <div className='notification'>
            <img src={ props.data.sender_avatar } alt='' />
            <h2>{ props.data.sender_name }</h2>
            <p>{props.data.id && 'Message: '}{ props.data.body }</p>
            <h3 onClick={ () => props.open({id: props.data.id, mate_id: props.data.myid, name: props.data.sender_name, avatar: props.data.sender_avatar}) }>open</h3>
            {props.n === 0 && <p className='clear-notifications' onClick={props.clear}>clear</p>}
        </div>
    );
}

export const SecretThing = (props) => {
    return (
        <img src={require('../img/willy.png')} alt='' className='congrats' />
    )
}
