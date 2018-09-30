import React, { Component } from 'react';
import API from '../backyard/api';

class RegisterForm extends Component {
    constructor(props) {
      super(props);
      this.state = {
  
      }
    }
  
    _register = () => {
  
    }
  
    render() {
      return (
        <div>
          <div className="login-form">
            <h2>Register</h2>
            <input type='text' className='form-input' />
            <input type='text' className='form-input' />
            <input type='text' className='form-input' />
          </div>
          <div className="login-msg">
            <h2 className="cancel-lg" onClick={this.props.close}>Cancel</h2>
            <h1>It's FREE</h1>
            <h2>And we have approximately 500 users who will probably dislike you</h2>
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
        console.log(res);
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
  
    render() {
      return (
        <div>
          <div className="login-form-sm">
            <h2>Sign In</h2>
            <input name='login' onChange={this._textIn} type='text' placeholder="Login or Email" value={this.state.login} className='form-input-sm' />
            <input name='password' onChange={this._textIn} type='password' placeholder="Password" value={this.state.password} className='form-input-sm' />
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