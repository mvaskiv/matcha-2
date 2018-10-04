import React, { Component } from 'react';
import {
    SecretThing,
    Notification } from '../const/bubbles';
import API from '../backyard/api';
import Browser from './browser';
import BrowserMap from './mapview';
import PictureViewer from '../reusable/pictureViewer';
import PopUp from '../const/popup';

class Home extends Component {
    constructor(props) {
      super(props);
      this.state = {
        menuShown: false,
        me: false,
        menu: false,
        popup: false,
        display: false,
        lockMenu: false,
        notification: [],
        n_open: false,
        imgViewer: false,
        secret: false,
        trigger: 0,
        mapView: false,
      }
      this.url = require("../sound/light.mp3");
      this.talala = require("../sound/talala.m4a");
      this.audio = new Audio(this.url);
      this.conn = new WebSocket('ws://' + window.location.hostname +  ':8200');
      this._socketInit();
    }

    _socketInit = () => {
        this.conn.onmessage = (e) => {
            if (e.data !== 'refresh' && e.data !== 'connected') {
              let data = JSON.parse(e.data);
                if (data.willy) {
                    let a = new Audio(this.talala);
                    a.play();
                    this.setState({secret: true});
                    setTimeout(() => this.setState({secret: false, trigger: 0}), 5900);
                }
                if (data.chat === 2) {      
                  let a = this.state.notification;
                  if (a.length >= 5) {a.shift()}
                  a.push(data);
                  this.setState({notification: a});
                  // setTimeout(() => this.setState({notification: false}), 4300);
                  this.audio.play();
                }
            }
        }
    }

    async componentDidMount() {
        let data = await JSON.parse(localStorage.getItem('user_data'));
       
        this.setState({myid: data.id});
        this.setState({me: data});
        console.log(this.state.me.id);
        this.conn.onopen = (e) => {
            this.conn.send(data.id + ' in app');
            window.addEventListener('beforeunload', () => this.conn.send(this.state.myid + ' out'));
        };
    }

    _togglePopup = () => {
        if (!this.state.popup) {
            this.setState({popup: true});
        } else {
            this.setState({
                popup: false,
                lockMenu: false,
            });
        }
    }

    _lockMenu = () => {
        this.setState({lockMenu: !this.state.lockMenu});
    }

    _getMenuItem = (item) => {
        if (item === 0) {
            window.location.reload();
        } else if (item === 1) {
            this.setState({display: 1});
        } else if (item === 2) {
            this.setState({display: 2});
        } else if (item === 3) {    
            this.setState({display: 3});
        }
        if (!this.state.popup) {this._togglePopup();}
    }

    _openNotification = (chat) => {
        this.setState({display: 1});
        this.setState({popup: true});
        this.setState({n_open: chat});
        this._clearAllNotifications();
    }

    _clearNotification = () => {
        this.setState({n_open: false});
    }

    _clearAllNotifications = () => {
        this.setState({notification: []});
    }

    _openImageView = (array, key, i) => {
        this.setState({imgViewer: {
            images: array,
            key: key,
            i: i
        }});
    }
    _closeImageView = () => {
        this.setState({imgViewer: false});
    }

    _deleteImg = (i) => {
        let array = this.state.imgViewer.images;
        array.splice(i, 1);
        let join = array.join(' ');
        API('imgDelete', {pictures: join, id: this.state.me.id}).then((res) => {
            if (res.ok) {
                alert('Deleted');
                this.setState({updated: true});
            }
        });
        // let state = this.state.me;
        // state.pictures = join;
        // localStorage.setItem('user_data', JSON.stringify(state));
    }

    _trigger = () => {
        if (!this.state.secret && this.state.trigger >= 7) {
            this.conn.send('willy talala');
        } else {
            this.setState({trigger: this.state.trigger + 1});
        } 
    }

    _mapView = () => {
        this.setState({mapView: !this.state.mapView});
    }

    render() {
        let Notifications = null;

        if (this.state.notification) {
            Notifications = this.state.notification.map((data, i) => {
                return <Notification data={ data } key={ i } n={ i } open={ this._openNotification } clear={this._clearAllNotifications}/>
            })
        }

        return (
        <div className="App">
          <header className="header">
            <h1>MATCHA</h1><i className="far fa-kiss-wink-heart" onClick={this._trigger}></i>
            <div className="menu mobhide" style={{width: this.state.menu ? 100 + 'vw' : 50 + 'px'}}>
                <img src={require('../img/menu.png')} className="menu-btn" alt="logo" onClick={() => this.setState({popup: false, menu: !this.state.menu})} />
                <p onClick={() => this._getMenuItem(3)}>Settings</p>
                <p onClick={() => this._getMenuItem(2)}>Profile</p>
                <p onClick={() => this._getMenuItem(1)}>Chats</p>
                <p onClick={() => this._getMenuItem(0)}>Home</p>
            </div>
          </header>
            
            {this.state.imgViewer && <PictureViewer images={this.state.imgViewer.images} view={this.state.imgViewer.key} close={this._closeImageView} delete={this._deleteImg} d={this.state.imgViewer.i} />}
            <PopUp shown={this.state.popup} toggle={this._togglePopup} display={this.state.display} lock={this._lockMenu} locked={this.state.lockMenu} conn={this.conn} n_open={this.state.n_open} clear={this._clearNotification} openImg={this._openImageView} sockets={this._socketInit} />
            <div className='main-view'>
                {this.state.me.id && <Browser myid={this.state.myid} size={ this.state.lockMenu } me={this.state.me} conn={this.conn} openImg={this._openImageView} mapView={this._mapView} />}
                {/* {this.state.mapView && <BrowserMap myid={this.state.myid} size={ this.state.lockMenu } me={this.state.me} conn={this.conn} openImg={this._openImageView} mapView={this._mapView} />} */}
                <div className='notification-container' style={{right: this.state.lockMenu ? 350 + 'px' : 0}}>
                    { Notifications }
                </div>
                {this.state.secret && <SecretThing />}
            </div>
        </div>
        );
    }
}

export default Home