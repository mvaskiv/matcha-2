import React, { Component } from 'react';
import API from '../backyard/api';

class RegisterForm extends Component {
    constructor(props) {
      super(props);
      this.state = {
        count: 0,
        login: '',
        email: '',
        gender: '',
        seeking: '',
        dob: '1960-10-01',
      }
      this._bootstrapAsync();
    }

    _bootstrapAsync = () => {
      API('countUsers', {id: 0}).then((res) => {
        this.setState({count: res.data});
      });
    }
  
    _register = () => {
      console.log(this.state);
      API('registration', this.state).then((res) => {
        console.log(res);
        if (res.ok) {
          this.setState({success: true});
        }
      })
    }
  
    _textIn = (e) => {
      this.setState({[e.target.name]:e.target.value});
    }

    render() {
      return (
        <div className='mob-scroll'>
          <div className="login-form">
            <h2>Register</h2>
            {this.state.success ? 
              <div><h3 className='msg'>Check your inbox</h3>
              <h4>And follow the link we sent you in order to finish the registration process</h4></div>
              :
              <div>
              <input type='text' className='form-input' placeholder='Login' onChange={this._textIn} name='login' value={this.state.login} />
              <label>Email:</label>
              <input type='email' className='form-input' placeholder='john@doe.com' onChange={this._textIn} name='email' value={this.state.email}/>
              <br />
              <label>Date of Birth:</label>
              <input type='date' className='form-input' placeholder='Date of Birth' onChange={this._textIn} name='dob' value={this.state.dob}/>
              <label>Gender:</label>
              <div className='signup-sex'>
                <p onClick={() => this.setState({gender: 'M'})} className='third' style={{color: this.state.gender === 'M' ? '#e39' : '#999'}}>Male</p>
                <p>|</p>
                <p onClick={() => this.setState({gender: 'F'})} className='third'style={{color: this.state.gender === 'F' ? '#e39' : '#999'}}>Female</p>
              </div>
              <label>Looking for:</label>
              <div className='signup-sex'>
                <p onClick={() => this.setState({seeking: 'm'})} className='third' style={{color: this.state.seeking === 'm' ? '#e39' : '#999'}}>Men</p>
                <p onClick={() => this.setState({seeking: 'f'})} className='third'style={{color: this.state.seeking === 'f' ? '#e39' : '#999'}}>Women</p>
                <p onClick={() => this.setState({seeking: 'b'})} className='third'style={{color: this.state.seeking === 'b' ? '#e39' : '#999'}}>Both</p>
              </div>
              <h3 className="sign" onClick={this._register}>Sign Up</h3>
              </div>
            }
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
      console.log(this.state);
      API('login', this.state).then((res) => {
        if (res.ok) {
          console.log(res.data.status);
          if (res.data.status == 1) {
            sessionStorage.setItem('user_data', JSON.stringify(res.data));
            localStorage.setItem('user_data', JSON.stringify(res.data));
          } else {
            alert('You need to confirm your email address first');
          }
        } else {
          alert('Please, check your credentials');
        }
      })
      .then(() => window.location.reload())
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