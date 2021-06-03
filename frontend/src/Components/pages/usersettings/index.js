import React, { useState } from "react";
import ChangeUserInfo from "./changeuserinfo";
import DisplayUserInfo from "./displayuserinfo";
import { firebaseAuth } from "../../../firebase";

const UserInfoComponent = () => {
  const user = firebaseAuth.currentUser;
  if (user != null) {
    const [name, setName] = useState(user.displayName);
    const [email, setEmail] = useState(user.email);
    const [photoUrl, setPhotoUrl] = useState(user.photoURL);
    const emailVerified = user.emailVerified;
    const uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
    // this value to authenticate with your backend server, if
    // you have one. Use User.getToken() instead.

    const onChangeUserInfo = (newName, newPhotoUrl) => {
      setName(newName);
      setPhotoUrl(newPhotoUrl);
      setEmail(email);
    };

    return (
      <>
        <DisplayUserInfo
          name={name}
          email={email}
          photoUrl={photoUrl}
          emailVerified={emailVerified}
          uid={uid}
        />
        <ChangeUserInfo onChangeUserInfo={onChangeUserInfo} />
      </>
    );
  } else {
    return <div>No user stuff to display</div>;
  }
};

export default UserInfoComponent;
