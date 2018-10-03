import React, { Component } from 'react';
import API from '../backyard/api';
import { TagBubble, PersonBubble } from '../const/bubbles';
import { ProfilePreview } from '../const/profiles';

export default class Browser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            l_a: 18,
            u_a: 30,
            distance: 7300,
            gender: '',
            seeking: '',
            tags: '',
            tagIn: '',
            fame: 0,
            n: 0,
            complete: false,
            dataSource: [],
            preview: -1,
            myid: this.props.myid,
            bl: [],
            searchBubble: false,
            search: false,
        }
    }

    _matchTags = (profile) => {
        const tags = this.props.me.tags.split(' ');
        for (let i = 0, len = tags.length; i < len; i++) {
            if (profile.tags.search(tags[i]) !== - 1){
                return true;
            }
        }
        return false;
    }

    _setDataSource = (data, i) => {
        let ds = i ? this.state.dataSource : [];
        data.map((obj) => {
            if (this._matchTags(obj)) {
                ds.push(obj);
            }
            return true;
        })
        data.map((obj) => {
            if (!this._matchTags(obj)) {
                ds.push(obj);
            }
            return true;
        })
        this.setState({dataSource: ds});
    }

    _bootstrapAsync = async () => {
        console.log('asd');
        let state = await this.state;
        state.n = 0;
        state.seeking = this.state.seeking ? this.state.seeking : this.props.me.seeking === 'f' ? 'm' : this.props.me.seeking === 'b' ? 'b' : 'f';
        state.gender = this.state.gender ? this.state.gender : this.props.me.seeking === 'f' ? 'f' : this.props.me.seeking === 'b' ? 'b' : 'm';
        this.setState({gender: state.gender});
        API('geoSort', state).then((res) => {
            if (res.data) {
                this._setDataSource(res.data, 0);
                // this.setState({dataSource: res.data});
                this.setState({n: this.state.n + 35});
                if (res.end) {
                    this.setState({complete: true});
                    this.users.removeEventListener('scroll', this._infinityScroll);
                }
            }
        }).then(() => {
            // if (this.users && this.users.scrollHeight <= window.innerHeight) {
            //     this.state.n = 35;
            //     this._onScroll();
            // }
            this.setState({updated: true})
        });
    }

    componentWillMount() {
        API('getBlacklist', {myid: this.props.myid}).then((res) => {
            if (res.data) {
               res.data.map((bl, i) => this.state.bl.push(bl.listed));
            }
        })
    }

    async componentDidMount() {
        setTimeout(() => this.setState({searchBubble: true}), 500);
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
        API('geoSort', this.state).then((res) => {
            if (res) {
                this._setDataSource(res.data, 1);
                this.setState({n: this.state.n + 35});
                if (res.end) {
                    this.setState({complete: true});
                    this.users.removeEventListener('scroll', this._infinityScroll);
                }
            }
        });
    }

    _searchId = (n) => {
        this.state.dataSource.map((key, i) => {
            if (key.id === n) {
                this.setState({preview: i});
                return true;
            }
            return false;
        })
    }

    _showPreview = (id) => {
        this._searchId(id);
    }
    
    _hidePreview = () => {
        this.setState({preview: -1});
    }

    _toggleSearch = () => {
        this.setState({search: !this.state.search});
    }

    _onInput = (e) => {
        if (e.target.name === 'u_a' && e.target.value <= this.state.l_a) {
            this.setState({[e.target.name]:this.state.l_a});
        } else if (e.target.name === 'l_a' && e.target.value >= this.state.u_a) {
            this.setState({[e.target.name]:this.state.u_a});
        } else {
            this.setState({[e.target.name]:e.target.value});
        } 
    }

    _addTag = (e) => {
        if (e.key === ' ') {
            if (e.target.value.length > 1) {
                let a = this.state.tags;
                a += ' ' + e.target.value.trim();
                this.setState({tags: a});
            }
            this.setState({tagIn: ''});
        } 

    }

    _deleteTag = (word) => {
        let str = this.state.tags;
        let n = str.search(word);
        let newstr = str.substring(0, n - 1) + str.substring(n + word.length, str.length);
        this.setState({tags: newstr});
    }

    render() {
        let Content = null;
        let Tags = null;

        if (this.state.dataSource) {
            Content = this.state.dataSource.map((p, i) => {
                return (
                    <PersonBubble info={ p } key={ i } preview={this._showPreview} bl={this.state.bl} />
                )
            })
        }
        if (this.state.tags) {
            let array = this.state.tags.split(' ');
            Tags = array.map((tag, i) => {
                return <TagBubble text={tag} key={ i } delete={this._deleteTag} />
            })
        }
        return (
            <div ref={(ref) => this.users = ref} style={{transition: '300ms', display: 'flex', flexDirection: 'row', width: this.props.size ? 'calc(100vw - 350px)' : 100 + 'vw', height: 90 + 'vh', flexWrap: 'wrap', justifyContent: 'flex-start', overflowY: 'scroll', paddingTop: 15 + 'px'}}>
                { this.state.preview >= 0 && <div className='profile-preview-cnt'><div style={{position: 'absolute', height: 100 + '%', width: 100 + '%'}}  onClick={this._hidePreview} />
                    <ProfilePreview info={this.state.dataSource[this.state.preview]} hide={this._hidePreview} myid={this.state.myid} me={this.props.me} refresh={this._bootstrapAsync} conn={this.props.conn} openImg={ this.props.openImg } />
                </div> }
                <div className='search-bubble' style={{top: this.state.searchBubble ? 100 + 'px' : 0 + 'px'}} onClick={this._toggleSearch}>
                    <p>Search Filter</p>
                </div>
                <div className='search-pannel' style={{top: this.state.search ? 114 + 'px' : -500 + 'px'}}>
                    <div className='search-age'>
                        <label>Age gap:</label>
                        <p className='l'>{this.state.l_a}</p>
                        <input type='range' min='18' max='99' step='1' value={this.state.l_a} onChange={this._onInput} name='l_a' />
                        <input type='range' min='18' max='99' step='1' value={this.state.u_a} onChange={this._onInput} name='u_a' />
                        <p className='r'>{this.state.u_a}</p>
                    </div>
                    <div className='search-criteria'>
                        <div className='search-age'>
                            <label>Radius:</label>
                            <p className='l'>{this.state.distance}</p>
                            <input type='range' min='0' max='9990' step='10' value={this.state.distance} onChange={this._onInput} name='distance' />
                            <p className='r'>Km</p>
                        </div>
                    </div>
                    <div className='search-criteria'>
                        <div className='search-age'>
                            <label>Min. Fame:</label>
                            <p className='l'>{this.state.fame}</p>
                            <input type='range' min='0' max='99' step='1' value={this.state.fame} onChange={this._onInput} name='fame' />
                            <p className='r'>&#9733;</p>
                        </div>
                    </div>
                    <div className='search-criteria'>
                        <div className='search-age'>
                            <label>Gender:</label>
                            <p onClick={() => this.setState({gender: 'm'})} className='third' style={{color: this.state.gender === 'm' ? '#e39' : '#999'}}>Male</p>
                            <p onClick={() => this.setState({gender: 'f'})} className='third'style={{color: this.state.gender === 'f' ? '#e39' : '#999'}}>Female</p>
                            <p onClick={() => this.setState({gender: 'b'})} className='third'style={{color: this.state.gender === 'b' ? '#e39' : '#999'}}>Both</p>
                        </div>
                    </div>
                    <div className='search-criteria' style={{margin: 0}}>
                        <div className='search-age' style={{margin: 0}}>
                            <label>Interests:</label>
                            <input type='text' placeholder='Separated by space' value={this.state.tagIn} onChange={this._onInput} onKeyPress={this._addTag} name='tagIn' />
                            <div className='tags-cnt'>
                                { Tags }
                            </div>
                        </div>
                    </div>
                    <p className='apply' onClick={() => {this._bootstrapAsync(); this._toggleSearch()}}>Apply</p>
                </div>
                { Content }
            </div>
        );
    }
}