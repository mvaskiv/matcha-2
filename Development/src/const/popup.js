import React, { Component } from 'react';
import Chats from '../screens/chat';
import API from '../backyard/api';
import { Profile } from './profiles';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: false,
            edit: false,
            updating: false,
            first_name: false,
            last_name: false,
            tags: false,
            about: false,
            email: false,
            login: false,
            gender: false,
            seeking: false,
            dob: false,
        }
        this.original = null;
        this._bootstrapAsync();
    }

    _bootstrapAsync = async () => {
        let me = await JSON.parse(localStorage.getItem('user_data'));
        this.setState(me);
        this.original = me;
    }

    _logOut = () => {
        sessionStorage.clear();
        localStorage.clear();
        setTimeout(function() {
            window.location.reload();
        }, 300);   
    }

    _getLocation = () => {
        this.setState({updating: true});
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._showPosition);
        }

    }

    _showPosition = async (position) => {
        let lat = await position.coords.latitude;
        let lon = await position.coords.longitude;
        API('updateLocation', {id: this.state.id, lat: lat, lon: lon}).then((res) => {
            if (res.ok) {
                API('getInfo', {id: this.state.id}).then((res) => {
                    sessionStorage.setItem('user_data', JSON.stringify(res.data));
                    localStorage.setItem('user_data', JSON.stringify(res.data));
                    alert('Your location has been successfully updated.');
                })
            } else {
                alert('Error. Please enable location services and try again in a few moments.');
            }
            this.setState({updating: false});
        })
    }

    _save = () => {
        if (this.state.edit === 'public') {
            this._editPublic()
        } else if (this.state.edit === 'private') {
            this._editPrivate();
        } else {
            this._editSettings();
        }
    }

    _editPublic = () => {
        API('editPublic', {
            id: this.state.id,
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            tags: this.state.tags,
            about: this.state.about,
        }).then((res) => {
            if (res.ok) {
                API('getInfo', {id: this.state.id}).then((res) => {
                    sessionStorage.setItem('user_data', JSON.stringify(res.data));
                    localStorage.setItem('user_data', JSON.stringify(res.data));
                    alert('Saved.');
                })
            } else {
                alert('Error. Please try again in a few moments.');
            }
        })
    }

    _editPrivate = () => {
        API('editPrivate', {
            id: this.state.id,
            email: this.state.email,
            login: this.state.login,
            gender: this.state.gender,
            seeking: this.state.seeking,
            dob: this.state.dob
        }).then((res) => {
            if (res.ok) {
                API('getInfo', {id: this.state.id}).then((res) => {
                    sessionStorage.setItem('user_data', JSON.stringify(res.data));
                    localStorage.setItem('user_data', JSON.stringify(res.data));
                    alert('Saved.');
                })
            } else {
                alert('Error. Please try again in a few moments.');
            }
        })
    }

    _editSettings = () => {

    }

    _textIn = (e) => {
        this.setState({[e.target.name]:e.target.value});
    }

    render() {
        return (
            <div>
                <div id="user-panel">
                    <div className='profile-info me'>
                        <div className='profile-info-full top settings'>
                            <h2>Settings</h2>
                            <div className='settings-cnt' style={{left: this.state.edit ? -100 + '%' : 0}}>
                                <div className='settings-option' onClick={() => this.setState({edit: 'public'})}>
                                    <p>Edit Public Info</p>
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                                <div className='settings-option' onClick={() => this.setState({edit: 'private'})}>
                                    <p>Edit Private Info</p>
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                                {/* <div className='settings-option' onClick={() => this.setState({edit: 'settings'})}>
                                    <p>General Settings</p>
                                    <i className="fas fa-chevron-right"></i>
                                </div> */}
                            </div>
                            <div className='settings-cnt' style={{left: this.state.edit !== 'public' ? 100 + '%' : 0}}>
                                <div className='settings-option-in' onClick={() => this.setState({edit: false})}>
                                    <i className="fas fa-chevron-left"></i>
                                    <p>Back</p>
                                </div>
                                <div className='settings-option-edit'>
                                    <p>Name:</p>
                                    <input type='text' value={this.state.first_name} onChange={this._textIn} name='first_name' />
                                </div>
                                <div className='settings-option-edit' >
                                    <p>Surname:</p>
                                    <input type='text' value={this.state.last_name} onChange={this._textIn} name='last_name'/>
                                </div>
                                <div className='settings-option-edit' >
                                    <p>Interests:</p>
                                    <input type='text' value={this.state.tags} onChange={this._textIn} name='tags'/>
                                </div>
                                <div className='settings-option-edit lg'>
                                    <p>About:</p>
                                    <textarea type='text' value={this.state.about} onChange={this._textIn} name='about'/>
                                </div>
                                <div className='settings-option' onClick={this._getLocation}>
                                    <p style={{textAlign: 'center', padding: 0}}>{this.state.updating ? 'Updating...' : 'Update Location'}</p>
                                </div>
                            </div>
                            <div className='settings-cnt' style={{left: this.state.edit !== 'private' ? 100 + '%' : 0}}>
                                <div className='settings-option-in' onClick={() => this.setState({edit: false})}>
                                    <i className="fas fa-chevron-left"></i>
                                    <p>Back</p>
                                </div>
                                <div className='settings-option-edit'>
                                    <p>Email:</p>
                                    <input type='text' value={this.state.email} onChange={this._textIn} name='email' />
                                </div>
                                <div className='settings-option-edit' >
                                    <p>login:</p>
                                    <input type='text' value={this.state.login} onChange={this._textIn} name='login'/>
                                </div>
                      
                                <div className='signup-sex'>
                                    <p onClick={() => this.setState({gender: 'M'})} className='third' style={{color: this.state.gender === 'M' ? '#e39' : '#999'}}>Male</p>
                                    <p>|</p>
                                    <p onClick={() => this.setState({gender: 'F'})} className='third'style={{color: this.state.gender === 'F' ? '#e39' : '#999'}}>Female</p>
                                </div>
                            
                                <div className='signup-sex'>
                                    <p onClick={() => this.setState({seeking: 'f'})} className='third' style={{color: this.state.seeking === 'f' ? '#e39' : '#999'}}>Women</p>
                                    <p onClick={() => this.setState({seeking: 'm'})} className='third'style={{color: this.state.seeking === 'm' ? '#e39' : '#999'}}>Men</p>
                                    <p onClick={() => this.setState({seeking: 'b'})} className='third'style={{color: this.state.seeking === 'b' ? '#e39' : '#999'}}>Both</p>
                                </div>
                                <div className='settings-option-edit'>
                                    <p>D.O.B.:</p>
                                    <input type='date' value={this.state.dob} onChange={this._textIn} name='dob'/>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.state.edit ? <p className="save" onClick={this._save}>Save</p> : <p className="logout" onClick={this._logOut}>Sign Out</p>}
                </div>
            </div>
        );
    }
}

export default class PopUp extends Component {
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