import React, { Component } from 'react';
import API, { GEO, reverseGEO } from '../backyard/api';

const LoginPreg = /^[a-zA-Z0-9]+$/;
const LetterPreg = /^[a-zA-Z]+$/;
const TextPreg = /^[a-zA-Z0-9 ]+$/;
const PassPreg = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

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
        first_name: '',
        last_name: '',
        tags: 'RockNRoll',
        about: '',
        password: '',
        alert: false,
        part: false,
      }
      this._bootstrapAsync();
    }

    _EmailPreg() {
      let preg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return preg.test(String(this.state.email).toLowerCase());
    }

    _bootstrapAsync = () => {
      API('countUsers', {id: 0}).then((res) => {
        this.setState({count: res.data});
      });
    }

    _validationFirst = () => {
      if (!this.state.login || !LoginPreg.test(String(this.state.login).toLowerCase())) {
        this.setState({alert: true});
        return false;
      }
      if (!this.state.email || !this._EmailPreg()) {
        this.setState({alert: true, email: ''});
        return false;
      }
      if (!this.state.dob) {
        this.setState({alert: true});
        return false;
      }
      if (!this.state.gender) {
        this.setState({alert: true});
        return false;
      }
      if (!this.state.seeking) {
        this.setState({alert: true});
        return false;
      }
      return true;
    }
  
    _validationSecond = () => {
      if (!this.state.first_name || !LetterPreg.test(String(this.state.first_name).toLowerCase())) {
        this.setState({alert: true});
        console.log('name - no ok');
        return false;
      }
      if (!this.state.last_name || !LetterPreg.test(String(this.state.last_name).toLowerCase())) {
        this.setState({alert: true});
        console.log('ss name - no ok');
        return false;
      }
      if (!this.state.tags || !TextPreg.test(String(this.state.tags).toLowerCase())) {
        this.setState({alert: true});
        console.log('tags - no ok');
        return false;
      }
      if (!this.state.about || !TextPreg.test(String(this.state.about).toLowerCase())) {
        this.setState({alert: true});
        console.log('about - no ok');
        return false;
      }
      if (!this.state.password || !PassPreg.test(String(this.state.password))) {
        this.setState({alert: true, passWarn: true});
        console.log('pass - no ok');
        return false;
      }
      return true;
    }

    _register = () => {
      
      if (!this.state.first_name && this._validationFirst()) {
        GEO().then((res) => {
          reverseGEO(res).then((resq) => {
            this.setState({
              latitude: resq[0].lat,
              longitude: resq[0].lon,
            })
          })
        });
        this.setState({part: true, alert: false});
      } else if (this._validationSecond()) {
        API('registration', this.state).then((res) => {
          if (res.ok) {
            this.setState({success: true});
          } else if (res.error === "Bad login or email") {
            alert('Seems like this email is already registered with us or somebody has taken your login.');
          } else {
            alert('An Error occured. Please try again.');
          }
        })
        // console.log(this.state);
      }
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

              !this.state.part ?

              <div>
                <input type='text' className='form-input' placeholder='Login' onChange={this._textIn} name='login' value={this.state.login} style={{borderColor: this.state.alert === true & !this.state.login ? 'red' : '#ccc'}} />
                <label>Email: {this.state.alert === true & !this.state.email ? '*' : ''}</label>
                <input type='email' className='form-input' placeholder='john@doe.com' onChange={this._textIn} name='email' value={this.state.email} style={{borderColor: this.state.alert === true & !this.state.email ? 'red' : '#ccc'}}/>
                <br />
                <label>Date of Birth: {this.state.alert === true & !this.state.dob ? '*' : ''}</label>
                <input type='date' className='form-input' placeholder='Date of Birth' onChange={this._textIn} name='dob' value={this.state.dob}/>
                <label style={{color: this.state.alert === true & !this.state.gender ? 'red' : '#111'}}>Gender: {this.state.alert === true & !this.state.gender ? '*' : ''}</label>
                <div className='signup-sex'>
                  <p onClick={() => this.setState({gender: 'M'})} className='third' style={{color: this.state.gender === 'M' ? '#e39' : '#999'}}>Male</p>
                  <p>|</p>
                  <p onClick={() => this.setState({gender: 'F'})} className='third'style={{color: this.state.gender === 'F' ? '#e39' : '#999'}}>Female</p>
                </div>
                <label style={{color: this.state.alert === true & !this.state.seeking ? 'red' : '#111'}}>Looking for: {this.state.alert === true & !this.state.seeking ? '*' : ''}</label>
                <div className='signup-sex'>
                  <p onClick={() => this.setState({seeking: 'm'})} className='third' style={{color: this.state.seeking === 'm' ? '#e39' : '#999'}}>Men</p>
                  <p onClick={() => this.setState({seeking: 'f'})} className='third'style={{color: this.state.seeking === 'f' ? '#e39' : '#999'}}>Women</p>
                  <p onClick={() => this.setState({seeking: 'b'})} className='third'style={{color: this.state.seeking === 'b' ? '#e39' : '#999'}}>Both</p>
                </div>
                <h3 className="sign" style={{bottom: 20 + 'px'}} onClick={this._register}>Sign Up</h3>
              </div>

              :

              <div>
                <div className='settings-option-edit'>
                    <p>Name:</p>
                    <input type='text' value={this.state.first_name} placeholder='John' onChange={this._textIn} name='first_name' />
                </div>
                <div className='settings-option-edit' >
                    <p>Surname:</p>
                    <input type='text' value={this.state.last_name} placeholder='Doe' onChange={this._textIn} name='last_name'/>
                </div>
                <div className='settings-option-edit' >
                    <p>Interests:</p>
                    <input type='text' value={this.state.tags} placeholder='Separated by spaces' onChange={this._textIn} name='tags'/>
                </div>
                <div className='settings-option-edit lg'>
                    <p>About:</p>
                    <textarea type='text' value={this.state.about} onChange={this._textIn} name='about'/>
                </div>
                <div className='settings-option-edit' >
                    <p>Password:</p>
                    <input type='password' value={this.state.password} onChange={this._textIn} name='password'/>
                </div>
                {this.state.passWarn && <p style={{paddingTop: 10 + 'px', fontSize: 14}}>Must contain at least one digit, one upper and one lower case letter*</p>}
                <h3 className="sign" style={{bottom: 20 + 'px'}} onClick={this._register}>Sign Up</h3>
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
        forgot: false,
        email: '',
        dob: '0000-00-00',
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
      .then(() => window.location.replace('/'))
    }

    _textIn = (e) => {
      this.setState({[e.target.name]:e.target.value});
    }

    _keyPress = (e) => {
      if (e.key === 'Enter') {
        this._logIn();
      }
    }

    _forgot = () => {
      this.setState({forgot: !this.state.forgot});
    }

    _restorePass = () => {
      console.log('ressstore');
    }
  
    render() {
      return (
        <div>
          <div className="login-form-sm">
            <h2>{this.state.forgot ? 'Restore' : 'Sign In'}</h2> 
            {!this.state.forgot ? 
              <div>
                <input name='login' onChange={this._textIn} type='text' placeholder="Login or Email" value={this.state.login} className='form-input-sm' />
                <input name='password' onChange={this._textIn} type='password' placeholder="Password" value={this.state.password} className='form-input-sm' onKeyPress={this._keyPress} />
                <p className='forgot-pass' onClick={this._forgot}>Forgot Your Password ?</p>
              </div>
            :
              <div>
                <input name='email' onChange={this._textIn} type='email' placeholder="Login or Email" value={this.state.login} className='form-input-sm' />
                <input name='dob' onChange={this._textIn} type='date' value={this.state.dob} className='form-input-sm' />
                <p className='forgot-pass' onClick={this._forgot}>return</p>
              </div>
            }
            <h3 className="enter" onClick={this.state.forgot ? this._restorePass : this._logIn}>Enter</h3>
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