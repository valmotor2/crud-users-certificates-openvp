import React from "react";
import Loader from "react-loader-spinner";

const Loading = () => (
  <div>
    <p style={{ paddingLeft: 5 }}>Loading</p>
    <Loader style={{ width: "80", height: "80" }} type="Grid" color="#00BFFF" />
  </div>
);

export default Loading;
