import React from 'react'
import ReactDOM from 'react-dom'

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import "./assets/css/gem.css"
import "./assets/material-icon/material-icons.css"

let config = {
    apiKey: "AIzaSyD69fVmX1N539fYPjj4X2mu7hDR4LYAnL8",
    authDomain: "ycccamp.firebaseapp.com",
    databaseURL: "https://ycccamp.firebaseio.com",
    projectId: "ycccamp",
    storageBucket: "ycccamp.appspot.com",
    messagingSenderId: "191460697180"
};
firebase.initializeApp(config);
let firestore = firebase.firestore();

class App extends React.Component {
    state = {
        auth: undefined,
        data: undefined
    }

    componentDidMount(){
        firebase.auth().onAuthStateChanged(async user => {
            if(!user) return this.setState({ 
                auth: false
            })
            await this.setState({
                auth: user.uid
            });
            await firestore.collection("gemstone").doc(user.uid).onSnapshot(doc => {
                let data = doc.data();
                this.setState({
                    data: data,
                })
            });
            if(this.state.data === undefined){
                firestore.collection("campers").doc(user.uid).get().then(async doc => {
                    let data = doc.data();
                    await firestore.collection("gemstone").doc(user.uid).set({
                        pic: data.facebookPhotoURL,
                        name: data.facebookDisplayName,
                        major: data.major,
                        point: 0
                    });
                    this.setState({
                        data: data
                    });
                });
            }
        })
    }

    login(){
        let provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithRedirect(provider).then(result => {
            this.setState({
                auth: result.credential.accessToken
            });
        }).catch(err => {
            console.log(err);
        })
    }

    logout(){
        firebase.auth().signOut();
        this.setState({
            auth: false
        })
    }

    render(){
        if(this.state.auth === undefined){
            return(
                <>
                    <div id="background"></div>
                    <div id="gemstone">
                        <div id="loadscreen">
                            <div className="loader">
                                <svg className="circular" viewBox="25 25 50 50">
                                    <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
                                </svg>
                                <svg className="circular circular-shadow" viewBox="25 25 50 50">
                                    <circle className="path path-shadow" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </>
            )
        } else {
            return(
                <>
                    <div id="background"></div>
                    <div id="gemstone">
                        {this.state.data || this.state.auth === false ?
                            <>
                                {this.state.auth ?
                                    // authed
                                    <>
                                        <div id="card-wrapper">
                                            <div id='card-icon-wrapper'>
                                                <img id="profile-picture" alt={this.state.data.name} src={`${this.state.data.pic}?type=large`}></img>
                                            </div>
                                            <div id='card-body'>
                                                <h1 id="card-title">Gemstone</h1>
                                                <h1 id="point">{this.state.data.point}</h1>
                                                <h3 id="name">{this.state.auth}</h3>
                                            </div>
                                        </div>
                                        <div id="logout" onClick={() => this.logout()}>Logout</div>
                                    </>
                                    :
                                    // Haven't auth
                                    <div id="card-wrapper">
                                        <div id='card-icon-wrapper'>
                                            <i id="card-icon" className="material-icons">
                                                vpn_key
                                            </i>
                                        </div>
                                        <div id='card-body'>
                                            <h1 id="card-title">Point</h1>
                                            {this.state.auth !== undefined ?
                                                <button id="login-button" onClick={() => this.login()}>
                                                    <svg style={{marginRight:15}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                                                    Login
                                                </button>
                                            : null }
                                        </div>
                                    </div>
                                }
                            </> : null 
                        }
                    </div>
                </>
            )
        }
    }
}

ReactDOM.render(<App />, document.getElementById('root'));