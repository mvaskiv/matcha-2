import React, { Component } from 'react';
import API, { GEO } from '../backyard/api';
import { TagBubbleConst, PictureThumb } from '../const/bubbles';

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



        // let a = await this._mercator(this.props.info.latitude, this.props.info.longitude);

        // let x = await ( 6371 * Math.cos(this.props.info.latitude) * Math.cos(this.props.info.longitude));
        // let y = await ( 6371 * Math.cos(this.props.info.latitude) * Math.sin(this.props.info.longitude));
        // this.setState({city: 'x: ' + a.x + ', y: ' + a.y});
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
        API('like', {
            myid: this.props.me.id,
            mate: this.props.info.id,
        }).then((res) => {
            if (res.ok) {
                if (res.ok === 'match') {
                    alert('Congratulation, you liked each other and can now chat with ' + this.props.info.first_name);
                    this._push("You have a match!");
                } else if (res.ok !== 'duplicate') {
                    this.setState({liked: true});
                    this._push('Liked you!');
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
                        <img id="user-avatar-lg" src={this.props.info.avatar ? this.props.info.avatar : require('../img/avatar.png')} alt='' />
                        {/* <p className="info likes">Affection</p>
                        <p className="counter likes">253</p>
                        <p className="info posts">Matches</p>
                        <p className="counter posts">121</p> */}
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
                            <i className={ this.state.matched ? "far fa-comment blue" : "far fa-comment" }></i>
                            <i className="far fa-times-circle red" onClick={this._block}></i>
                        </div>
                        {/* <a onclick="return logMeOut();"><p className="logout" id="logout_d">Log out</p></a> */}
                    </div>
                </div>
            );
        }
    }
}