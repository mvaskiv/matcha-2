import React, { Component } from 'react';
import API from '../backyard/api';

export default class Chats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: false,
            me: false,
            chat: false,
            chatOpen: false,
            dataSource: [],
            Matches: [],
        }
        this._bootstrapAsync();
    }

    _bootstrapAsync = async () => {
        let data = await JSON.parse(localStorage.getItem('user_data'));
        this.setState({id: data.id});
        this.setState({me: data});
        API('chats', {id: data.id}).then((res) => {
            if (res.data) {
                this.setState({dataSource: res.data});
            }
        }).then(() => {
            API('matches', {id: data.id}).then((res) => {
                if (res.data) {
                    this.setState({Matches: res.data});
                }
            }).then(() => this.setState({updated: true}))
        })
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.n_open) {
                this._openChat(this.props.n_open);
            }
        }, 100);
    }

    componentWillUnmount() {
        this.props.clear();
        this.props.sockets();
    }

    _setChatId = (chat) => {
        let chat_to_be = chat;
        let data = {
            myid: this.state.id,
            mate: chat.mate_id,
            mate_avatar: chat.avatar,
            my_avatar: this.state.me.avatar,
            my_name: this.state.me.first_name,
            mate_firstname: chat.name,
        }
        API('chat_init', data).then((res) => {
            chat_to_be.id = res.id
            chat_to_be.chat = res.id;
        }).then(() => {
            setTimeout(() => this.setState({chat: chat_to_be}));
            setTimeout(() => this.setState({chatOpen: true}), 150);
        })
    }

    _openChat = (chat) => {
        if (chat.id === -42) {
            this._setChatId(chat); 
        }
        else if (chat === 0) {
            this.setState({chatOpen: false});
            setTimeout(() => this.setState({chat: false}), 300);
        } else {
            this.setState({chat: chat});
            this.setState({chatOpen: true});
        }
    }

    render() {
        let Chats = null;
        let Matches = null;

        if (this.state.dataSource) {
            Chats = this.state.dataSource.map((msg, i) => {
                return <ChatPreview data={ msg } id={ this.state.id } key={ i } open={ this._openChat } />
            })
        }
        if (this.state.Matches) {
            Matches = this.state.Matches.map((match, i) => {
                return <MatchesList data={ match } id={ this.state.id } key={ i } open={ this._openChat } />
            })
        }

        return (
            <div>
                <div id="user-panel" style={{height: this.props.locked ? 'calc(100vh - 190px)' : 550 + 'px', overflowY: !this.state.chat ? 'scroll' : 'hidden'}}>
                    <div className='profile-info'>
                        <div className='profile-info-full top chat'>
                            {!this.state.chatOpen ? <h2>Chats</h2> : <div className='kostyl'><p onClick={() => this._openChat(0)} className='chat-back'>return</p><h2 style={{textAlign: 'right'}}>{ this.state.chat.name }</h2></div>}
                        </div>
                        <div className='chat-scroll' style={{height: this.props.locked ? 'calc(100vh - 260px)' : 480 + 'px'}}>
                            <div className='profile-info-full chat' style={{left: this.state.chatOpen ? -33 + '%' : 17.5 + 'px'}}>
                                {this.state.Matches[0] && <div className='matches-preview'>
                                    { Matches }
                                </div> }
                                <div className="chats-preview">
                                    { Chats }
                                </div>
                            </div>
                            <div className='chat-body' style={{height: this.props.locked ? 'calc(100vh - 275px)' : 465 + 'px', left: this.state.chatOpen ? 0 + '%' : 110 + '%'}}>
                                {this.state.chat && <ChatScreen locked={ this.props.locked } chat={ this.state.chat } myid={ this.state.id } conn={this.props.conn} me={ this.state.me } refresh={this._bootstrapAsync} sockets={this.props.sockets} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class ChatScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            body: '',
            me: false, 
            audio: true,
            typing: false,
            newMessage: false,
            scrollbottom: false,
            n: 0,
        }
        this._bootstrapAsync();
        this.url = require("../sound/light.mp3");
        this.audio = new Audio(this.url);
        this.typingTime = null;
        this.props.conn.onmessage = (e) => {
            let data = JSON.parse(e.data);
            if (data.typing && data.chat === this.props.chat.id) {
                if (!this.state.typing) {
                    this.setState({typing: true});
                    clearTimeout(this.typingTime);
                    // if (this.messages && this.messages.firstChild) {this.messages.firstChild.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});}         
                    this.typingTime = setTimeout(() => this.setState({typing: false}), 2500);
                }
            } else if (data.chat === 1) {
                this.setState({typing: false});
                this.state.dataSource.unshift({
                    chat: data.id,
                    body: data.body,
                    sender: data.myid,
                    recipient: data.mate,
                    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
                });
                this.setState({updated: true});
                if (this.messages && this.messages.lastChild) {
                    // this.messages.scrollTo(0, 0);
                    if (this.messages && this.messages.scrollHeight - this.messages.scrollTop > 500) {
                        this.setState({newMessage: true});
                    } else {
                        this._scrollBottom();
                    }
                }             
                if (this.state.audio) { this.audio.play() }
            }
        }
    }

    _scrollBottom = () => {
        this.setState({
            newMessage: false,
            scrollbottom: false,            
        });
        // this.messages.firstChild.scrollIntoView({behavior: "instant", block: "end", inline: "nearest"});
        this.messages.scrollTop += this.messages.scrollHeight;
    }

    async componentDidUpdate() {
        if (!this.state.dataSource && this.props.chat) {
            this._bootstrapAsync();
        }
        if (!this.state.me) {
            let data = await JSON.parse(localStorage.getItem('user_data'));
            this.setState({me: data});
        }
    }

    componentDidMount() {
        if (this.messages) {
            this.messages.addEventListener('scroll', this._scrollListener);
        }
    }

    componentWillUnmount() {
        this.props.conn.send(this.props.myid + ' in app');
        window.removeEventListener('scroll', this._scrollListener, false);        
        this.props.refresh();
        this.props.sockets();
    }

    _bootstrapAsync = async () => {
        let chat = await this.props.chat;
        chat.n = this.state.n;
        if (chat) {
            API('chatid', chat).then((res) => {
                if (res.data) {
                    this.setState({dataSource: res.data})
                }
            }).then(() => {
                this.setState({n: this.state.n + 20});
                this.setState({updated: false});
                this.props.conn.send(this.props.myid + ' in chat');
                setTimeout(() => this.setState({scrollEnabled: true}), 300);
            });
        }
        
    }

    _scrollListener = () => {
        if (this.state.scrollbottom && this.messages.scrollHeight - this.messages.scrollTop < 700) {
            this.setState({scrollbottom: false})
        } else if (this.messages && this.messages.scrollHeight - this.messages.scrollTop > 700) {
            this.setState({scrollbottom: true})
        }
        if (this.state.scrollEnabled && this.messages.scrollTop <= 100) {
        // if (this.messages.scrollTop + this.messages.clientHeight >= this.messages.scrollHeight) {
            this._onScroll();
        }
    }

    _onScroll = async () => {
        this.setState({scrollEnabled: false});
        let chat = await this.props.chat;
        chat.n = this.state.n;
        API('chatid', chat).then((res) => {
            if (res.data) {
                res.data.map((msg, i) => {
                    this.state.dataSource.push(msg);
                    return true;
                })
            }
        }).then(() => {
            this.setState({updated: true});
            this.setState({n: this.state.n + 20});
            setTimeout(() => this.setState({scrollEnabled: true}), 100);
            
        });
    }

    _update = async () => {
        let update = await this.props.chat;
        if (this.state.dataSource[0]) {
            update.timestamp = this.state.dataSource[this.state.dataSource.length - 1].timestamp;
        } else {
            update.timestamp = 0;
        }
        API('chat_update', update).then((res) => {
            if (res.data) {
                res.data.map((msg, i) => {
                    this.state.dataSource.push(msg);
                    return true;
                })
            }
        }).then(() => this.setState({updated: true}));
    }

    _send = async () => {
        if (this.state.body) {
            let message = {
                id: this.props.chat.id,
                body: this.state.body,
                myid: this.props.myid,
                mate: this.props.chat.mate_id,
                sender_name: this.state.me.first_name,
                sender_avatar: this.state.me.avatar,
            }
            API('dispatch', message).then((res) => {
                if (res.ok) {
                    this.props.conn.send(JSON.stringify(message));
                    this.state.dataSource.unshift({
                        chat: this.props.chat.id,
                        body: this.state.body,
                        sender: this.props.myid,
                        recipient: this.props.chat.mate_id,
                        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    })
                    // this._update();
                }
            }).then(() => {
                this.setState({body: ''});
                if (this.messages && this.messages.firstChild ) {
                    this._scrollBottom();
                }
            });
        }
    }
    
    _keyIn = (e) => {
        if (e.key === 'Enter') {
            this._send();
        }
    }

    _textIn = (e) => {
        this.props.conn.send(JSON.stringify({
            mate: this.props.chat.mate_id,
            chat: this.props.chat.id,
        }) + ' typing');
        this.setState({[e.target.name]:e.target.value});
    }

    render() {
        let Messages = null;

        if (this.state.dataSource) {
            let prev = 0;
            Messages = this.state.dataSource.map((msg, i) => {
                if (msg.sender === prev) {
                    
                    return <MessageGroup key={ i } msg={ msg } myid={ this.props.myid } chat={ this.props.chat }/>
                } else {
                    prev = msg.sender;
                    return <MessageBubble key={ i } msg={ msg } myid={ this.props.myid } chat={ this.props.chat }  myavatar={this.state.me.avatar} />
                }
            })
        }

        return (
            <div className='profile-info-full chat messages'>
                <div className='messages-map' ref={(ref) => this.messages = ref}>
                    {this.state.scrollbottom && <MessageIndicator color={this.state.newMessage} scroll={this._scrollBottom} typing={this.state.typing} />}
                    { this.state.typing && <TypingIndicator /> }
                    { Messages }
                </div>
                <div>
                    <div className='message-input'>
                        <input name='body' type='text' placeholder='Message..' value={this.state.body} onChange={this._textIn} onKeyPress={this._keyIn} />
                    </div>
                    <div className='message-dispatch' onClick={this._send}>
                        <i className="fas fa-share"></i>
                    </div>
                </div>
            </div>
        );
    }
}

const TypingIndicator = (props) => {
    return (
        <div className='typing'>
            <img className='typing-indicator' alt='' src={require('../img/typing.gif')} />
        </div>
    );
}

const MessageIndicator = (props) => {
    return (
        <div className='message-indicator' style={{bottom: props.typing ? 68 + 'px' : 35 + 'px'}}>
            <i className="fas fa-chevron-circle-down" style={{color: props.color ? '#cc2222' : '#aaa'}} onClick={() => props.scroll()}></i>
        </div>
    );
}

const MessageGroup = (props) => {
    if (props.msg.sender === props.myid) {
        return (
            <div className='message-bubble group'>
                <div className='bubble-cnt sent'>
                    <p className='message-body sent group'>{ props.msg.body }</p>
                </div>
            </div>
        )
    } else {
        return (
            <div className='message-bubble group'>
                <div className='bubble-cnt received'>
                    <p className='message-body received group'>{ props.msg.body }</p>
                </div>
            </div>
        )
    }
}

const MessageBubble = (props) => {
    let timestamp =  props.msg.timestamp.split(" ")[1].split(":");

    if (props.msg.sender === props.myid) {
        return (
            <div className='message-bubble'>
                <div className='bubble-cnt sent'>
                    <img className='message-avatar sent' src={ props.myavatar } alt='' />
                    <p className='message-body sent'>{ props.msg.body }</p>
                    <p className='message-time sent'>{timestamp[0] + ':' + timestamp[1]}</p>
                </div>
            </div>
        )
    } else {
        return (
            <div className='message-bubble'>
                <div className='bubble-cnt received'>
                    <img className='message-avatar received' src={ props.chat.avatar } alt='' />
                    <p className='message-body received'>{ props.msg.body }</p>
                    <p className='message-time received'>{timestamp[0] + ':' + timestamp[1]}</p>
                </div>
            </div>
        )
    }
}

const ChatPreview = (props) => {
    let mate = props.data.initiator === props.id ?
        {id: props.data.id, mate_id: props.data.responder, name: props.data.responder_name, avatar: props.data.avatar_two} :
        {id: props.data.id, mate_id: props.data.initiator, name: props.data.initiator_name, avatar: props.data.avatar_one};

    if (props.data.last_msg) {
        return (
            <div className='chat-preview'>
                <img src={ mate.avatar } alt='' />
                <div className='chat-details' onClick={() => props.open(mate)}>
                    <h4>{ mate.name }</h4>
                    <p>{ props.data.last_msg }</p>
                </div>
            </div>
        )
    } else {
        return null;
    }
}

const MatchesList = (props) => {
    let mate = {id: -42, mate_id: props.data.id, name: props.data.first_name, avatar: props.data.avatar};

    return (
        <img src={ mate.avatar } className='match-sm' alt='' onClick={() => props.open(mate)} />
    )
}
