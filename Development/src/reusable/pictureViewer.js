import React, { Component } from 'react';

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
        return (
            <div className='picture-view' style={{backgroundColor: this.state.light ? '#eee' : 'rgba(29,29,29,1)'}}>
                <i className="fas fa-chevron-left" onClick={this._prev}></i>
                <i className="fas fa-chevron-right" onClick={this._next}></i>
                <i className="fas fa-moon" onClick={this._setTheme}></i>
                <i className="fas fa-times" onClick={this.props.close}></i>
                <i className="fas fa-infinity" onClick={this._setInfinite} style={{color: this.state.infinite && '#333'}}></i>
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

export default PictureViewer