import React, { Component } from 'react';
import LoginScreen from './screens/login';
import MainScreen from './screens/home';
import API, { SETUP } from './backyard/api';
import './App.css';
import './styles/cmgr.css';



class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
    }
  }

  async componentWillMount() {
    let session = await sessionStorage.getItem('user_data');
    let storage = await localStorage.getItem('user_data');
    if (session && !this.state.loggedIn) {
      this.setState({loggedIn: true});
    } else if (storage && !session) {
      this.setState({loggedIn: true});
      sessionStorage.setItem('user_data', session);
    }
  }

  componentDidMount() {
    if (window.location.pathname.includes('/token/')) {
      let arr = window.location.pathname.split('/');
      API('tokenConfirm', {token: arr[2], email: arr[4]}).then((res) => {
        if (res.ok) {
          alert('Congratulations, your email is confirmed, now you can log in');
        }
      })
    }
   
  }
  
  render() {
    if (this.state.loggedIn) {
      return (
        // <div className="App">
        //   <header className="header">
        //     {/* <i class="far fa-envelope messages-icon"></i> */}
        //     <img src={require('./img/menu.png')} className="menu-btn" alt="logo" onClick={() => this.setState({menuShown: !this.state.menuShown})} />
  
        //   </header>
  
  
        //   <div className="menu" style={{right: this.state.menuShown ? 0 + 'px' : -450 + 'px'}}>
        //     <div className="menuCnt" style={{right: this.state.menuShown ? 0 + 'px' : -450 + 'px'}} >
  
        //     </div>
        //   </div>
  
  
        // </div>
        <MainScreen />
        // null
      );
    } else {
      return (
       <LoginScreen />
      );
    }
  }
}

export default App;
