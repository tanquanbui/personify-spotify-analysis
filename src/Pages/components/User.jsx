import React from "react";
import {useEffect, useState} from "react"
import '../../Styles/User.css'

const User = (props) => {
    const info = props.info
    console.log(info)
    return (
        <div className="user">
            <img className="img" src={props.images}></img>
            <h1 className="username">{info.display_name}</h1>
            <h1 className="username">{info.follower}</h1>
        </div>
    )
}

export default User;
