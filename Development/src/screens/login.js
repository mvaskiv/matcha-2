import React, { Component } from 'react';
import API from '../backyard/api';

class RegisterForm extends Component {
    constructor(props) {
      super(props);
      this.state = {
        count: 0
      }
      this._bootstrapAsync();
    }

    _bootstrapAsync = () => {
      API('countUsers', {id: 0}).then((res) => {
        this.setState({count: res.data});
      });
    }
  
    _register = () => {
  
    }
  
    render() {
      return (
        <div className='mob-scroll'>
          <div className="login-form">
            <h2>Register</h2>
            <input type='text' className='form-input' placeholder='Login (optional)' />
            <label>Email:</label>
            <input type='text' className='form-input' placeholder='john@doe.com'/>
            <label>Date of Birth:</label>
            <input type='date' className='form-input' placeholder='Date of Birth'/>
            <label>Gender:</label>
            <div className='signup-sex'>
              <p onClick={() => this.setState({gender: 'm'})} className='third' style={{color: this.state.gender === 'm' ? '#e39' : '#999'}}>Male</p>
              <p>|</p>
              <p onClick={() => this.setState({gender: 'f'})} className='third'style={{color: this.state.gender === 'f' ? '#e39' : '#999'}}>Female</p>
            </div>
            <label>Sexuality:</label>
            <div className='signup-sex'>
              <p onClick={() => this.setState({gender: 'm'})} className='third' style={{color: this.state.gender === 'm' ? '#e39' : '#999'}}>Straight</p>
              <p onClick={() => this.setState({gender: 'f'})} className='third'style={{color: this.state.gender === 'f' ? '#e39' : '#999'}}>Gay</p>
              <p onClick={() => this.setState({gender: 'b'})} className='third'style={{color: this.state.gender === 'b' ? '#e39' : '#999'}}>Bisexual</p>
            </div>
            <h3 className="sign" onClick={this._logIn}>Sign Up</h3>
          </div>
          <div className="login-msg">
            <h2 className="cancel-lg" onClick={this.props.close}>Cancel</h2>
            <h1>It's FREE</h1>
            <h2>And we have exactly {this.state.count} users who will probably dislike you</h2>
          </div>
        </div>
      );
    }
  }
  
class LoginForm extends Component {
    constructor(props) {
      super(props);
      this.state = {
        login: '',
        password: '',
      }
    }
  
    _logIn = () => {
      API('login', this.state).then((res) => {
        if (res.ok) {
          sessionStorage.setItem('user_data', JSON.stringify(res.data));
          localStorage.setItem('user_data', JSON.stringify(res.data));
         
        } else {
          alert('Wrong cred.');
        }
      }).then(() => window.location.reload())
    }

    _textIn = (e) => {
      this.setState({[e.target.name]:e.target.value});
    }

    _keyPress = (e) => {
      if (e.key === 'Enter') {
        this._logIn();
      }
    }
  
    render() {
      return (
        <div>
          <div className="login-form-sm">
            <h2>Sign In</h2>
            <input name='login' onChange={this._textIn} type='text' placeholder="Login or Email" value={this.state.login} className='form-input-sm' />
            <input name='password' onChange={this._textIn} type='password' placeholder="Password" value={this.state.password} className='form-input-sm' onKeyPress={this._keyPress} />
            <h3 className="enter" onClick={this._logIn}>Enter</h3>
          </div>
          <div className="login-msg-sm">
            <h2 className="cancel-lg" onClick={this.props.close}>Cancel</h2>
            <h1>Welcome Back</h1>
            <h2>We missed you</h2>
          </div>
        </div>
      )
    }
  }   
  
export default class LoginScreen extends Component {
    constructor(props) {
      super();
      this.state = {
        form: false,
        reg: false,
        log: false,
      }
    }
  
    _hideForm = () => {
      setTimeout(() => this.setState({reg: false}), 0);
      setTimeout(() => this.setState({log: false}), 0);
      setTimeout(() => this.setState({form: false}), 550);
    }
  
    _showForm(type) {
      if (type === 1) {
        setTimeout(() => this.setState({form: true}), 0);
        setTimeout(() => this.setState({reg: true}), 550);
      } else if (type === 0) {
        setTimeout(() => this.setState({form: true}), 0);
        setTimeout(() => this.setState({log: true}), 550);
      }
    }
  
    render() {
      let form = this.state.reg ? <RegisterForm close={this._hideForm} /> : <LoginForm close={this._hideForm} /> ;
  
      return (
        <div className="App">
            <div className="welcome-bg">
              <video autoPlay muted loop className="video">
                <source src={require("../img/Date.mp4")} type="video/mp4" />
              </video>
            </div>
            <div className="welcome-screen">
              <div className='welcome-msg' style={{left: this.state.form ? '-100vw' : 5 + 'rem' }}>
                <h1>Welcome,</h1>
                <h2>To continue please <a onClick={() => this._showForm(0)}>sign in</a> or <a onClick={() => this._showForm(1)}>register</a></h2>
              </div>
              <div className="login-screen" style={{left: this.state.reg | this.state.log ? 10 + 'rem' : -90 + 'vw'}}>
                {this.state.form ? form : null}
              </div>
            </div>
          </div>
      )
    }
  }