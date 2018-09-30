import React, { Component } from 'react';
import API, { GEO } from '../backyard/api';



class ProfilePreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: false,
            info: false,
            city: false,
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

    _getAge(d) {
        var dD = new Date(d);
        var aD = Date.now() - dD.getTime();
        var aT = new Date(aD);
        return Math.abs(aT.getUTCFullYear() - 1970);
    }

    _like = () => {
        API('like', {
            myid: this.props.myid,
            mate: this.props.info.id,
        }).then((res) => {
            if (res.ok) {
                if (res.ok === 'match') {
                    alert('Congratulation, you liked each other and can now chat with ' + this.props.info.first_name);
                } else {
                    this.setState({liked: true});
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
            return (
                <div>
                    <div id="user-preview">
                        <img className='paper-clip' src={require('../img/clip.png')} alt='' />
                        <img id="user-avatar-lg" src={this.props.info.avatar ? this.props.info.avatar : require('../img/avatar.png')} alt='' />
                        {/* <p className="info likes">Affection</p>
                        <p className="counter likes">253</p>
                        <p className="info posts">Matches</p>
                        <p className="counter posts">121</p> */}
                        <div className='profile-info-wide'>
                            <div className='profile-info-full top'>
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
                                <p>{ this.props.info.tags }</p>
                            </div>
                        
                        </div>
                        <div className='profile-info-full bottom'>
                            <i className="far fa-check-circle green" onClick={this._like}></i>
                            <i className={ this.state.match ? "far fa-comment blue" : "far fa-comment" }></i>
                            <i className="far fa-times-circle red" onClick={this._block}></i>
                        </div>
                        {/* <a onclick="return logMeOut();"><p className="logout" id="logout_d">Log out</p></a> */}
                    </div>
                </div>
            );
        }
    }
}

const PersonBubble = (props) => {
    // if (props.info.id != )
    if (!props.bl.includes(props.info.id)) {
        return (
            <div className='bubble'>
                <img className='bubble-img' src={props.info.avatar ? props.info.avatar : null} alt='' onClick={() => props.preview(props.info.id)} />
                <h3>{props.info.first_name}</h3>
            </div>
        )
    } else {
        return null;
    }
}

export default class Browser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            n: 0,
            complete: false,
            dataSource: [],
            preview: false,
            myid: this.props.myid,
            bl: []
        }
        
    }

    _bootstrapAsync = () => {
        API('getUsers', this.state).then((res) => {
            if (res) {
                API('getBlacklist', this.state).then((res) => {
                    if (res.data) {
                       res.data.map((bl, i) => this.state.bl.push(bl.listed));
                    }
                }).then(() => {
                    res.data.map((person, i) => {
                        this.state.dataSource.push(person);
                        return true;
                    })
                    this.setState({n: this.state.n + 35});
                    if (res.end) {
                        this.setState({complete: true});
                        this.users.removeEventListener('scroll', this._infinityScroll);
                    }
                })
            }
        }).then(() => this.setState({updated: true}));
    }

    async componentDidMount() {
        let myid = await this.props.myid;
        this.state.myid = myid;
        this._bootstrapAsync();
    }

    componentDidUpdate() {
        if (this.users) {
            this.users.addEventListener('scroll', this._scrollListener);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._onScroll, false);
    }

    _scrollListener = () => {
        if (this.users.scrollTop + this.users.clientHeight >= this.users.scrollHeight) {
            this._onScroll();
        }
    }

    _onScroll = () => {
        API('getUsers', this.state).then((res) => {
            if (res) {
                res.data.map((person, i) => {
                    this.state.dataSource.push(person);
                    return true;
                })
                this.setState({n: this.state.n + 35});
                if (res.end) {
                    this.setState({complete: true});
                    this.users.removeEventListener('scroll', this._infinityScroll);
                }
            }
        });
    }

    _showPreview = (id) => {
        this.setState({preview: id - 1});
        // console.log(id);
    }
    
    _hidePreview = () => {
        this.setState({preview: false});
    }

    render() {
        let Content = null;

        if (this.state.dataSource) {
            Content = this.state.dataSource.map((p, i) => {
                return (
                    <PersonBubble info={ p } key={ i } preview={this._showPreview} bl={this.state.bl} />
                )
            })
        }
        return (
            <div ref={(ref) => this.users = ref} style={{transition: '300ms', display: 'flex', flexDirection: 'row', width: this.props.size ? 'calc(100vw - 350px)' : 100 + 'vw', height: 95 + 'vh', flexWrap: 'wrap', justifyContent: 'flex-start', overflowY: 'scroll', paddingTop: 15 + 'px'}}>
                { this.state.preview && <div className='profile-preview-cnt'><div style={{position: 'absolute', height: 100 + '%', width: 100 + '%'}}  onClick={this._hidePreview} />
                    <ProfilePreview info={this.state.dataSource[this.state.preview]} hide={this._hidePreview} myid={this.state.myid} refresh={this._bootstrapAsync} />
                </div> }
                { Content }
            </div>
        );
    }
}