import React from "react";
import results from "./axios";

class Auth extends React.Component {

    postDataHandler = (e) => {
        e.preventDefault();

        const data = {
            name : "John Doe",
            ID : "1"
        }

        results.post("/test.json", data).then(response =>{
            console.log(response);
        })
    }

    render() {
        return (
            <button className="ui login" onClick={ this.postDataHandler }>
                Log in
            </button>
        )
    }
}