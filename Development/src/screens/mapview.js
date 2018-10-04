import React, { Component } from 'react';
import API from '../backyard/api';
import { PersonBubbleMap } from '../const/bubbles';
import { ProfilePreview } from '../const/profiles';

export default class BrowerMap extends Component {
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

    _mercator = (latitude, longitude) => {
        let mapWidth = 570,
        mapHeight = 315,
        mapLngLeft = this.props.me.longitude - 15,
        mapLngRight = this.props.me.longitude + 15,
        mapLatBottom = this.props.me.latitude + 15;

        const mapLatBottomRad = mapLatBottom * Math.PI / 180
        const latitudeRad = latitude * Math.PI / 180
        const mapLngDelta = (mapLngRight - mapLngLeft)

        const worldMapWidth = ((mapWidth / mapLngDelta) * 360) / (2 * Math.PI)
        const mapOffsetY = (worldMapWidth / 2 * Math.log((1 + Math.sin(mapLatBottomRad)) / (1 - Math.sin(mapLatBottomRad))))

        const y = (longitude - mapLngLeft) * (mapWidth / mapLngDelta)
        const x = mapHeight - ((worldMapWidth / 2 * Math.log((1 + Math.sin(latitudeRad)) / (1 - Math.sin(latitudeRad)))) - mapOffsetY)
        return ({x: x, y: y});
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
                this.setState({n: this.state.n + 35});
                if (res.end) {
                    this.setState({complete: true});
                    this.users.removeEventListener('scroll', this._infinityScroll);
                }
            }
        }).then(() => {
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
        let myid = await this.props.myid;
        this.state.myid = myid;
        this._bootstrapAsync();
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

    render() {
        let Content = null;

        if (this.state.dataSource) {
            Content = this.state.dataSource.map((p, i) => {
                let coord = this._mercator(p.latitude, p.longitude);
                return (
                    <PersonBubbleMap info={ p } key={ i } preview={this._showPreview} bl={this.state.bl} x={coord.x} y={coord.y} />
                )
            })
        }

        const myCoord = this._mercator(this.props.me.latitude, this.props.me.longitude);

        return (
            <div ref={(ref) => this.users = ref} style={{transition: '300ms', display: 'flex', flexDirection: 'row', width: this.props.size ? 'calc(100vw - 350px)' : 100 + 'vw', height: 95 + 'vh', flexWrap: 'wrap', justifyContent: 'flex-start', overflowY: 'scroll', paddingTop: 15 + 'px'}}>
                { this.state.preview >= 0 && <div className='profile-preview-cnt'><div style={{position: 'absolute', height: 100 + '%', width: 100 + '%'}}  onClick={this._hidePreview} />
                    <ProfilePreview info={this.state.dataSource[this.state.preview]} hide={this._hidePreview} myid={this.state.myid} me={this.props.me} refresh={this._bootstrapAsync} conn={this.props.conn} openImg={ this.props.openImg } />
                </div> }
                <div className='map-view' id='map'>
                    <div className='me'>
                    <img className='compass' src={require('../img/compass.png')} alt='' />
                        <PersonBubbleMap info={ this.props.me } key={ 'me-on-the-map' } preview={() => null} bl={this.state.bl} x={myCoord.x} y={myCoord.y} me={1} />
                    </div>
                    { Content }
                </div>
            </div>
        );
    }
}