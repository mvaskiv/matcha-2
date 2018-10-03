import React, { Component } from 'react';
import API from '../backyard/api';
import Browser from './browser';
import Chats from './chat';
import BrowserMap from './mapview';

import { TagBubbleConst, PictureThumb } from '../const/bubbles';


const ImageUpload = (props) => {
    return (
        <div>
            <input type='file' onChange={this._fileHandler} />
            <button onClick={this._uploadImg}>Upload</button>
        </div>
    )
}

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: false,
            info: false,
            city: false,
            picture: null,
            addPicture: false,
            changeProfilePic: false,
            avatar: false,
            img: false,
        }
        this._bootstrapAsync();
    }
    
    _bootstrapAsync = async () => {
        let data = await JSON.parse(localStorage.getItem('user_data'));
        this._getImages(data.id);
        // GEO().then((res) => this.setState({city: res}));
        this.setState({info: data});
    }

    _getImages = (id) => {
        API('getImages', {id: id}).then((res) => {
            if (res.data) {
                this.setState({img: res.data.split(' ')});
            }
            if (res.avatar) {
                this.setState({avatar: res.avatar});
            }
        });
    }
    
    _getAge(d) {
        var dD = new Date(d);
        var aD = Date.now() - dD.getTime();
        var aT = new Date(aD);
        return Math.abs(aT.getUTCFullYear() - 1970);
    }

    componentWillMount() {
        
    }

    componentDidUpdate() {
    }

    _addPicture = () => {
        this.setState({addPicture: true})
    }

    _fileHandler = (e) => {
        this._prepareImg(e.target.files[0]);
    }

    _prepareImg = (picture) => {
        let reader = new FileReader();
        reader.readAsDataURL(picture);
        reader.onload = (e) => {
            this.setState({picture: e.target.result})
        };
    }

    _uploadImg = () => {
        API('imgUpload', {picture: this.state.picture, id: this.state.info.id}).then((res) => {
            if (res.data) {
                this._getImages(this.state.info.id);
            } else {
                alert('Oops, error on the server side. PLease, try again a bit later');
            }
        }).then(() => setTimeout(() => this.setState({addPicture: false, updated: true}), 500));
    }

    _changeProfilePic = (i) => {
        if (i >= 0) {
            API('updateProfilePic', {id: this.state.info.id, avatar: this.state.img[i]}).then((res) => {
                if (res.ok) {
                    this._getImages(this.state.info.id);
                } else {
                    alert('Oops, error on the server side. PLease, try again a bit later');
                }
            })
            this.setState({changeProfilePic: false});
        } else {
            this.setState({changeProfilePic: !this.state.changeProfilePic});
        }
    }

    render() {
        let Tags = null;
        let Pictures = null;
        if (this.state.info.tags) {
            let array = this.state.info.tags.split(' ');
            Tags = array.map((tag, i) => {
                return <TagBubbleConst text={tag} key={ i } delete={this._deleteTag} />
            })
        }

        if (this.state.img) {
            Pictures = this.state.img.map((pic, i) => {
                return <PictureThumb pic={ pic } all={ this.state.img } key={ i } n={ i } open={ this.state.changeProfilePic ? () => this._changeProfilePic(i) : this.props.openImg } my={ true } />
            });
            if (this.state.img.length < 5) {
                Pictures.push(<PictureThumb add={ this._addPicture } key={ 'add-a-picture-button' } /> );
            }
        } else {
            Pictures = <PictureThumb add={ this._addPicture } /> 
        }

        return (
            <div>
                <div id="user-panel">
                    <img id="user-avatar" onClick={() => this._changeProfilePic(-42)} src={this.state.avatar ? this.state.avatar : require('../img/avatar.png')} alt='' />
                    {/* <p className="info likes">Affection</p>
                    <p className="counter likes">253</p>
                    <p className="info posts">Matches</p>
                    <p className="counter posts">121</p> */}
                    <div className='profile-info me'>
                        <div className='profile-info-full top'>
                            <h2>{ this.state.info.first_name }</h2>
                            <p>{this.state.changeProfilePic ? 'To update your profile picture, select it from the ones available below. Or use the pluss button to upload something new.' : this.state.city + ', ' + this._getAge(this.state.info.dob) + ' y.o.'}</p>
                        </div>
                        <div className='profile-info-half'>
                            <label>Gender:</label>
                            <p>{ this.state.info.gender === 'M' ? "Male" : "Female" }</p>
                        </div>
                        <div className='profile-info-half'>
                            <label>Looking for:</label>
                            <p>{ this.state.info.seeking === 'm' ? "Men" : this.state.info.seeking === 'f' ? "Women" : "Both" }</p>
                        </div>
                        <div className='profile-info-full'>
                            <label>Interested in:</label>
                            {/* <p>{ this.state.info.tags }</p> */}
                            <div className='tags-cnt'>
                                { Tags }
                            </div>
                        </div>
                        <div className='profile-info-full' style={{marginTop: 10 + 'px'}}>
                            <label>About me:</label>
                            <p>{ this.state.info.about }</p>
                        </div>
                        <div className='profile-info-full' style={{marginTop: 10 + 'px'}}>
                            <label>Pictures:</label>
                            <div className='picture-thumb'>
                                { Pictures }
                            </div>
                        </div>
                        <div className='profile-info-full' style={{marginTop: 10 + 'px', opacity: this.state.addPicture ? '1' : '0'}}>
                            <div>
                                <input type='file' onChange={this._fileHandler} />
                                <button onClick={this._uploadImg}>Upload</button>
                            </div>
                        </div>
                    </div>
                    {/* <a onclick="return logMeOut();"><p className="logout" id="logout_d">Log out</p></a> */}
                </div>
            </div>
        );
    }
}

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: false,
        }
    }

    _logOut = () => {
        sessionStorage.clear();
        localStorage.clear();
        setTimeout(function() {
            window.location.reload();
        }, 300);   
    }

    render() {
        return (
            <div>
                <div id="user-panel">
                    <div className='profile-info me'>
                        <div className='profile-info-full top settings'>
                            <h2>Settings</h2>
                        </div>
                    </div>
                    <p className="logout" onClick={this._logOut}>Sign Out</p>
                </div>
            </div>
        );
    }
}

class PopUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notification: this.props.n_open,
        }
    }

    render() {
        let menuItem = null;
        if (this.props.display === 0) {
            menuItem = null;
        } else if (this.props.display === 1) {
            menuItem = <Chats locked={this.props.locked} conn={this.props.conn} n_open={this.props.n_open} clear={this.props.clear} sockets={this.props.sockets} />
        } else if (this.props.display === 2) {
            menuItem = <Profile openImg={this.props.openImg} />
        } else if (this.props.display === 3) {    
            menuItem = <Settings />
        }

        return (
            <div className='popup' style={{top: this.props.shown ? 150 + 'px' : -100 + 'vh'}}>
                <i className="fas fa-expand-arrows-alt lock-panel" onClick={this.props.lock}></i>
                <i className="far fa-minus-square close-panel" onClick={this.props.toggle}></i>
                {menuItem}
            </div>
        )
    }
}

const Notification = (props) => {
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
      }
      this.url = require("../sound/light.mp3");
      this.audio = new Audio(this.url);
      this.conn = new WebSocket('ws://' + window.location.hostname +  ':8200');
      this._socketInit();
    }

    _socketInit = () => {
        this.conn.onmessage = (e) => {
            if (e.data !== 'refresh' && e.data !== 'connected') {
              let data = JSON.parse(e.data);
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
            {/* <i class="far fa-envelope messages-icon"></i> */}
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
                {this.state.myid && <Browser myid={this.state.myid} size={ this.state.lockMenu } me={this.state.me} conn={this.conn} openImg={this._openImageView} />}
                <div className='notification-container' style={{right: this.state.lockMenu ? 350 + 'px' : 0}}>
                    { Notifications }
                </div>
            </div>
            
            {/* <div className="menu-shelf" style={{right: this.state.menuShown ? 0 + 'px' : -450 + 'px'}}>
                <div className="menuCnt" style={{right: this.state.menuShown ? 0 + 'px' : -450 + 'px'}} >
        
                </div>
            </div> */}
  
        </div>
        );
    }
}

class PictureViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            current: false,
            infinite: false,
            light: false,
        }
    }

    _bootstrapAsync = async () => {
        return new Promise(resolve => {
            this.setState({
                dataSource: this.props.images,
                current: this.props.view,
            })
            resolve('ok');
        })
    }

    async componentDidMount() {
        await this._bootstrapAsync().then(() => this.setState({visible: true}));
    }

    _next = () => {
        if (this.state.current < this.state.dataSource.length - 1) {
            this.setState({current: this.state.current + 1});
        } else if (this.state.infinite) {
            this.setState({current: 0});
        } else {
            return ;
        }
    }

    _prev = () => {
        if (this.state.current > 0) {
            this.setState({current: this.state.current - 1});
        } else if (this.state.infinite) {
            this.setState({current: this.state.dataSource.length - 1});
        } else {
            return ;
        }
    }

    _change = (i) => {
        this.setState({current: i});
    }

    _setInfinite = () => {
        this.setState({infinite: !this.state.infinite});
    }

    _setTheme = () => {
        this.setState({light: !this.state.light});
    }

    render () {
        let Previews = null;
        if (this.state.dataSource) {
            Previews = this.state.dataSource.map((preview, i) => {
                return <PictureViewerPreview key={ i } src={ preview } n={ i } current={ this.state.current } change={ this._change } infinite={ this.state.infinite } />
            })
        }
        console.log(this.props.d)
        return (
            <div className='picture-view' style={{backgroundColor: this.state.light ? '#eee' : 'rgba(29,29,29,1)'}}>
                <i className="fas fa-chevron-left" onClick={this._prev}></i>
                <i className="fas fa-chevron-right" onClick={this._next}></i>
                <i className="fas fa-moon" onClick={this._setTheme}></i>
                <i className="fas fa-times" onClick={this.props.close}></i>
                <i className="fas fa-infinity" onClick={this._setInfinite}></i>
                {this.props.d === 1 && <i className="fas fa-trash" onClick={() => this.props.delete(this.state.current)}></i>}
                {/* <div className='close-view' onClick={this.props.close} /> */}
                <div className='view-container'>
                    <img alt='' src={this.state.dataSource[this.state.current]} />
                </div>
                <div className='previews-container'>
                    <div className='previews'>
                        { Previews }
                    </div>
                </div>
            </div>
        );
    }
}

const PictureViewerPreview = (props) => {
    if (props.n === props.current) {
        return (
            <img className='preview-img-lg' alt='' src={ props.src } />
        )
    } else {
        return (
            <img className='preview-img' alt='' src={ props.src } onClick={ () => props.change(props.n) } />
        )
    }
}



export default Home