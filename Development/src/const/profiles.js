import React, { Component } from 'react';
import API, { GEO } from '../backyard/api';
import { TagBubbleConst, PictureThumb } from '../const/bubbles';

export class Profile extends Component {
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
        GEO().then((res) => this.setState({city: res}));
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

export class ProfilePreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: false,
            info: false,
            city: false,
            liked: false,
            matched: false,
        }
        this._bootstrapAsync();
    }

    _bootstrapAsync = async () => {
        this.state.id = await this.props.info.id;
        GEO({lat: this.props.info.latitude, lon: this.props.info.longitude}).then((res) => this.setState({city: res}));
    }

    componentWillReceiveProps() {
        if (this.state.id !== this.props.info.id) {
            this._bootstrapAsync();
        }
    }

    async _push(type) {
        let message = await {
            myid: this.props.me.id,
            body: type,
            mate: this.props.info.id,
            sender_name: this.props.me.first_name,
            sender_avatar: this.props.me.avatar,
        }
        this.props.conn.send(JSON.stringify(message));
    }

    componentDidMount() {
        this._push('Checked you out!');
        API('likeNmatch', {
            myid: this.props.me.id,
            mate: this.props.info.id,
        }).then((res) => {
            if (res.data) {
                if (res.data.liked) {
                    this.setState({liked: true});
                }
                if (res.data.matched) {
                    this.setState({matched: true});
                }
            }
        });
    }

    _getAge(d) {
        var dD = new Date(d);
        var aD = Date.now() - dD.getTime();
        var aT = new Date(aD);
        return Math.abs(aT.getUTCFullYear() - 1970);
    }

    _like = () => {
        let post = {
            myid: this.props.me.id,
            mate: this.props.info.id,
        };
        API('like', post).then((res) => {
            if (res.ok) {
                if (res.ok === 'match') {
                    alert('Congratulation, you liked each other and can now chat with ' + this.props.info.first_name);
                    this._push("You have a match!");
                } else if (res.ok !== 'duplicate') {
                    this.setState({liked: true});
                    this._push('Liked you!');
                } else if (res.ok === 'duplicate') {
                    API('unlike', post).then((res) => {
                        if (res.ok) {
                            alert('You unliked ' + this.props.info.first_name);
                            this._push('Uniked you!');
                        }
                    });
                }
            } else if (!res.ok) {
                alert('Oops, error on the server side. Please, try again later');
            }
        })
    }

    _block = async () => {
        let confirmation = await window.confirm("Do you really want to blacklist " + this.props.info.first_name + "?");
        if (confirmation) {
            API('block', {
                myid: this.props.myid,
                mate: this.props.info.id,
            }).then((res) => {
                if (res.ok) {
                    alert('You have successfully blocked this dirty animal.');
                    this.setState({blocked: true});
                } else {
                    alert('Oops, error on the server side. Please, try again later');
                }
            }).then(this.props.refresh());
        }
    }

    _unblock = () => {
        API('unblock', {
            myid: this.props.myid,
            mate: this.props.info.id,
        }).then((res) => {
            if (res.ok) {
                alert('Unblocked.');
                this.setState({blocked: false});
            } else {
                alert('Oops, error on the server side. Please, try again later');
            }
        }).then(this.props.refresh());
    }

    render() {
        if (this.state.blocked) {
            return (
                <div>
                    <div id="user-preview">
                        <i className="fas fa-ban blocked"></i>
                        <p onClick={this._unblock} style={{cursor: 'pointer', marginTop: 10 + 'px'}}>Unblock</p>
                    </div>
                </div>
            )
        } else {
            let Tags = null;
            let Pictures = null;
            if (this.props.info.tags) {
                let array = this.props.info.tags.split(' ');
                Tags = array.map((tag, i) => {
                    return <TagBubbleConst text={tag} key={ i } delete={this._deleteTag} />
                })
            }
    
            if (this.props.info.pictures) {
                let array = this.props.info.pictures.split(' ');
                Pictures = array.map((pic, i) => {
                    return <PictureThumb pic={ pic } all={ array } key={ i } n={ i } open={ this.props.openImg } my={ false } />
                })
            }
            return (
                <div>
                    <div id="user-preview">
                        <img className='paper-clip' src={require('../img/clip.png')} alt='' />
                        <p className='fame'>Fame: {this.props.info.fame}</p>
                        <img id="user-avatar-lg" src={this.props.info.avatar ? this.props.info.avatar : require('../img/avatar.png')} alt='' />
                        <div className='profile-info-half pictures-half' style={{marginTop: 10 + 'px'}}>
                            <div className='picture-thumb'>
                                { Pictures }
                            </div>
                        </div>
                        <div className='profile-info-wide'>
                            <div className='profile-info-full top name'>
                                <h2>{ this.props.info.first_name } { this.props.info.last_name }</h2>
                                <p>{ this.state.city } <br/><br/> {this._getAge(this.props.info.dob)} y.o.</p>
                            </div>
                            <div className='profile-info-half'>
                                <label>Gender:</label>
                                <p>{ this.props.info.gender === 'M' ? "Male" : "Female" }</p>
                            </div>
                            <div className='profile-info-half'>
                                <label>Looking for:</label>
                                <p>{ this.props.info.seeking === 'm' ? "Men" : this.props.info.seeking === 'f' ? "Women" : "Both" }</p>
                            </div>
                            <div className='profile-info-full'>
                                <label>Interested in:</label>
                                <div className='tags-cnt'>
                                    { Tags }
                                </div>
                            </div>
                            <div className='profile-info-full about' style={{marginTop: 10 + 'px'}}>
                                <label>About me:</label>
                                <p max='100' >{ this.props.info.about }</p>
                            </div>
                            
                        </div>
                    
                        <div className='profile-info-full bottom'>
                            <i className={ this.state.liked ? "far fa-check-circle green" : "far fa-check-circle" } onClick={this._like}></i>
                            {/* <i className={ this.state.matched ? "far fa-comment blue" : "far fa-comment" }></i> */}
                            <i className="far fa-times-circle red" onClick={this._block}></i>
                        </div>
                    </div>
                </div>
            );
        }
    }
}